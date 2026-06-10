const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'omom-super-secret-key';

// Middleware to verify our app's JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// Ensure this matches exactly with the callback URL registered in Spotify Developer Dashboard
const REDIRECT_URI = process.env.VITE_API_BASE_URL && !process.env.VITE_API_BASE_URL.includes('localhost')
  ? `${process.env.VITE_API_BASE_URL.replace('/api', '')}/spotify-callback` // naive guess for production
  : 'http://127.0.0.1:5173/spotify-callback';

// Helper to refresh Spotify token if expired
async function refreshSpotifyToken(user) {
  if (!user.spotify || !user.spotify.refreshToken) {
    throw new Error('No refresh token available');
  }

  // Check if still valid (add 1 min buffer)
  if (user.spotify.expiresAt && user.spotify.expiresAt.getTime() > Date.now() + 60000) {
    return user.spotify.accessToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', user.spotify.refreshToken);

    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      }
    });

    const { access_token, expires_in, refresh_token } = response.data;
    
    user.spotify.accessToken = access_token;
    user.spotify.expiresAt = new Date(Date.now() + expires_in * 1000);
    // Refresh token might not be returned every time
    if (refresh_token) {
      user.spotify.refreshToken = refresh_token;
    }
    await user.save();
    return access_token;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error.response?.data || error.message);
    throw new Error('Failed to refresh Spotify token');
  }
}

// GET /api/spotify/auth-url
router.get('/auth-url', authMiddleware, (req, res) => {
  if (!SPOTIFY_CLIENT_ID) {
    return res.status(500).json({ error: 'Spotify is not configured on the server.' });
  }

  const scope = 'user-top-read user-read-private user-read-email';
  const state = req.user.id; // Passing user ID as state to track

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state
  });

  res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
});

// POST /api/spotify/callback
router.post('/callback', authMiddleware, async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    });

    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.spotify = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000)
    };
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Spotify callback error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
});

// GET /api/spotify/status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.spotify || !user.spotify.refreshToken) {
      return res.json({ connected: false });
    }
    res.json({ connected: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// GET /api/spotify/top-tracks
router.get('/top-tracks', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.spotify || !user.spotify.refreshToken) {
      return res.status(401).json({ error: 'Spotify not connected' });
    }

    const accessToken = await refreshSpotifyToken(user);

    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json({ tracks: response.data.items });
  } catch (error) {
    console.error('Error fetching top tracks:', error.response?.data || error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
        // Disconnect user if token is completely invalid/revoked
        const user = await User.findById(req.user.id);
        if (user) {
           user.spotify = undefined;
           await user.save();
        }
    }
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// DELETE /api/spotify/disconnect
router.delete('/disconnect', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.spotify = undefined;
      await user.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect Spotify' });
  }
});

module.exports = router;
