// Vercel API Route for FatSecret API Proxy
const crypto = require('crypto');

// FatSecret API Configuration
const FATSECRET_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

// OAuth 1.0 utilities
function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function createSignatureBaseString(method, url, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  return `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
}

function createSignature(signatureBaseString, consumerSecret) {
  return crypto
    .createHmac('sha1', consumerSecret + '&')
    .update(signatureBaseString)
    .digest('base64');
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { method, ...params } = req.body;
    
    if (!method) {
      return res.status(400).json({ error: 'Method parameter is required' });
    }

    // Get credentials from environment
    const consumerKey = process.env.FATSECRET_CLIENT_ID;
    const consumerSecret = process.env.FATSECRET_CLIENT_SECRET;

    if (!consumerKey || !consumerSecret) {
      return res.status(400).json({ error: 'FatSecret API credentials are required' });
    }

    // Prepare OAuth parameters (without method for signature)
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: generateTimestamp(),
      oauth_version: '1.0'
    };

    // Prepare all parameters for the request
    const allParams = {
      ...oauthParams,
      method: method,
      format: 'json',
      ...params
    };

    // Create signature using all parameters
    const signatureBaseString = createSignatureBaseString('POST', FATSECRET_BASE_URL, allParams);
    const signature = createSignature(signatureBaseString, consumerSecret);
    allParams.oauth_signature = signature;

    console.log('Proxying FatSecret API request:', method, params);

    // Make request to FatSecret API
    const formData = new URLSearchParams(allParams);
    const response = await fetch(FATSECRET_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    console.log('FatSecret API response status:', response.status);
    
    const data = await response.json();
    
    // Return the response
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
}
