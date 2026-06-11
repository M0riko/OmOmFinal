const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    });

    const data = response.data;
    let translatedText = '';

    if (data && Array.isArray(data)) {
      if (data[0] && Array.isArray(data[0])) {
        translatedText = data[0]
          .map((item) => {
            if (Array.isArray(item) && item[0]) {
              return item[0];
            }
            return '';
          })
          .filter((t) => t && typeof t === 'string')
          .join('')
          .trim();
      }
      
      if (!translatedText && data[0] && typeof data[0] === 'string') {
        translatedText = data[0].trim();
      }
    }

    if (translatedText) {
      res.json({
        originalText: text,
        translatedText: translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        provider: 'Google Translate (Proxy)'
      });
    } else {
      res.status(500).json({ error: 'Failed to parse translation from Google' });
    }
  } catch (error) {
    console.error('Translation proxy error:', error.message);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

module.exports = router;
