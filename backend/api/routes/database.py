"""
Database management and visualization endpoints
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, func
from pydantic import BaseModel

from core.database import get_db
from core.logging_config import get_logger
# from services.graphiti_service import get_graphiti_service  # Disabled - using PostgreSQL RAG instead

logger = get_logger(__name__)
router = APIRouter()


class DatabaseStats(BaseModel):
    """Database statistics model"""
    total_tables: int
    total_records: int
    database_size: str
    last_updated: datetime
    table_stats: List[Dict[str, Any]]


class TableInfo(BaseModel):
    """Table information model"""
    table_name: str
    row_count: int
    size: str
    columns: List[str]


@router.get("/stats", response_model=DatabaseStats)
async def get_database_stats(db: AsyncSession = Depends(get_db)):
    """Get comprehensive database statistics"""
    try:
        # Get table information
        tables_query = """
        SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
            (SELECT COUNT(*) FROM information_schema.columns 
             WHERE table_schema = schemaname AND table_name = tablename) as column_count
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        """
        
        result = await db.execute(text(tables_query))
        tables = result.fetchall()
        
        table_stats = []
        total_records = 0
        
        for table in tables:
            # Get row count for each table
            try:
                count_result = await db.execute(text(f"SELECT COUNT(*) FROM {table.tablename}"))
                row_count = count_result.scalar()
                total_records += row_count
                
                table_stats.append({
                    "table_name": table.tablename,
                    "row_count": row_count,
                    "size": table.size,
                    "column_count": table.column_count
                })
            except Exception as e:
                logger.warning(f"Could not get count for table {table.tablename}: {e}")
                table_stats.append({
                    "table_name": table.tablename,
                    "row_count": 0,
                    "size": table.size,
                    "column_count": table.column_count
                })
        
        # Get database size
        db_size_result = await db.execute(text("SELECT pg_size_pretty(pg_database_size(current_database()))"))
        db_size = db_size_result.scalar()
        
        return DatabaseStats(
            total_tables=len(tables),
            total_records=total_records,
            database_size=db_size,
            last_updated=datetime.utcnow(),
            table_stats=table_stats
        )
        
    except Exception as e:
        logger.error(f"Error getting database stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get database statistics")


@router.get("/tables")
async def list_tables(db: AsyncSession = Depends(get_db)):
    """List all tables in the database"""
    try:
        query = """
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
        """
        
        result = await db.execute(text(query))
        tables = result.fetchall()
        
        return [{"name": table.table_name, "type": table.table_type} for table in tables]
        
    except Exception as e:
        logger.error(f"Error listing tables: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to list tables")


@router.get("/table/{table_name}")
async def get_table_info(table_name: str, db: AsyncSession = Depends(get_db)):
    """Get detailed information about a specific table"""
    try:
        # Get column information
        columns_query = """
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = :table_name
        ORDER BY ordinal_position;
        """
        
        result = await db.execute(text(columns_query), {"table_name": table_name})
        columns = result.fetchall()
        
        if not columns:
            raise HTTPException(status_code=404, detail="Table not found")
        
        # Get row count
        count_result = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        row_count = count_result.scalar()
        
        # Get table size
        size_result = await db.execute(text(f"SELECT pg_size_pretty(pg_total_relation_size('{table_name}'))"))
        size = size_result.scalar()
        
        return {
            "table_name": table_name,
            "row_count": row_count,
            "size": size,
            "columns": [
                {
                    "name": col.column_name,
                    "type": col.data_type,
                    "nullable": col.is_nullable == "YES",
                    "default": col.column_default
                }
                for col in columns
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting table info: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get table information")


@router.get("/table/{table_name}/data")
async def get_table_data(
    table_name: str,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Get data from a specific table with pagination"""
    try:
        # Validate table exists
        check_query = """
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = :table_name
        """
        
        result = await db.execute(text(check_query), {"table_name": table_name})
        if result.scalar() == 0:
            raise HTTPException(status_code=404, detail="Table not found")
        
        # Get data with pagination
        data_query = f"SELECT * FROM {table_name} ORDER BY 1 LIMIT :limit OFFSET :offset"
        result = await db.execute(text(data_query), {"limit": limit, "offset": offset})
        
        # Convert to list of dictionaries
        rows = result.fetchall()
        columns = result.keys()
        
        data = []
        for row in rows:
            row_dict = {}
            for i, col in enumerate(columns):
                value = row[i]
                # Convert datetime objects to ISO strings
                if isinstance(value, datetime):
                    value = value.isoformat()
                row_dict[col] = value
            data.append(row_dict)
        
        # Get total count
        total_result = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        total_count = total_result.scalar()
        
        return {
            "table_name": table_name,
            "data": data,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": total_count,
                "has_more": offset + limit < total_count
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting table data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get table data")


@router.get("/chat-analytics")
async def get_chat_analytics(
    days: int = Query(default=7, ge=1, le=30),
    db: AsyncSession = Depends(get_db)
):
    """Get chat analytics for the specified number of days"""
    try:
        since_date = datetime.utcnow() - timedelta(days=days)
        
        # Get message statistics
        messages_query = """
        SELECT 
            DATE(timestamp) as date,
            COUNT(*) as total_messages,
            COUNT(*) FILTER (WHERE role = 'user') as user_messages,
            COUNT(*) FILTER (WHERE role = 'assistant') as bot_messages,
            AVG(confidence) as avg_confidence,
            AVG(response_time_ms) as avg_response_time
        FROM chat_messages
        WHERE timestamp >= :since_date
        GROUP BY DATE(timestamp)
        ORDER BY date DESC;
        """
        
        result = await db.execute(text(messages_query), {"since_date": since_date})
        daily_stats = result.fetchall()
        
        # Get session statistics
        sessions_query = """
        SELECT 
            COUNT(DISTINCT session_id) as total_sessions,
            AVG(message_count) as avg_messages_per_session
        FROM (
            SELECT session_id, COUNT(*) as message_count
            FROM chat_messages
            WHERE timestamp >= :since_date
            GROUP BY session_id
        ) session_counts;
        """
        
        result = await db.execute(text(sessions_query), {"since_date": since_date})
        session_stats = result.fetchone()
        
        # Get top queries
        queries_query = """
        SELECT content, COUNT(*) as frequency
        FROM chat_messages
        WHERE role = 'user' AND timestamp >= :since_date
        GROUP BY content
        ORDER BY frequency DESC
        LIMIT 10;
        """
        
        result = await db.execute(text(queries_query), {"since_date": since_date})
        top_queries = result.fetchall()
        
        return {
            "period_days": days,
            "daily_statistics": [
                {
                    "date": stat.date.isoformat(),
                    "total_messages": stat.total_messages,
                    "user_messages": stat.user_messages,
                    "bot_messages": stat.bot_messages,
                    "avg_confidence": float(stat.avg_confidence) if stat.avg_confidence else 0,
                    "avg_response_time": float(stat.avg_response_time) if stat.avg_response_time else 0
                }
                for stat in daily_stats
            ],
            "session_statistics": {
                "total_sessions": session_stats.total_sessions or 0,
                "avg_messages_per_session": float(session_stats.avg_messages_per_session) if session_stats.avg_messages_per_session else 0
            },
            "top_queries": [
                {
                    "query": query.content,
                    "frequency": query.frequency
                }
                for query in top_queries
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting chat analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get chat analytics")


# @router.get("/knowledge-graph-stats")
# async def get_knowledge_graph_stats():
#     """Get Graphiti knowledge graph statistics"""
#     # Disabled - using PostgreSQL RAG instead of Graphiti
#     raise HTTPException(status_code=501, detail="Knowledge graph stats not implemented - using PostgreSQL RAG")


@router.get("/system-health")
async def get_system_health(db: AsyncSession = Depends(get_db)):
    """Get comprehensive system health information"""
    try:
        # Database connectivity
        db_check = await db.execute(text("SELECT 1"))
        db_healthy = db_check.scalar() == 1
        
        # Get database version
        version_result = await db.execute(text("SELECT version()"))
        db_version = version_result.scalar()
        
        # Get active connections
        connections_result = await db.execute(text("SELECT count(*) FROM pg_stat_activity"))
        active_connections = connections_result.scalar()
        
        # Get knowledge graph stats - Disabled (using PostgreSQL RAG)
        kg_stats = {"status": "disabled", "note": "Using PostgreSQL RAG instead"}
        kg_healthy = True  # Always healthy since we're not using it
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "healthy": db_healthy,
                "version": db_version,
                "active_connections": active_connections
            },
            "knowledge_graph": {
                "healthy": kg_healthy,
                "stats": kg_stats
            },
            "overall_status": "healthy" if db_healthy and kg_healthy else "degraded"
        }
        
    except Exception as e:
        logger.error(f"Error getting system health: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get system health")