// Vercel API Route for Translation Service
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
    const { text, targetLanguage = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Detect if text is in Cyrillic
    const isCyrillic = /[а-яёіїєґ]/i.test(text);
    
    if (!isCyrillic) {
      return res.json({
        originalText: text,
        translatedText: text,
        sourceLanguage: 'en',
        targetLanguage,
        provider: 'No translation needed'
      });
    }
    
    // Try MyMemory API first
    try {
      const sourceLang = /[іїєґ]/i.test(text) ? 'uk' : 'ru';
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLanguage}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        return res.json({
          originalText: text,
          translatedText: data.responseData.translatedText,
          sourceLanguage: sourceLang,
          targetLanguage,
          provider: 'MyMemory'
        });
      }
    } catch (error) {
      console.error('MyMemory API error:', error);
    }
    
    // Try LibreTranslate as fallback
    try {
      const sourceLang = /[іїєґ]/i.test(text) ? 'uk' : 'ru';
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLanguage,
          format: 'text'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return res.json({
          originalText: text,
          translatedText: data.translatedText,
          sourceLanguage: sourceLang,
          targetLanguage,
          provider: 'LibreTranslate'
        });
      }
    } catch (error) {
      console.error('LibreTranslate API error:', error);
    }
    
    // Fallback to simple dictionary
    const translations = {
      'курятина': 'chicken',
      'паста': 'pasta',
      'салат': 'salad',
      'суп': 'soup',
      'десерт': 'dessert',
      'хліб': 'bread',
      'овочі': 'vegetables',
      'м\'ясо': 'meat',
      'риба': 'fish',
      'рис': 'rice',
      'картопля': 'potato',
      'помидор': 'tomato',
      'цибуля': 'onion',
      'часник': 'garlic',
      'морква': 'carrot',
      'огірок': 'cucumber',
      'капуста': 'cabbage',
      'перець': 'pepper',
      'сіль': 'salt',
      'цукор': 'sugar',
      'олія': 'oil',
      'молоко': 'milk',
      'сир': 'cheese',
      'яйця': 'eggs',
      'масло': 'butter'
    };
    
    const translatedText = translations[text.toLowerCase()] || text;
    
    return res.json({
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: 'uk',
      targetLanguage,
      provider: 'Dictionary fallback'
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: 'Translation error',
      message: error.message
    });
  }
}
