#!/bin/bash

# EU Green Deal Document Embedding Progress Monitor

echo "🚀 EU Green Deal Document Embedding Progress Monitor"
echo "============================================================"
echo "📁 Total documents to process: 26"
echo "📋 Expected total chunks: ~8,000-10,000"
echo "⏱️  Estimated completion time: 2-3 hours"
echo "============================================================"

start_time=$(date +%s)
last_chunk_count=0

while true; do
    current_time=$(date +"%H:%M:%S")
    elapsed=$(($(date +%s) - start_time))
    elapsed_formatted=$(printf "%02d:%02d:%02d" $((elapsed/3600)) $(((elapsed%3600)/60)) $((elapsed%60)))
    
    # Get current counts from database
    doc_count=$(docker compose exec postgres psql -U postgres -d eu_green_chatbot -t -c "SELECT COUNT(*) FROM documents;" 2>/dev/null | tr -d ' \n')
    chunk_count=$(docker compose exec postgres psql -U postgres -d eu_green_chatbot -t -c "SELECT COUNT(*) FROM document_chunks;" 2>/dev/null | tr -d ' \n')
    
    # Get latest document info
    latest_info=$(docker compose exec postgres psql -U postgres -d eu_green_chatbot -t -c "
        SELECT d.filename || '|' || COUNT(dc.id) 
        FROM documents d 
        LEFT JOIN document_chunks dc ON d.id = dc.document_id 
        WHERE d.processed_date IS NOT NULL 
        GROUP BY d.id, d.filename, d.processed_date 
        ORDER BY d.processed_date DESC 
        LIMIT 1;" 2>/dev/null | tr -d ' \n')
    
    # Parse latest document info
    if [[ "$latest_info" == *"|"* ]]; then
        latest_doc=$(echo "$latest_info" | cut -d'|' -f1)
        latest_chunks=$(echo "$latest_info" | cut -d'|' -f2)
    else
        latest_doc="None"
        latest_chunks=0
    fi
    
    # Calculate processing rate
    if [ -n "$chunk_count" ] && [ "$chunk_count" -gt "$last_chunk_count" ]; then
        rate=$(echo "scale=1; ($chunk_count - $last_chunk_count) / 30" | bc 2>/dev/null || echo "0.0")
    else
        rate="0.0"
    fi
    
    # Clear screen and display progress
    clear
    echo "🚀 EU Green Deal Document Embedding Progress Monitor"
    echo "============================================================"
    echo "⏰ Current Time: $current_time"
    echo "⏱️  Elapsed Time: $elapsed_formatted"
    echo "📊 Processing Rate: ${rate} chunks/sec"
    echo "============================================================"
    echo "📄 Documents Completed: ${doc_count:-0}/26"
    echo "📝 Total Chunks Processed: ${chunk_count:-0}"
    
    if [ "$latest_doc" != "None" ]; then
        echo "🔄 Latest Document: $latest_doc"
        echo "📋 Chunks in Latest Doc: $latest_chunks"
    fi
    
    # Progress bar for documents
    if [ -n "$doc_count" ] && [ "$doc_count" -gt 0 ]; then
        progress=$((doc_count * 100 / 26))
        bar_filled=$((progress / 5))
        bar_empty=$((20 - bar_filled))
        bar=$(printf "█%.0s" $(seq 1 $bar_filled))$(printf "░%.0s" $(seq 1 $bar_empty))
        echo "📈 Document Progress: [$bar] ${progress}%"
    else
        echo "📈 Document Progress: [░░░░░░░░░░░░░░░░░░░░] 0%"
    fi
    
    # Estimate completion
    if [ -n "$chunk_count" ] && [ "$chunk_count" -gt 100 ] && [ "$rate" != "0.0" ]; then
        estimated_total=8500
        remaining=$((estimated_total - chunk_count))
        if [ "$remaining" -gt 0 ]; then
            eta_seconds=$(echo "scale=0; $remaining / $rate" | bc 2>/dev/null)
            if [ -n "$eta_seconds" ] && [ "$eta_seconds" -gt 0 ]; then
                eta_hours=$((eta_seconds / 3600))
                eta_minutes=$(((eta_seconds % 3600) / 60))
                echo "⏳ Estimated Time Remaining: $(printf "%02d:%02d" $eta_hours $eta_minutes)"
            fi
        fi
    fi
    
    echo "============================================================"
    
    # Check if complete
    if [ -n "$doc_count" ] && [ "$doc_count" -ge 26 ]; then
        echo "🎉 ALL DOCUMENTS PROCESSED! 🎉"
        echo "✅ The chatbot is now ready to use with embedded knowledge!"
        echo "🤖 You can now test the agent with queries about EU Green Deal policies."
        break
    fi
    
    echo "💡 Press Ctrl+C to stop monitoring"
    echo "🔄 Next update in 30 seconds..."
    
    last_chunk_count=${chunk_count:-0}
    
    # Wait 30 seconds or exit on Ctrl+C
    sleep 30 || break
done