#!/usr/bin/env node

// FatSecret Premier API Setup Script
import fs from 'fs';
import path from 'path';

console.log('🚀 Setting up FatSecret Premier API Integration...\n');

// Check if required dependencies are installed
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['express', 'cors', 'axios'];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]);

if (missingDeps.length > 0) {
  console.log('📦 Installing missing dependencies...');
  console.log(`Missing: ${missingDeps.join(', ')}`);
  console.log('Please run: npm install express cors axios concurrently\n');
}

// Create environment file template
const envTemplate = `# FatSecret Premier API Configuration
FATSECRET_CLIENT_ID=64e762751e134d2193adae8b47740c7c
FATSECRET_CLIENT_SECRET=c09fe9f970f94835ba1a355241eecc77
PORT=3001

# Proxy server configuration
PROXY_URL=http://localhost:3001/api/fatsecret
`;

if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', envTemplate);
  console.log('✅ Created .env file with FatSecret API credentials');
} else {
  console.log('⚠️  .env file already exists - please add FatSecret credentials manually');
}

// Create proxy server startup script
const proxyScript = `#!/bin/bash
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
`;

fs.writeFileSync('start-proxy.sh', proxyScript);
fs.chmodSync('start-proxy.sh', '755');

console.log('✅ Created start-proxy.sh script');

// Create development script
const devScript = `#!/bin/bash
echo "🚀 Starting OMOMO with FatSecret Premier API..."
echo ""

# Start both proxy and dev server
npm run dev:full
`;

fs.writeFileSync('start-dev.sh', devScript);
fs.chmodSync('start-dev.sh', '755');

console.log('✅ Created start-dev.sh script');

// Update package.json scripts if needed
if (!packageJson.scripts.proxy) {
  packageJson.scripts.proxy = 'node api/fatsecret-proxy.js';
  packageJson.scripts['dev:full'] = 'concurrently "npm run proxy" "npm run dev"';
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with proxy scripts');
}

console.log('\n🎉 FatSecret Premier API setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start proxy server: npm run proxy (or ./start-proxy.sh)');
console.log('3. Start development: npm run dev:full (or ./start-dev.sh)');
console.log('\n🔧 Available scripts:');
console.log('- npm run proxy - Start FatSecret API proxy server');
console.log('- npm run dev - Start Vite development server');
console.log('- npm run dev:full - Start both proxy and dev server');
console.log('\n🌐 API Endpoints:');
console.log('- Proxy: http://localhost:3001/api/fatsecret');
console.log('- Health: http://localhost:3001/api/health');
console.log('\n🇺🇦 Ukrainian localization is enabled by default');
console.log('🔑 FatSecret Premier API credentials are configured');
console.log('\n✨ Enjoy your FatSecret Premier API integration!');
