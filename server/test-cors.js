// Test script to verify backend API and CORS configuration
const https = require('https');

const testEndpoints = [
  'https://blog-backend-4h1f.onrender.com/api/health',
  'https://blog-backend-4h1f.onrender.com/api/posts'
];

async function testAPI() {
  console.log('🧪 Testing Backend API...\n');
  
  for (const url of testEndpoints) {
    try {
      console.log(`Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Origin': 'https://blog-frontend-w9yl.onrender.com',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`CORS Headers:`);
      console.log(`  Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
      console.log(`  Access-Control-Allow-Methods: ${response.headers.get('Access-Control-Allow-Methods')}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        console.log(`❌ Error: ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

// For Node.js environments that don't have fetch
global.fetch = require('node-fetch');

testAPI().catch(console.error);
