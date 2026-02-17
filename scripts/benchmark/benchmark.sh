#!/bin/bash

# Velist Framework Benchmark Script
# Using wrk on Mac Mini M4
# 
# Requirements: wrk (brew install wrk)

set -e

SERVER_URL="http://localhost:3000"
HEALTH_ENDPOINT="$SERVER_URL/health"
DASHBOARD_API="$SERVER_URL/dashboard/api/stats"

echo "=================================="
echo "Velist Framework Benchmark"
echo "Device: Mac Mini M4"
echo "Date: $(date)"
echo "=================================="
echo ""

# Check if server is running
echo "🔍 Checking if server is running at $SERVER_URL..."
if ! curl -s "$HEALTH_ENDPOINT" > /dev/null; then
    echo "❌ Server not running!"
    echo "Please start with: bun run build && bun run start"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Get system info
echo "📊 System Information:"
echo "  CPU: $(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo 'N/A')"
echo "  Cores: $(sysctl -n hw.ncpu 2>/dev/null || echo 'N/A')"
echo "  Memory: $(echo "scale=2; $(sysctl -n hw.memsize 2>/dev/null || echo 0) / 1024 / 1024 / 1024" | bc 2>/dev/null || echo 'N/A') GB"
echo "  Bun Version: $(bun --version)"
echo ""

# Warm up
echo "🔥 Warming up server..."
wrk -t2 -c10 -d5s "$HEALTH_ENDPOINT" > /dev/null 2>&1
echo "✅ Warmup complete"
echo ""

# Benchmark 1: Hello World (Health Check) - JSON Response
echo "=================================="
echo "Benchmark 1: Health Check (JSON)"
echo "  This is the simplest endpoint - returns {status: 'ok'}"
echo "=================================="
echo ""

echo "🚀 Testing with 12 threads, 400 connections, 30 seconds..."
wrk -t12 -c400 -d30s --latency "$HEALTH_ENDPOINT" 2>/dev/null | tee /tmp/benchmark_health.txt
echo ""

# Extract RPS
HEALTH_RPS=$(grep "Requests/sec:" /tmp/benchmark_health.txt | awk '{print $2}')
HEALTH_LATENCY_AVG=$(grep "Latency" /tmp/benchmark_health.txt | head -1 | awk '{print $2}')

echo "📈 Health Check Summary:"
echo "  RPS: $HEALTH_RPS"
echo "  Avg Latency: $HEALTH_LATENCY_AVG"
echo ""

# Benchmark 2: Auth API (protected endpoint with JWT verification)
echo "=================================="
echo "Benchmark 2: Protected API (with auth)"
echo "  Dashboard stats endpoint - requires JWT verification"
echo "=================================="
echo ""

# First, login to get token
echo "🔑 Getting auth token..."
LOGIN_RESPONSE=$(curl -s -X POST "$SERVER_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"password123"}' \
    -c /tmp/benchmark_cookies.txt)
echo "✅ Logged in"
echo ""

echo "🚀 Testing with 12 threads, 100 connections, 30 seconds..."
wrk -t12 -c100 -d30s --latency \
    -H "Cookie: $(cat /tmp/benchmark_cookies.txt | grep session | awk '{print $6"="$7}' | head -1)" \
    "$DASHBOARD_API" 2>/dev/null | tee /tmp/benchmark_auth.txt
echo ""

AUTH_RPS=$(grep "Requests/sec:" /tmp/benchmark_auth.txt | awk '{print $2}' || echo "N/A")
AUTH_LATENCY_AVG=$(grep "Latency" /tmp/benchmark_auth.txt | head -1 | awk '{print $2}' || echo "N/A")

echo "📈 Protected API Summary:"
echo "  RPS: $AUTH_RPS"
echo "  Avg Latency: $AUTH_LATENCY_AVG"
echo ""

# Benchmark 3: Different connection levels
echo "=================================="
echo "Benchmark 3: Connection Scalability Test"
echo "  Testing different connection counts"
echo "=================================="
echo ""

for CONN in 10 100 1000; do
    echo "Testing with $CONN connections..."
    wrk -t12 -c$CONN -d10s "$HEALTH_ENDPOINT" 2>/dev/null | grep "Requests/sec:"
done
echo ""

# Final Summary
echo "=================================="
echo "📊 FINAL BENCHMARK RESULTS"
echo "=================================="
echo ""
echo "Device: Mac Mini M4"
echo "Framework: Velist (Elysia + Bun)"
echo "Date: $(date)"
echo ""
echo "Health Check (Hello World):"
echo "  RPS: $HEALTH_RPS requests/sec"
echo "  Avg Latency: $HEALTH_LATENCY_AVG"
echo ""
echo "Protected API (JWT Auth):"
echo "  RPS: $AUTH_RPS requests/sec"
echo "  Avg Latency: $AUTH_LATENCY_AVG"
echo ""
echo "=================================="
echo "✅ Benchmark complete!"
echo "=================================="

# Cleanup
rm -f /tmp/benchmark_*.txt /tmp/benchmark_cookies.txt
