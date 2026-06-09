const express = require('express');
const router = express.Router();
const axios = require('axios'); // need to check if axios is installed

const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID || "64e762751e134d2193adae8b47740c7c";
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET || "c09fe9f970f94835ba1a355241eecc77";

let accessToken = null;
let tokenExpirationTime = null;

async function getAccessToken() {
  if (accessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
  const data = new URLSearchParams();
  data.append('grant_type', 'client_credentials');
  data.append('scope', 'basic'); // FatSecret API usually requires 'basic' scope for some premier features, or 'premier'

  const authHeader = 'Basic ' + Buffer.from(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`).toString('base64');

  try {
    // using built-in fetch if Node.js >= 18
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get FatSecret token:', errorText);
      throw new Error('Failed to get FatSecret token');
    }

    const json = await response.json();
    accessToken = json.access_token;
    // json.expires_in is usually 86400 (24 hours)
    tokenExpirationTime = Date.now() + (json.expires_in - 300) * 1000;
    return accessToken;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
}

// POST /api/fatsecret
router.post('/', async (req, res) => {
  try {
    const token = await getAccessToken();
    const apiUrl = 'https://platform.fatsecret.com/rest/server.api';
    
    // Copy all body params to query params, as FatSecret expects them (either form-urlencoded or query)
    const params = new URLSearchParams();
    for (const key in req.body) {
      params.append(key, req.body[key]);
    }
    params.append('format', 'json');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.text();
    
    if (!response.ok) {
      console.error('FatSecret API responded with error:', response.status, data);
      return res.status(response.status).send(data);
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
