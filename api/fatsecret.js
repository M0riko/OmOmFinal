// Vercel API Route for FatSecret API Proxy
import crypto from 'crypto';

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
  // Handle both Vercel and Express request formats
  if (req.method && req.url) {
    // Express format
    return handleRequest(req, res);
  } else {
    // Vercel format
    return handleVercelRequest(req, res);
  }
}

async function handleRequest(req, res) {
  // Express request handler
  return handleVercelRequest(req, res);
}

async function handleVercelRequest(req, res) {
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
    // Parse the request body - it comes as URL-encoded data
    let method, params = {};
    
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      // Parse URL-encoded data
      if (req.body && typeof req.body === 'object') {
        // Express has already parsed the body
        method = req.body.method;
        params = { ...req.body };
        delete params.method;
      } else {
        // Raw body parsing
        const body = await req.text();
        const urlParams = new URLSearchParams(body);
        method = urlParams.get('method');
        
        // Extract all other parameters
        for (const [key, value] of urlParams.entries()) {
          if (key !== 'method') {
            params[key] = value;
          }
        }
      }
    } else {
      // Parse JSON data
      if (req.body && typeof req.body === 'object') {
        // Express has already parsed the body
        method = req.body.method;
        params = { ...req.body };
        delete params.method;
      } else {
        // Raw body parsing
        const body = await req.json();
        method = body.method;
        params = { ...body };
        delete params.method;
      }
    }
    
    if (!method) {
      return res.status(400).json({ error: 'Method parameter is required' });
    }

    // Get credentials from environment with fallback
    const consumerKey = process.env.FATSECRET_CLIENT_ID || "64e762751e134d2193adae8b47740c7c";
    const consumerSecret = process.env.FATSECRET_CLIENT_SECRET || "c09fe9f970f94835ba1a355241eecc77";

    console.log('Environment check:');
    console.log('- FATSECRET_CLIENT_ID:', process.env.FATSECRET_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('- FATSECRET_CLIENT_SECRET:', process.env.FATSECRET_CLIENT_SECRET ? 'SET' : 'NOT SET');
    console.log('- Using consumer key:', consumerKey.substring(0, 8) + '...');

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
    console.log('OAuth params:', oauthParams);
    console.log('OAuth signature:', signature);
    console.log('All params keys:', Object.keys(allParams));
    console.log('Has oauth_consumer_key:', 'oauth_consumer_key' in allParams);
    console.log('Has oauth_signature:', 'oauth_signature' in allParams);

    // Make request to FatSecret API
    const formData = new URLSearchParams(allParams);
    console.log('Form data:', formData.toString());
    console.log('Form data has oauth_consumer_key:', formData.has('oauth_consumer_key'));
    console.log('Form data has oauth_signature:', formData.has('oauth_signature'));
    
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
