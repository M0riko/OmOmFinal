// Advanced Translation Service for Ukrainian/Russian to English and back
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
  provider: string;
}

export interface TranslationCache {
  [key: string]: TranslationResult;
}

class TranslationService {
  private cache: TranslationCache = {};
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000;

  // Detect if text is in Cyrillic (Ukrainian/Russian)
  isCyrillic(text: string): boolean {
    return /[а-яёіїєґ]/i.test(text);
  }

  // Detect language (basic detection)
  detectLanguage(text: string): 'uk' | 'ru' | 'en' {
    if (!this.isCyrillic(text)) return 'en';
    
    // Ukrainian-specific characters
    if (/[іїєґ]/i.test(text)) return 'uk';
    
    // Russian-specific characters
    if (/[ёъыэ]/i.test(text)) return 'ru';
    
    // Default to Ukrainian for other Cyrillic
    return 'uk';
  }

  // Get cache key
  private getCacheKey(text: string, targetLang: string): string {
    return `${text.toLowerCase()}_${targetLang}`;
  }

  // Check if cache entry is valid
  private isCacheValid(entry: TranslationResult & { timestamp: number }): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  // Clean cache if it's too large
  private cleanCache(): void {
    const entries = Object.entries(this.cache);
    if (entries.length > this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const sortedEntries = entries.sort((a, b) => 
        (a[1] as any).timestamp - (b[1] as any).timestamp
      );
      const toRemove = sortedEntries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => delete this.cache[key]);
    }
  }

  // MyMemory API (free, no key required)
  private async translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        return {
          originalText: text,
          translatedText: data.responseData.translatedText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          confidence: data.responseData.match ? parseFloat(data.responseData.match) : undefined,
          provider: 'MyMemory'
        };
      }
      
      throw new Error('MyMemory API error');
    } catch (error) {
      console.warn('MyMemory translation failed:', error);
      throw error;
    }
  }

  // LibreTranslate API (free, no key required) - multiple public instances
  private async translateWithLibreTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    // List of public LibreTranslate instances to try
    const instances = [
      'https://translate.argosopentech.com/translate',
      'https://libretranslate.com/translate',
      'https://libretranslate.de/translate'
    ];
    
    // Try each instance until one works
    for (const url of instances) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
          })
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.translatedText) {
          return {
            originalText: text,
            translatedText: data.translatedText,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            provider: 'LibreTranslate'
          };
        }
      } catch (error) {
        // Try next instance
        continue;
      }
    }
    
    throw new Error('All LibreTranslate instances failed');
  }

  // Google Translate (free, unlimited - web-based)
  private async translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    try {
      // Google Translate web API endpoint (no API key required, unlimited usage)
      // Format: https://translate.googleapis.com/translate_a/single?client=gtx&sl=SOURCE&tl=TARGET&dt=t&q=TEXT
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://translate.google.com/'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Google Translate returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Google Translate returns data in format: [[["translated text", ...], ...], detected_source_lang, ...]
      // Handle different response formats
      let translatedText = '';
      
      if (data && Array.isArray(data)) {
        // Most common format: [[["translated text", ...], ...], ...]
        if (data[0] && Array.isArray(data[0])) {
          translatedText = data[0]
            .map((item: any) => {
              if (Array.isArray(item) && item[0]) {
                return item[0];
              }
              return '';
            })
            .filter((text: string) => text && typeof text === 'string')
            .join('')
            .trim();
        }
        
        // Alternative format: ["translated text", ...]
        if (!translatedText && data[0] && typeof data[0] === 'string') {
          translatedText = data[0].trim();
        }
      }
      
      if (translatedText && translatedText.length > 0) {
        return {
          originalText: text,
          translatedText: translatedText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          provider: 'Google Translate'
        };
      }
      
      throw new Error('Google Translate parsing error - no translation found');
    } catch (error: any) {
      // If CORS error, try alternative method or throw
      if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
        console.warn('Google Translate CORS error (will try alternative services):', error.message);
      } else {
        console.warn('Google Translate failed:', error);
      }
      throw error;
    }
  }

  // TranslateAPI.org (free, unlimited)
  private async translateWithTranslateAPI(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    try {
      // TranslateAPI.org provides free unlimited translation
      const url = `https://api.translateapi.org/translate`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          from: sourceLang,
          to: targetLang
        })
      });
      
      if (!response.ok) {
        throw new Error(`TranslateAPI returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.result) {
        return {
          originalText: text,
          translatedText: data.result,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          provider: 'TranslateAPI'
        };
      }
      
      throw new Error('TranslateAPI error');
    } catch (error) {
      console.warn('TranslateAPI translation failed:', error);
      throw error;
    }
  }

  // Fallback translation using built-in dictionary
  private translateWithDictionary(text: string, sourceLang: string, targetLang: string): TranslationResult | null {
    const dictionary = this.getTranslationDictionary();
    const lowerText = text.toLowerCase().trim();
    
    // Direct translation
    if (dictionary[lowerText]) {
      return {
        originalText: text,
        translatedText: dictionary[lowerText],
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        provider: 'Dictionary'
      };
    }
    
    // Partial translation for compound words
    for (const [key, value] of Object.entries(dictionary)) {
      if (lowerText.includes(key)) {
        const translated = lowerText.replace(key, value);
        return {
          originalText: text,
          translatedText: translated,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          provider: 'Dictionary (partial)'
        };
      }
    }
    
    return null;
  }

  // Get comprehensive translation dictionary
  private getTranslationDictionary(): Record<string, string> {
    return {
      // Основні продукти
      'риба': 'fish', 'рыба': 'fish',
      'курятина': 'chicken', 'курица': 'chicken',
      'молоко': 'milk',
      'хліб': 'bread', 'хлеб': 'bread',
      'картопля': 'potato', 'картофель': 'potato',
      'мясо': 'meat', 'м\'ясо': 'meat',
      'овочі': 'vegetables', 'овощи': 'vegetables',
      'фрукти': 'fruits', 'фрукты': 'fruits',
      
      // Молочні продукти
      'сир': 'cheese', 'сыр': 'cheese',
      'творог': 'cottage cheese',
      'йогурт': 'yogurt',
      'сметана': 'sour cream',
      'вершкове масло': 'butter',
      'олія': 'oil',
      
      // Овочі
      'помідори': 'tomato', 'помидоры': 'tomato',
      'огірки': 'cucumber', 'огурцы': 'cucumber',
      'цибуля': 'onion', 'лук': 'onion',
      'морква': 'carrot', 'морковь': 'carrot',
      'капуста': 'cabbage',
      'перець': 'pepper', 'перец': 'pepper',
      'броколі': 'broccoli', 'брокколи': 'broccoli',
      'шпинат': 'spinach',
      'салат-латук': 'lettuce', 'салат латук': 'lettuce',
      
      // Фрукти
      'яблука': 'apple', 'яблоки': 'apple',
      'банани': 'banana', 'бананы': 'banana',
      'апельсини': 'orange', 'апельсины': 'orange',
      'лимони': 'lemon', 'лимоны': 'lemon',
      'виноград': 'grapes',
      'полуниця': 'strawberry', 'клубника': 'strawberry',
      'малина': 'raspberry',
      'чорниця': 'blueberry', 'черника': 'blueberry',
      
      // Крупи та зернові
      'рис': 'rice',
      'гречка': 'buckwheat', 'гречневая': 'buckwheat',
      'овес': 'oats', 'овсянка': 'oats',
      'пшениця': 'wheat', 'пшеница': 'wheat',
      'кукурудза': 'corn', 'кукуруза': 'corn',
      'ячмінь': 'barley', 'ячмень': 'barley',
      'просо': 'millet',
      
      // М'ясні продукти
      'свинина': 'pork',
      'яловичина': 'beef', 'говядина': 'beef',
      'баранина': 'lamb',
      'ковбаса': 'sausage', 'колбаса': 'sausage',
      'сосиски': 'sausages',
      'бекон': 'bacon',
      'ветчина': 'ham',
      
      // Напої
      'вода': 'water',
      'сік': 'juice', 'сок': 'juice',
      'чай': 'tea',
      'кава': 'coffee', 'кофе': 'coffee',
      'пиво': 'beer',
      'вино': 'wine',
      
      // Солодощі
      'цукор': 'sugar', 'сахар': 'sugar',
      'мед': 'honey',
      'шоколад': 'chocolate',
      'печиво': 'cookies', 'печенье': 'cookies',
      'торт': 'cake',
      'десерт': 'dessert',
      'цукерки': 'candy', 'конфеты': 'candy',
      
      // Страви
      'суп': 'soup',
      'борщ': 'borscht',
      'салат-страва': 'salad',
      'паста': 'pasta', 'макароны': 'pasta',
      'піца': 'pizza', 'пицца': 'pizza',
      'пельмені': 'dumplings', 'пельмени': 'dumplings',
      'вареники': 'vareniki',
      'блини': 'pancakes',
      'омлет': 'omelet',
      'яєчня': 'scrambled eggs', 'яичница': 'scrambled eggs',
      
      // Приправи та спеції
      'сіль': 'salt', 'соль': 'salt',
      'чорний перець': 'black pepper', 'черный перец': 'black pepper',
      'часник': 'garlic', 'чеснок': 'garlic',
      'петрушка': 'parsley',
      'кінза': 'cilantro',
      'базилік': 'basil',
      'орегано': 'oregano',
      'лавровий лист': 'bay leaf', 'лавровый лист': 'bay leaf',
      
      // Олії та жири
      'соняшникова олія': 'sunflower oil', 'подсолнечное масло': 'sunflower oil',
      'оливкова олія': 'olive oil', 'оливковое масло': 'olive oil',
      'кокосова олія': 'coconut oil', 'кокосовое масло': 'coconut oil',
      
      // Горіхи та насіння
      'горіхи': 'nuts', 'орехи': 'nuts',
      'волоські горіхи': 'walnuts', 'грецкие орехи': 'walnuts',
      'мигдаль': 'almonds', 'миндаль': 'almonds',
      'фісташки': 'pistachios',
      'кеш\'ю': 'cashews', 'кешью': 'cashews',
      'соняшникові насіння': 'sunflower seeds', 'семечки подсолнечника': 'sunflower seeds',
      'льон': 'flax seeds', 'льняное семя': 'flax seeds',
      
      // Бобові
      'квасоля': 'beans', 'фасоль': 'beans',
      'горох': 'peas',
      'сочевиця': 'lentils', 'чечевица': 'lentils',
      'нут': 'chickpeas',
      'соя': 'soybeans', 'соевые бобы': 'soybeans',
      
      // Морські продукти
      'креветки': 'shrimp',
      'краби': 'crab',
      'омар': 'lobster',
      'мідії': 'mussels', 'мидии': 'mussels',
      'устриці': 'oysters', 'устрицы': 'oysters',
      'лосось': 'salmon',
      'тунець': 'tuna', 'тунец': 'tuna',
      'тріска': 'cod', 'треска': 'cod',
      
      // Молочні продукти (розширено)
      'кефір': 'kefir',
      'ряженка': 'ryazhenka',
      'простокваша': 'sour milk',
      'майонез': 'mayonnaise',
      'маргарин': 'margarine',
      
      // Хлібобулочні вироби
      'батон': 'white bread',
      'чорний хліб': 'black bread', 'черный хлеб': 'black bread',
      'бородинський хліб': 'borodinsky bread', 'бородинский хлеб': 'borodinsky bread',
      'лаваш': 'lavash',
      'піта': 'pita bread', 'пита': 'pita bread',
      'круасани': 'croissants',
      'булочки': 'buns',
      
      // Консерви
      'консерви': 'canned food', 'консервы': 'canned food',
      'тушонка': 'stewed meat', 'тушенка': 'stewed meat',
      'рибні консерви': 'canned fish', 'рыбные консервы': 'canned fish',
      'овочеві консерви': 'canned vegetables', 'овощные консервы': 'canned vegetables',
      
      // Заморожені продукти
      'заморожені овочі': 'frozen vegetables', 'замороженные овощи': 'frozen vegetables',
      'заморожені фрукти': 'frozen fruits', 'замороженные фрукты': 'frozen fruits',
      'морозиво': 'ice cream',
      'заморожена риба': 'frozen fish', 'замороженная рыба': 'frozen fish',
      
      // Напої (розширено)
      'газована вода': 'sparkling water', 'газированная вода': 'sparkling water',
      'мінеральна вода': 'mineral water', 'минеральная вода': 'mineral water',
      'компот': 'compote',
      'морс': 'fruit drink',
      'квас': 'kvass',
      'какао': 'cocoa',
      'горячий шоколад': 'hot chocolate', 'гарячий шоколад': 'hot chocolate',
      
      // Алкогольні напої
      'горілка': 'vodka', 'водка': 'vodka',
      'коньяк': 'cognac',
      'віскі': 'whiskey', 'виски': 'whiskey',
      'ром': 'rum',
      'джин': 'gin',
      'шампанське': 'champagne', 'шампанское': 'champagne',
      
      // Спеціальні продукти
      'тофу': 'tofu',
      'сейтан': 'seitan',
      'темпе': 'tempeh',
      'кіноа': 'quinoa', 'киноа': 'quinoa',
      'чиа': 'chia seeds', 'семена чиа': 'chia seeds',
      'спіруліна': 'spirulina',
      'маточне молочко': 'royal jelly', 'маточное молочко': 'royal jelly',
      'прополіс': 'propolis', 'прополис': 'propolis',
      
      // Дитяче харчування
      'дитяча суміш': 'baby formula', 'детская смесь': 'baby formula',
      'пюре': 'puree',
      'дитячі каші': 'baby cereals', 'детские каши': 'baby cereals',
      'дитячі печиво': 'baby cookies', 'детское печенье': 'baby cookies',
      
      // Спортивне харчування
      'протеїн': 'protein powder', 'протеин': 'protein powder',
      'креатин': 'creatine',
      'глутамін': 'glutamine', 'глютамин': 'glutamine',
      'бца': 'bcaa',
      'гейнер': 'gainer',
      'жиросжигатель': 'fat burner', 'жироспалювач': 'fat burner',
      
      // Дієтичні продукти
      'дієтичні продукти': 'diet products', 'диетические продукты': 'diet products',
      'низькокалорійні': 'low calorie', 'низкокалорийные': 'low calorie',
      'без цукру': 'sugar free', 'без сахара': 'sugar free',
      'без лактози': 'lactose free', 'без лактозы': 'lactose free',
      'без глютену': 'gluten free', 'без глютена': 'gluten free',
      'веганські': 'vegan', 'веганские': 'vegan',
      'вегетаріанські': 'vegetarian', 'вегетарианские': 'vegetarian',
      
      // Кулінарні терміни
      'смажити': 'fry', 'жарить': 'fry',
      'варити': 'boil', 'варить': 'boil',
      'тушити': 'stew', 'тушить': 'stew',
      'запікати': 'bake', 'запекать': 'bake',
      'гриль': 'grill',
      'коптити': 'smoke', 'коптить': 'smoke',
      'маринувати': 'marinate', 'мариновать': 'marinate',
      'консервувати': 'preserve', 'консервировать': 'preserve',
      
      // Розміри та кількість
      'великий': 'large', 'большой': 'large',
      'середній': 'medium', 'средний': 'medium',
      'малий': 'small', 'маленький': 'small',
      'величезний': 'huge', 'огромный': 'huge',
      'крихітний': 'tiny', 'крошечный': 'tiny',
      'півкілограма': 'half kilogram', 'полкило': 'half kilogram',
      'кілограм': 'kilogram', 'килограмм': 'kilogram',
      'грам': 'gram', 'грамм': 'gram',
      'літр': 'liter', 'литр': 'liter',
      'мілілітр': 'milliliter', 'миллилитр': 'milliliter',
      
      // Смаки та якості
      'солодкий': 'sweet', 'сладкий': 'sweet',
      'кислий': 'sour', 'кислый': 'sour',
      'гіркий': 'bitter', 'горький': 'bitter',
      'солоний': 'salty', 'соленый': 'salty',
      'пряний': 'spicy', 'острый': 'spicy',
      'смачний': 'tasty', 'вкусный': 'tasty',
      'свіжий': 'fresh', 'свежий': 'fresh',
      'застарілий': 'stale', 'черствый': 'stale',
      'соковитий': 'juicy', 'сочный': 'juicy',
      'сухий': 'dry', 'сухой': 'dry',
      'м\'який': 'soft', 'мягкий': 'soft',
      'твердий': 'hard', 'твердый': 'hard',
      'хрусткий': 'crispy', 'хрустящий': 'crispy',
      'ніжний': 'tender', 'нежный': 'tender',
      'жирний': 'fatty', 'жирный': 'fatty',
      'постний': 'lean', 'постный': 'lean'
    };
  }

  // Online-only translation method (no dictionary fallback)
  async translateOnlineOnly(text: string, targetLanguage: string = 'uk'): Promise<TranslationResult> {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('Text cannot be empty');
    }

    const sourceLanguage = this.detectLanguage(trimmedText);
    
    // If already in target language, return as is
    if (sourceLanguage === targetLanguage) {
      return {
        originalText: trimmedText,
        translatedText: trimmedText,
        sourceLanguage,
        targetLanguage,
        provider: 'No translation needed'
      };
    }

    // Check cache first
    const cacheKey = this.getCacheKey(trimmedText, targetLanguage);
    const cached = this.cache[cacheKey];
    if (cached && this.isCacheValid(cached as any)) {
      return cached;
    }

    let result: TranslationResult | null = null;

    // Try multiple translation services in order (Google Translate first - best quality, unlimited)
    const translationServices = [
      { name: 'Google Translate', method: () => this.translateWithGoogle(trimmedText, sourceLanguage, targetLanguage) },
      { name: 'TranslateAPI', method: () => this.translateWithTranslateAPI(trimmedText, sourceLanguage, targetLanguage) },
      { name: 'LibreTranslate', method: () => this.translateWithLibreTranslate(trimmedText, sourceLanguage, targetLanguage) },
      { name: 'MyMemory', method: () => this.translateWithMyMemory(trimmedText, sourceLanguage, targetLanguage) }
    ];

    for (const service of translationServices) {
      if (!result) {
        try {
          result = await service.method();
          console.log(`✓ Online translation successful using ${service.name}`);
          break; // Stop trying once we get a result
        } catch (error) {
          console.warn(`${service.name} translation failed, trying next service...`);
          continue;
        }
      }
    }

    // If all online methods failed, return original text
    if (!result) {
      result = {
        originalText: trimmedText,
        translatedText: trimmedText,
        sourceLanguage,
        targetLanguage,
        provider: 'Online translation failed'
      };
    }

    // Cache the result
    (result as any).timestamp = Date.now();
    this.cache[cacheKey] = result;
    this.cleanCache();

    return result;
  }

  // Main translation method (with dictionary fallback)
  async translate(text: string, targetLanguage: string = 'en'): Promise<TranslationResult> {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('Text cannot be empty');
    }

    const sourceLanguage = this.detectLanguage(trimmedText);
    
    // If already in target language, return as is
    if (sourceLanguage === targetLanguage) {
      return {
        originalText: trimmedText,
        translatedText: trimmedText,
        sourceLanguage,
        targetLanguage,
        provider: 'No translation needed'
      };
    }

    // Check cache first
    const cacheKey = this.getCacheKey(trimmedText, targetLanguage);
    const cached = this.cache[cacheKey];
    if (cached && this.isCacheValid(cached as any)) {
      return cached;
    }

    let result: TranslationResult | null = null;

    // Try dictionary first (fastest)
    if (sourceLanguage === 'uk' || sourceLanguage === 'ru') {
      result = this.translateWithDictionary(trimmedText, sourceLanguage, targetLanguage);
    }

    // Try multiple translation services in order (Google Translate first - best quality, unlimited)
    const translationServices = [
      { name: 'Google Translate', method: () => this.translateWithGoogle(trimmedText, sourceLanguage, targetLanguage) },
      { name: 'TranslateAPI', method: () => this.translateWithTranslateAPI(trimmedText, sourceLanguage, targetLanguage) },
      { name: 'LibreTranslate', method: () => this.translateWithLibreTranslate(trimmedText, sourceLanguage, targetLanguage) },
      { name: 'MyMemory', method: () => this.translateWithMyMemory(trimmedText, sourceLanguage, targetLanguage) }
    ];

    for (const service of translationServices) {
      if (!result) {
        try {
          result = await service.method();
          console.log(`✓ Translation successful using ${service.name}`);
          break; // Stop trying once we get a result
        } catch (error) {
          console.warn(`${service.name} translation failed, trying next service...`);
          continue;
        }
      }
    }

    // If all methods failed, return original text
    if (!result) {
      result = {
        originalText: trimmedText,
        translatedText: trimmedText,
        sourceLanguage,
        targetLanguage,
        provider: 'Translation failed'
      };
    }

    // Cache the result
    (result as any).timestamp = Date.now();
    this.cache[cacheKey] = result;
    this.cleanCache();

    return result;
  }

  // Translate multiple texts
  async translateBatch(texts: string[], targetLanguage: string = 'en'): Promise<TranslationResult[]> {
    const promises = texts.map(text => this.translate(text, targetLanguage));
    return Promise.all(promises);
  }

  // Clear cache
  clearCache(): void {
    this.cache = {};
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: Object.keys(this.cache).length,
      entries: Object.keys(this.cache)
    };
  }
}

// Export singleton instance
export const translationService = new TranslationService();
export default translationService;
