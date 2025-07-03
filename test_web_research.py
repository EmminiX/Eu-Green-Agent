#!/usr/bin/env python3
"""
Test script to verify Tavily and Firecrawl integration
and multi-agent system with verification capabilities
"""

import os
import sys
import asyncio
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

async def test_web_research_agent():
    """Test the Web Research Agent with Tavily and Firecrawl"""
    try:
        from agents.web_research_agent import WebResearchAgent
        from core.config import get_settings
        
        print("🔍 Testing Web Research Agent...")
        
        # Check if API keys are available
        settings = get_settings()
        print(f"📊 Tavily API Key: {'✅ Present' if settings.TAVILY_API_KEY else '❌ Missing'}")
        print(f"📊 Firecrawl API Key: {'✅ Present' if settings.FIRECRAWL_API_KEY else '❌ Missing'}")
        
        # Initialize agent
        agent = WebResearchAgent()
        print("✅ Web Research Agent initialized successfully")
        
        # Test basic web search
        print("\n🌐 Testing web search functionality...")
        query = "European Green Deal latest updates 2024"
        results = await agent.search_web(query, max_results=3)
        
        print(f"📋 Found {len(results)} web search results")
        for i, result in enumerate(results[:2], 1):
            print(f"  {i}. {result.get('title', 'No title')[:80]}...")
            print(f"     URL: {result.get('url', 'No URL')}")
            print(f"     Score: {result.get('score', 0):.2f}")
        
        # Test EU-specific search
        print("\n🏛️ Testing EU-specific search...")
        eu_results = await agent.search_eu_official_sources("CBAM regulation implementation")
        print(f"📋 Found {len(eu_results)} EU official results")
        
        # Test verification functionality
        print("\n🔎 Testing information verification...")
        mock_rag_results = [
            {
                "content": "The European Green Deal aims to make the EU climate neutral by 2050",
                "source": "knowledge_base",
                "similarity_score": 0.9
            }
        ]
        
        verification_report = await agent.verify_information(
            rag_results=mock_rag_results,
            query="European Green Deal climate neutrality target",
            max_web_results=2
        )
        
        print(f"✅ Verification completed:")
        print(f"   Confidence Score: {verification_report.get('confidence_score', 0):.1%}")
        print(f"   Recommendation: {verification_report.get('recommendation', 'unknown')}")
        print(f"   Updates Found: {len(verification_report.get('updates_found', []))}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Web Research Agent: {e}")
        return False

async def test_orchestrator_integration():
    """Test the full orchestrator with verification"""
    try:
        from agents.orchestrator import OrchestratorAgent
        
        print("\n🎭 Testing Enhanced Orchestrator Agent...")
        
        orchestrator = OrchestratorAgent()
        print("✅ Orchestrator Agent initialized successfully")
        
        # Test a query that should trigger verification
        print("\n📝 Testing query processing with verification...")
        query = "What are the latest CBAM requirements for 2024?"
        
        response = await orchestrator.process_query(
            query=query,
            language="en"
        )
        
        print(f"✅ Query processed successfully:")
        print(f"   Response length: {len(response.get('response', ''))} characters")
        print(f"   Sources found: {response.get('knowledge_used', 0)} knowledge + {response.get('web_research_used', 0)} web")
        print(f"   Confidence: {response.get('confidence', 0):.1%}")
        print(f"   Language: {response.get('language', 'unknown')}")
        
        # Show first part of response
        response_text = response.get('response', '')
        if response_text:
            print(f"\n📋 Response preview:")
            print(f"   {response_text[:200]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Orchestrator: {e}")
        return False

async def test_simple_orchestrator():
    """Test the currently used Simple Orchestrator"""
    try:
        from agents.simple_orchestrator import get_simple_orchestrator
        
        print("\n🎯 Testing Simple Orchestrator (Currently Used)...")
        
        orchestrator = get_simple_orchestrator()
        print("✅ Simple Orchestrator initialized successfully")
        
        # Test with some mock context (simulating RAG results)
        mock_context = {
            "rag_context": [
                {
                    "content": "The European Green Deal is a comprehensive strategy...",
                    "source": "EU Green Deal Communication",
                    "similarity": 0.85
                }
            ]
        }
        
        response = await orchestrator.process_query(
            query="What is the European Green Deal?",
            language="en",
            context=mock_context
        )
        
        print(f"✅ Simple Orchestrator response:")
        print(f"   Response length: {len(response.get('response', ''))} characters")
        print(f"   Language: {response.get('language', 'en')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Simple Orchestrator: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all tests"""
    print("🚀 Starting EU Green Policies Chatbot Agent Tests\n")
    
    # Test individual components
    web_research_ok = await test_web_research_agent()
    simple_orch_ok = await test_simple_orchestrator()
    
    # Test enhanced orchestrator if available
    try:
        enhanced_orch_ok = await test_orchestrator_integration()
    except Exception:
        print("\n⚠️ Enhanced Orchestrator not fully functional (expected)")
        enhanced_orch_ok = False
    
    print(f"\n📊 Test Results Summary:")
    print(f"   Web Research Agent: {'✅ PASS' if web_research_ok else '❌ FAIL'}")
    print(f"   Simple Orchestrator: {'✅ PASS' if simple_orch_ok else '❌ FAIL'}")
    print(f"   Enhanced Orchestrator: {'✅ PASS' if enhanced_orch_ok else '⚠️ NOT READY'}")
    
    if web_research_ok and simple_orch_ok:
        print("\n🎉 Core system is functional!")
        if enhanced_orch_ok:
            print("🌟 Enhanced verification system is ready!")
        else:
            print("💡 Enhanced features available for activation when needed.")
    else:
        print("\n⚠️ Some components need attention.")

if __name__ == "__main__":
    asyncio.run(main())