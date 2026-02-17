#!/bin/bash

# Velist Framework Real Benchmark - Mac Mini M4
# Using wrk for accurate performance testing

set -e

SERVER_URL="http://localhost:3000"
TEXT_ENDPOINT="$SERVER_URL/bench/text"
JSON_ENDPOINT="$SERVER_URL/bench/json"

echo "=================================="
echo "🚀 Velist Framework Benchmark"
echo "=================================="
echo "Device: Mac Mini M4"
echo "Date: $(date)"
echo "Bun Version: $(bun --version)"
echo ""

# Check server
echo "🔍 Checking server..."
if ! curl -s "$TEXT_ENDPOINT" > /dev/null; then
    echo "❌ Server not running at $SERVER_URL"
    echo "Start with: NODE_ENV=production bun src/bootstrap.ts"
    exit 1
fi
echo "✅ Server ready"
echo ""

# Get system info
echo "📊 System Specs:"
echo "  CPU: $(sysctl -n machdep.cpu.brand_string 2>/dev/null)"
echo "  Cores: $(sysctl -n hw.ncpu 2>/dev/null)"
echo "  Memory: $(echo "scale=1; $(sysctl -n hw.memsize) / 1024 / 1024 / 1024" | bc) GB"
echo ""

# Warm up
echo "🔥 Warming up..."
wrk -t2 -c10 -d3s "$TEXT_ENDPOINT" > /dev/null 2>&1
echo "✅ Done"
echo ""

# Benchmark 1: Plain Text (fastest possible)
echo "=================================="
echo "Test 1: Hello World (Plain Text)"
echo "Endpoint: GET /bench/text"
echo "=================================="
wrk -t12 -c400 -d30s --latency "$TEXT_ENDPOINT" 2>/dev/null
echo ""

# Benchmark 2: JSON Response
echo "=================================="
echo "Test 2: Hello World (JSON)"
echo "Endpoint: GET /bench/json"
echo "=================================="
wrk -t12 -c400 -d30s --latency "$JSON_ENDPOINT" 2>/dev/null
echo ""

# Benchmark 3: Different loads
echo "=================================="
echo "Test 3: Scalability (Plain Text)"
echo "=================================="
for conn in 10 100 1000; do
    echo ""
    echo "Connections: $conn"
    wrk -t12 -c$conn -d10s "$TEXT_ENDPOINT" 2>/dev/null | grep -E "(Requests/sec|Latency|Transfer/sec)"
done

echo ""
echo "=================================="
echo "✅ Benchmark Complete!"
echo "=================================="
