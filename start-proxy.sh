#!/bin/bash
echo "🚀 Starting FatSecret API Proxy Server..."
echo "📡 Proxy will be available at: http://localhost:3001/api/fatsecret"
echo "🔑 Using FatSecret Premier API credentials"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the proxy server
node api/fatsecret-proxy.js
