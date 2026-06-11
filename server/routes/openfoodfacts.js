const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { search_terms, page_size = 10 } = req.query;
    
    if (!search_terms) {
      return res.status(400).json({ error: 'search_terms is required' });
    }

    const url = `https://ua.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(search_terms)}&search_simple=1&action=process&json=1&page_size=${page_size}`;

    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from Open Food Facts:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    // Return empty results instead of 500 to prevent noisy browser console errors
    // Since OFF blocks IPs temporarily when rate-limited (503), we just gracefully return empty.
    res.json({ products: [], count: 0, _error: 'Temporarily unavailable due to rate limits' });
  }
});

module.exports = router;
