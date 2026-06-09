// FatSecret Premier API Service with full Ukrainian localization support
import CryptoJS from 'crypto-js';
import { translationService, TranslationResult } from './translation-service';

// FatSecret API Configuration
const FATSECRET_CLIENT_ID = "64e762751e134d2193adae8b47740c7c";
const FATSECRET_CLIENT_SECRET = "c09fe9f970f94835ba1a355241eecc77";
// Use Vercel API route in production, localhost in development
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const isVercel = window.location.hostname.includes('vercel.app');

// Determine the correct API URL - in development Vite proxies /api to http://localhost:3000
const FATSECRET_BASE_URL = "/api/fatsecret";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Ukrainian localization configuration
const UKRAINIAN_LOCALE = {
  region: 'UA',
  language: 'uk',
  regionName: 'Ukraine',
  languageName: 'Ukrainian'
};

// Supported regions and languages from FatSecret API
const SUPPORTED_REGIONS = {
  'UA': { name: 'Ukraine', defaultLanguage: 'uk' },
  'US': { name: 'United States', defaultLanguage: 'en' },
  'RU': { name: 'Russia', defaultLanguage: 'ru' },
  'PL': { name: 'Poland', defaultLanguage: 'pl' },
  'DE': { name: 'Germany', defaultLanguage: 'de' },
  'FR': { name: 'France', defaultLanguage: 'fr' },
  'ES': { name: 'Spain', defaultLanguage: 'es' },
  'IT': { name: 'Italy', defaultLanguage: 'it' }
};

const SUPPORTED_LANGUAGES = {
  'uk': 'Ukrainian',
  'en': 'English',
  'ru': 'Russian',
  'pl': 'Polish',
  'de': 'German',
  'fr': 'French',
  'es': 'Spanish',
  'it': 'Italian'
};

// Interfaces
export interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  brand_name?: string;
  food_description?: string;
}

export interface FatSecretFoodDetails {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  brand_name?: string;
  food_description?: string;
  servings: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

export interface FatSecretServing {
  serving_id: string;
  serving_description: string;
  serving_url: string;
  metric_serving_amount: string;
  metric_serving_unit: string;
  number_of_units: string;
  measurement_description: string;
  calories: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  saturated_fat: string;
  polyunsaturated_fat: string;
  monounsaturated_fat: string;
  cholesterol: string;
  sodium: string;
  potassium: string;
  fiber: string;
  sugar: string;
}

export interface FatSecretRecipe {
  recipe_id: string;
  recipe_name: string;
  recipe_url: string;
  recipe_image: string;
  recipe_description: string;
  recipe_preparation_time_min: string;
  recipe_cooking_time_min: string;
  recipe_number_of_servings: string;
  recipe_nutrition: {
    calories: string;
    protein: string;
    fat: string;
    carbohydrate: string;
  };
}

export interface FatSecretBrand {
  brand_id: string;
  brand_name: string;
  brand_url: string;
}

export interface FatSecretCategory {
  category_id: string;
  category_name: string;
  category_url: string;
}

export interface FatSecretSubCategory {
  sub_category_id: string;
  sub_category_name: string;
  sub_category_url: string;
}

export interface FatSecretRecipeType {
  recipe_type_id: string;
  recipe_type_name: string;
  recipe_type_url: string;
}

// Legacy interfaces for compatibility
export interface Food {
  food_id: string;
  food_name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl?: string;
  summary?: string;
  extendedIngredients?: any[];
  analyzedInstructions?: any[];
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export interface FoodProduct {
  id: number;
  title: string;
  image: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

// Utility functions
function getCacheKey(method: string, params: Record<string, any>): string {
  return `${method}_${JSON.stringify(params)}`;
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function isCyrillic(text: string): boolean {
  return /[а-яёіїєґ]/i.test(text);
}

// Main FatSecret Premier API Service
class FatSecretPremierApiService {
  private currentLocale = UKRAINIAN_LOCALE;

  // OAuth 1.0 utilities
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  private createSignatureBaseString(method: string, url: string, params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    return `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  }

  // Main API request method
  private async makeFatSecretRequest(method: string, params: Record<string, any> = {}): Promise<any> {
    try {
      // Validate required parameters
      if (!method || typeof method !== 'string') {
        throw new Error('Method parameter is required and must be a string');
      }

      if (!FATSECRET_CLIENT_ID || !FATSECRET_CLIENT_SECRET) {
        throw new Error('FatSecret API credentials are not configured');
      }

      // Add localization parameters for Ukrainian content
      const localizedParams = this.addLocalizationParams(params);

      // OAuth parameters will be generated by the API route

      // For proxy requests, we don't need to generate OAuth signature
      // The proxy server will handle the OAuth signature generation
      console.log('FatSecret Premier API Request via Proxy:', method, localizedParams);

      let response;
      let lastError;

      // Always use API route now (no separate server needed)
      if (!FATSECRET_BASE_URL) {
        throw new Error('API URL not configured');
      }

      // Prepare parameters for the proxy (without OAuth params)
      const proxyParams = {
        method: method,
        format: 'json',
        ...localizedParams
      };

      // Try the primary API URL first
      try {
        response = await fetch(FATSECRET_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(proxyParams)
        });

        console.log('FatSecret API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('FatSecret API Error:', response.status, errorText);
          throw new Error(`FatSecret API request failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('FatSecret API request error:', error);
        throw error;
      }

      const responseText = await response.text();
      console.log('FatSecret API Response:', responseText.substring(0, 200) + '...');

      // Parse response
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from FatSecret API');
      }

      try {
        const parsedResponse = JSON.parse(responseText);
        
        if (parsedResponse.error) {
          throw new Error(`FatSecret API error: ${parsedResponse.error.message || 'Unknown error'}`);
        }
        
        return parsedResponse;
      } catch (parseError) {
        console.warn('Failed to parse JSON response, trying URL-encoded format');
        const result: Record<string, string> = {};
        responseText.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            result[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        });
        return result;
      }
    } catch (error) {
      console.error('FatSecret API request error:', error);
      throw error;
    }
  }

  // Add localization parameters optimized for Premier Free US dataset
  private addLocalizationParams(params: Record<string, any>): Record<string, any> {
    const localizedParams = { ...params };
    
    // Check if query is in Cyrillic (Ukrainian/Russian)
    const query = params.search_expression || '';
    const isCyrillic = /[а-яёіїєґ]/i.test(query);
    
    if (isCyrillic) {
      // For Cyrillic queries, use US region for best results with Premier Free
      // US dataset has the most comprehensive food database
      localizedParams.region = 'US';
      localizedParams.language = 'en';
      
      // Note: We'll handle translation in the search method itself
    } else {
      // For non-Cyrillic queries, use US region for Premier Free access
      localizedParams.region = 'US';
      localizedParams.language = 'en';
    }
    
    return localizedParams;
  }

  // Cached request method
  private async makeCachedRequest(method: string, params: Record<string, any> = {}): Promise<any> {
    const cacheKey = getCacheKey(method, params);
    
    // Check cache first
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('Using cached data for:', method);
      return cached;
    }

    // Make API request
    const result = await this.makeFatSecretRequest(method, params);
    
    // Cache the result
    setCache(cacheKey, result);
    
    return result;
  }

  // Food search methods with smart Ukrainian localization
  async searchFoods(query: string, pageNumber: number = 0, maxResults: number = 20): Promise<FatSecretFood[]> {
    try {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Query parameter is required and must be a non-empty string');
      }

      if (pageNumber < 0 || !Number.isInteger(pageNumber)) {
        throw new Error('Page number must be a non-negative integer');
      }

      if (maxResults <= 0 || maxResults > 50 || !Number.isInteger(maxResults)) {
        throw new Error('Max results must be a positive integer between 1 and 50');
      }

      const isCyrillicQuery = isCyrillic(query);
      console.log('Searching for foods:', query, 'isCyrillic:', isCyrillicQuery);
      
      // Try multiple search strategies for Ukrainian queries
      if (isCyrillicQuery) {
        return await this.searchUkrainianFoods(query, pageNumber, maxResults);
      } else {
        return await this.searchEnglishFoods(query, pageNumber, maxResults);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
      throw error;
    }
  }

  // Smart Ukrainian/Russian food search with automatic translation
  private async searchUkrainianFoods(query: string, pageNumber: number, maxResults: number): Promise<FatSecretFood[]> {
    try {
      // Use automatic translation service
      const translationResult = await translationService.translate(query, 'en');
      
      console.log(`🔄 Auto-translation: "${query}" → "${translationResult.translatedText}" (${translationResult.provider})`);
      
      // Search with translated query using US dataset
      const params = {
        search_expression: translationResult.translatedText,
        page_number: pageNumber.toString(),
        max_results: maxResults.toString(),
        region: 'US',
        language: 'en'
      };

      const response = await this.makeCachedRequest('foods.search', params);

      if (response.foods && response.foods.food) {
        const foods = Array.isArray(response.foods.food) ? response.foods.food : [response.foods.food];
        
        // Validate food objects
        const validFoods = foods.filter(food => 
          food && 
          typeof food === 'object' && 
          food.food_id && 
          food.food_name
        );
        
        if (validFoods.length > 0) {
          console.log(`✅ Found ${validFoods.length} results with auto-translation`);
          
          // Translate ALL food names to Ukrainian (with rate limiting built into translateFoodNames)
          console.log(`🔄 Translating ${validFoods.length} food names to Ukrainian (with rate limiting)...`);
          const translatedFoods = await this.translateFoodNames(validFoods, 'uk');
          
          return translatedFoods;
        }
      }

      console.log('No results found with auto-translation');
      return [];
    } catch (error) {
      console.error('Auto-translation search failed:', error);
      
      // Fallback to dictionary translation
      const fallbackTranslation = this.translateUkrainianToEnglish(query);
      if (fallbackTranslation !== query) {
        console.log(`🔄 Fallback translation: "${query}" → "${fallbackTranslation}"`);
        
        const params = {
          search_expression: fallbackTranslation,
          page_number: pageNumber.toString(),
          max_results: maxResults.toString(),
          region: 'US',
          language: 'en'
        };

        const response = await this.makeCachedRequest('foods.search', params);

        if (response.foods && response.foods.food) {
          const foods = Array.isArray(response.foods.food) ? response.foods.food : [response.foods.food];
          
          const validFoods = foods.filter(food => 
            food && 
            typeof food === 'object' && 
            food.food_id && 
            food.food_name
          );
          
          if (validFoods.length > 0) {
            console.log(`🔄 Translating ${validFoods.length} fallback results to Ukrainian (with rate limiting)...`);
            const translatedFoods = await this.translateFoodNames(validFoods, 'uk');
            return translatedFoods;
          }
        }
      }

      return [];
    }
  }

  // English food search with automatic Ukrainian translation
  private async searchEnglishFoods(query: string, pageNumber: number, maxResults: number, translateToUkrainian: boolean = true): Promise<FatSecretFood[]> {
    const params = {
      search_expression: query,
      page_number: pageNumber.toString(),
      max_results: maxResults.toString()
    };

    const response = await this.makeCachedRequest('foods.search', params);

    if (response.foods && response.foods.food) {
      const foods = Array.isArray(response.foods.food) ? response.foods.food : [response.foods.food];
      
      // Validate food objects
      const validFoods = foods.filter(food => 
        food && 
        typeof food === 'object' && 
        food.food_id && 
        food.food_name
      );
      
      if (validFoods.length !== foods.length) {
        console.warn(`Filtered out ${foods.length - validFoods.length} invalid food items`);
      }
      
      // Translate ALL food names to Ukrainian by default (with rate limiting built into translateFoodNames)
      if (translateToUkrainian) {
        console.log(`🔄 Translating ${validFoods.length} English food names to Ukrainian (with rate limiting)...`);
        const translatedFoods = await this.translateFoodNames(validFoods, 'uk');
        
        return translatedFoods;
      }
      
      return validFoods;
    }
    return [];
  }

  // Translate food names to target language using online translation with rate limiting
  private async translateFoodNames(foods: FatSecretFood[], targetLanguage: string): Promise<FatSecretFood[]> {
    try {
      if (foods.length === 0) return foods;
      
      console.log(`🌐 Starting translation of ${foods.length} food names to ${targetLanguage}...`);
      
      // Extended English-to-Ukrainian dictionary for common food items
      const enToUkDictionary: Record<string, string> = {
        // Basic foods
        'rice': 'рис', 'chicken': 'курятина', 'milk': 'молоко', 'bread': 'хліб', 'egg': 'яйце',
        'eggs': 'яйця', 'butter': 'масло', 'cheese': 'сир', 'meat': 'м\'ясо', 'fish': 'риба',
        'apple': 'яблуко', 'apples': 'яблука', 'banana': 'банан', 'bananas': 'банани',
        'orange': 'апельсин', 'oranges': 'апельсини', 'tomato': 'помідор', 'tomatoes': 'помідори',
        'potato': 'картопля', 'potatoes': 'картопля', 'onion': 'цибуля', 'onions': 'цибуля',
        'carrot': 'морква', 'carrots': 'морква', 'cucumber': 'огірок', 'cucumbers': 'огірки',
        'pepper': 'перець', 'peppers': 'перець', 'salt': 'сіль', 'sugar': 'цукор',
        'flour': 'борошно', 'oil': 'олія', 'water': 'вода', 'juice': 'сік',
        
        // Rice products
        'yellow rice': 'жовтий рис', 'fried rice': 'смажений рис', 'rice crackers': 'рисові крекери',
        'crispy rice': 'хрусткий рис', 'puffed rice': 'надутий рис', 'white rice': 'білий рис',
        'brown rice': 'коричневий рис', 'wild rice': 'дикий рис',
        
        // Meat products
        'beef': 'яловичина', 'pork': 'свинина', 'lamb': 'баранина', 'turkey': 'індичка',
        'sausage': 'ковбаса', 'bacon': 'бекон', 'ham': 'ветчина',
        
        // Dairy
        'yogurt': 'йогурт', 'sour cream': 'сметана', 'cottage cheese': 'творог',
        
        // Grains
        'buckwheat': 'гречка', 'oats': 'овес', 'wheat': 'пшениця', 'corn': 'кукурудза',
        'barley': 'ячмінь', 'millet': 'просо',
        
        // Vegetables
        'cabbage': 'капуста', 'broccoli': 'броколі', 'spinach': 'шпинат', 'lettuce': 'салат-латук',
        'peas': 'горох', 'beans': 'квасоля', 'lentils': 'сочевиця',
        
        // Fruits
        'lemon': 'лимон', 'lemons': 'лимони', 'grapes': 'виноград', 'strawberry': 'полуниця',
        'strawberries': 'полуниця', 'raspberry': 'малина', 'blueberry': 'чорниця',
        
        // Beverages
        'coffee': 'кава', 'tea': 'чай', 'beer': 'пиво', 'wine': 'вино',
        
        // Common food phrases
        'whole': 'цілий', 'sliced': 'нарізаний', 'chopped': 'порізаний', 'ground': 'м\'ясний фарш',
        'cooked': 'приготовлений', 'raw': 'сирий', 'fresh': 'свіжий', 'frozen': 'заморожений',
        'canned': 'консервований', 'organic': 'органічний', 'low fat': 'нежирний',
      };
      
      // Translate food names sequentially with delay to avoid rate limiting
      const translated = [];
      for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        
        // Check if food name is already in Ukrainian
        const isNameUkrainian = targetLanguage === 'uk' && isCyrillic(food.food_name);
        
        let translatedName = food.food_name;
        if (!isNameUkrainian && food.food_name && food.food_name.trim() !== '') {
          // First try dictionary lookup
          const lowerName = food.food_name.toLowerCase().trim();
          let foundTranslation = false;
          
          // Direct match
          if (enToUkDictionary[lowerName]) {
            translatedName = enToUkDictionary[lowerName];
            console.log(`  [${i + 1}/${foods.length}] ✓ Dictionary: "${food.food_name}" → "${translatedName}"`);
            foundTranslation = true;
          } else {
            // Partial match - find first matching key
            const matchingKey = Object.keys(enToUkDictionary).find(key => 
              lowerName.includes(key) || key.includes(lowerName)
            );
            if (matchingKey) {
              translatedName = enToUkDictionary[matchingKey];
              console.log(`  [${i + 1}/${foods.length}] ✓ Dictionary (partial): "${food.food_name}" → "${translatedName}"`);
              foundTranslation = true;
            }
          }
          
          // If dictionary didn't work, try online translation
          if (!foundTranslation) {
            try {
              // Add delay between requests to avoid rate limiting (500ms between requests)
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              
              console.log(`  [${i + 1}/${foods.length}] Translating online: "${food.food_name}" → ...`);
              
              // Try online translation with translateOnlineOnly for real-time translation
              const nameTranslation = await translationService.translateOnlineOnly(food.food_name, targetLanguage);
              translatedName = nameTranslation.translatedText;
              console.log(`  [${i + 1}/${foods.length}] ✓ Online: "${food.food_name}" → "${translatedName}" (${nameTranslation.provider})`);
            } catch (error: any) {
              console.warn(`  [${i + 1}/${foods.length}] ✗ Online translation failed: "${food.food_name}"`, error?.message || error);
              // Keep original name if all translation attempts fail
            }
          }
        } else {
          console.log(`  [${i + 1}/${foods.length}] ✓ Already Ukrainian: "${food.food_name}"`);
        }
        
        translated.push({
          ...food,
          food_name: translatedName,
          food_description: food.food_description ? 
            this.translateDescription(food.food_description, targetLanguage) : 
            food.food_description
        });
      }
      
      console.log(`✅ Successfully processed ${translated.length} food names to ${targetLanguage}`);
      console.log(`📝 Sample translated names:`, translated.slice(0, 3).map(f => f.food_name));
      return translated;
    } catch (error) {
      console.error('❌ Failed to translate food names:', error);
      return foods; // Return original foods if translation fails
    }
  }

  // Translate food description
  private translateDescription(description: string, targetLanguage: string): string {
    // Simple translation of common food description terms
    const translations: Record<string, Record<string, string>> = {
      'uk': {
        'Per 100g': 'На 100г',
        'Calories': 'Калорії',
        'Fat': 'Жири',
        'Carbs': 'Вуглеводи',
        'Protein': 'Білки',
        'Generic': 'Загальний',
        'Brand': 'Бренд',
        'Cooked': 'Приготовлений',
        'Raw': 'Сирий',
        'Fresh': 'Свіжий',
        'Frozen': 'Заморожений',
        'Canned': 'Консервований',
        'Dried': 'Висушений',
        'Whole': 'Цілий',
        'Sliced': 'Нарізаний',
        'Chopped': 'Порізаний',
        'Ground': 'М\'ясний фарш',
        'Boneless': 'Без кісток',
        'Skinless': 'Без шкіри',
        'Low Fat': 'Нежирний',
        'Nonfat': 'Обезжирений',
        'Organic': 'Органічний',
        'Natural': 'Натуральний'
      }
    };

    if (targetLanguage === 'uk' && translations.uk) {
      let translatedDescription = description;
      for (const [english, ukrainian] of Object.entries(translations.uk)) {
        translatedDescription = translatedDescription.replace(
          new RegExp(english, 'gi'), 
          ukrainian
        );
      }
      return translatedDescription;
    }

    return description;
  }

  // Enhanced Ukrainian to English translation
  private translateUkrainianToEnglish(query: string): string {
    const translations: Record<string, string> = {
      // Основні продукти
      'риба': 'fish',
      'рыба': 'fish',
      'курятина': 'chicken',
      'курица': 'chicken',
      'молоко': 'milk',
      'хліб': 'bread',
      'хлеб': 'bread',
      'картопля': 'potato',
      'картофель': 'potato',
      'мясо': 'meat',
      'м\'ясо': 'meat',
      'овочі': 'vegetables',
      'овощи': 'vegetables',
      'фрукти': 'fruits',
      'фрукты': 'fruits',
      
      // Молочні продукти
      'сир': 'cheese',
      'сыр': 'cheese',
      'творог': 'cottage cheese',
      'йогурт': 'yogurt',
      'сметана': 'sour cream',
      'масло': 'butter',
      'олія': 'oil',
      
      // Овочі
      'помідори': 'tomato',
      'помидоры': 'tomato',
      'огірки': 'cucumber',
      'огурцы': 'cucumber',
      'цибуля': 'onion',
      'лук': 'onion',
      'морква': 'carrot',
      'морковь': 'carrot',
      'капуста': 'cabbage',
      'перець': 'pepper',
      'перец': 'pepper',
      
      // Фрукти
      'яблука': 'apple',
      'яблоки': 'apple',
      'банани': 'banana',
      'апельсини': 'orange',
      'апельсины': 'orange',
      'лимони': 'lemon',
      'лимоны': 'lemon',
      
      // Крупи та зернові
      'рис': 'rice',
      'гречка': 'buckwheat',
      'овес': 'oats',
      'пшениця': 'wheat',
      'пшеница': 'wheat',
      'кукурудза': 'corn',
      'кукуруза': 'corn',
      
      // М'ясні продукти
      'свинина': 'pork',
      'яловичина': 'beef',
      'говядина': 'beef',
      'баранина': 'lamb',
      'ковбаса': 'sausage',
      'колбаса': 'sausage',
      
      // Напої
      'вода': 'water',
      'сік': 'juice',
      'сок': 'juice',
      'чай': 'tea',
      'кава': 'coffee',
      'кофе': 'coffee',
      
      // Солодощі
      'цукор': 'sugar',
      'сахар': 'sugar',
      'мед': 'honey',
      'шоколад': 'chocolate',
      'печиво': 'cookies',
      'печенье': 'cookies',
      'торт': 'cake',
      'десерт': 'dessert',
      
      // Страви
      'суп': 'soup',
      'борщ': 'borscht',
      'салат': 'salad',
      'паста': 'pasta',
      'макарони': 'pasta',
      'піца': 'pizza',
      'пицца': 'pizza',
      'пельмені': 'dumplings',
      'пельмени': 'dumplings',
      'вареники': 'vareniki'
    };
    
    const lowerQuery = query.toLowerCase().trim();
    return translations[lowerQuery] || query;
  }

  async getFoodDetails(foodId: string): Promise<FatSecretFoodDetails | null> {
    try {
      if (!foodId || typeof foodId !== 'string' || foodId.trim() === '') {
        throw new Error('Food ID is required and must be a non-empty string');
      }

      const params = { food_id: foodId };
      const response = await this.makeCachedRequest('food.get', params);

      if (response.food) {
        const food = { ...response.food }; // Create a copy to avoid mutation
        const originalName = food.food_name;
        
        // Translate food name and description to Ukrainian if not already Ukrainian
        if (food.food_name && !isCyrillic(food.food_name)) {
          try {
            const nameTranslation = await translationService.translateOnlineOnly(food.food_name, 'uk');
            food.food_name = nameTranslation.translatedText;
            console.log(`🔄 Translated food detail name: "${originalName}" → "${food.food_name}"`);
          } catch (error) {
            console.warn('Failed to translate food detail name:', error);
            // Keep original name if translation fails
          }
        } else if (food.food_name && isCyrillic(food.food_name)) {
          console.log(`✓ Food name "${food.food_name}" is already Ukrainian`);
        }
        
        if (food.food_description && !isCyrillic(food.food_description)) {
          try {
            const descTranslation = await translationService.translateOnlineOnly(food.food_description, 'uk');
            food.food_description = descTranslation.translatedText;
          } catch (error) {
            console.warn('Failed to translate food description:', error);
          }
        }
        
        return food;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting food details:', error);
      throw error;
    }
  }

  async searchFoodsWithNutrition(query: string, maxResults: number = 20): Promise<Food[]> {
    try {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Query parameter is required and must be a non-empty string');
      }

      if (maxResults <= 0 || maxResults > 50 || !Number.isInteger(maxResults)) {
        throw new Error('Max results must be a positive integer between 1 and 50');
      }

      const foods = await this.searchFoods(query, 0, maxResults);
      
      console.log(`📦 Found ${foods.length} foods, sample names:`, foods.slice(0, 3).map(f => f.food_name));
      
      // Get nutrition info for each food
      const foodsWithNutrition = await Promise.all(
        foods.slice(0, 10).map(async (food) => {
          try {
            if (!food || !food.food_id) {
              console.warn('Invalid food object:', food);
              return null;
            }

            console.log(`🔍 Getting details for: "${food.food_name}" (ID: ${food.food_id})`);
            const details = await this.getFoodDetails(food.food_id);
            if (details && details.servings && details.servings.serving) {
              const serving = Array.isArray(details.servings.serving) 
                ? details.servings.serving[0] 
                : details.servings.serving;
              
              if (!serving || typeof serving !== 'object') {
                console.warn('Invalid serving object for food:', food.food_id);
                return food;
              }
              
              // Use translated name from details if available, otherwise use from food object
              const translatedName = details.food_name || food.food_name;
              console.log(`✅ Final name for ${food.food_id}: "${translatedName}"`);
              
              return {
                food_id: food.food_id,
                food_name: translatedName, // Already translated in getFoodDetails
                calories: parseFloat(serving.calories || '0') || 0,
                protein: parseFloat(serving.protein || '0') || 0,
                fat: parseFloat(serving.fat || '0') || 0,
                carbs: parseFloat(serving.carbohydrate || '0') || 0,
                fiber: parseFloat(serving.fiber || '0') || 0,
                sugar: parseFloat(serving.sugar || '0') || 0,
                sodium: parseFloat(serving.sodium || '0') || 0
              };
            }
            
            // If no details, use translated name from food object (already translated in searchFoods)
            return {
              food_id: food.food_id,
              food_name: food.food_name, // Already translated in searchFoods -> translateFoodNames
              calories: 0,
              protein: 0,
              fat: 0,
              carbs: 0
            };
          } catch (error) {
            console.error('Error getting food details for', food.food_id, error);
            return {
              food_id: food.food_id,
              food_name: food.food_name,
              calories: 0,
              protein: 0,
              fat: 0,
              carbs: 0
            };
          }
        })
      );

      return foodsWithNutrition.filter(food => food !== null) as Food[];
    } catch (error) {
      console.error('Error searching foods with nutrition:', error);
      throw error;
    }
  }

  // Premier Features - Autocomplete Search
  async autocompleteSearch(query: string, maxResults: number = 10): Promise<any[]> {
    try {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Query parameter is required and must be a non-empty string');
      }

      if (maxResults <= 0 || maxResults > 20 || !Number.isInteger(maxResults)) {
        throw new Error('Max results must be a positive integer between 1 and 20');
      }

      const params = {
        search_expression: query,
        max_results: maxResults.toString()
      };

      const response = await this.makeCachedRequest('foods.autocomplete', params);

      if (response.foods && response.foods.food) {
        const foods = Array.isArray(response.foods.food) ? response.foods.food : [response.foods.food];
        return foods.filter(food => food && typeof food === 'object' && food.food_id && food.food_name);
      }
      return [];
    } catch (error) {
      console.error('Error in autocomplete search:', error);
      throw error;
    }
  }

  // Premier Features - Barcode Scanning
  async scanBarcode(barcode: string): Promise<Food | null> {
    try {
      if (!barcode || typeof barcode !== 'string' || barcode.trim() === '') {
        throw new Error('Barcode parameter is required and must be a non-empty string');
      }

      const params = {
        barcode: barcode
      };

      const response = await this.makeCachedRequest('foods.find_by_barcode', params);

      if (response.foods && response.foods.food) {
        const food = Array.isArray(response.foods.food) ? response.foods.food[0] : response.foods.food;
        
        if (food && food.food_id) {
          // Get detailed nutrition info
          const details = await this.getFoodDetails(food.food_id);
          if (details && details.servings && details.servings.serving) {
            const serving = Array.isArray(details.servings.serving) 
              ? details.servings.serving[0] 
              : details.servings.serving;
            
            return {
              food_id: food.food_id,
              food_name: food.food_name,
              calories: parseFloat(serving.calories || '0') || 0,
              protein: parseFloat(serving.protein || '0') || 0,
              fat: parseFloat(serving.fat || '0') || 0,
              carbs: parseFloat(serving.carbohydrate || '0') || 0,
              fiber: parseFloat(serving.fiber || '0') || 0,
              sugar: parseFloat(serving.sugar || '0') || 0,
              sodium: parseFloat(serving.sodium || '0') || 0
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error scanning barcode:', error);
      throw error;
    }
  }

  // Premier Features - Image Recognition
  async recognizeFoodFromImage(imageData: string): Promise<Food[]> {
    try {
      if (!imageData || typeof imageData !== 'string' || imageData.trim() === '') {
        throw new Error('Image data parameter is required and must be a non-empty string');
      }

      const params = {
        image_data: imageData
      };

      const response = await this.makeCachedRequest('foods.recognize', params);

      if (response.foods && response.foods.food) {
        const foods = Array.isArray(response.foods.food) ? response.foods.food : [response.foods.food];
        
        // Get nutrition info for recognized foods
        const foodsWithNutrition = await Promise.all(
          foods.slice(0, 5).map(async (food) => {
            try {
              if (!food || !food.food_id) return null;

              const details = await this.getFoodDetails(food.food_id);
              if (details && details.servings && details.servings.serving) {
                const serving = Array.isArray(details.servings.serving) 
                  ? details.servings.serving[0] 
                  : details.servings.serving;
                
                return {
                  food_id: food.food_id,
                  food_name: food.food_name,
                  calories: parseFloat(serving.calories || '0') || 0,
                  protein: parseFloat(serving.protein || '0') || 0,
                  fat: parseFloat(serving.fat || '0') || 0,
                  carbs: parseFloat(serving.carbohydrate || '0') || 0,
                  fiber: parseFloat(serving.fiber || '0') || 0,
                  sugar: parseFloat(serving.sugar || '0') || 0,
                  sodium: parseFloat(serving.sodium || '0') || 0
                };
              }
              return {
                food_id: food.food_id,
                food_name: food.food_name,
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0
              };
            } catch (error) {
              console.error('Error getting food details for recognized food:', error);
              return {
                food_id: food.food_id,
                food_name: food.food_name,
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0
              };
            }
          })
        );

        return foodsWithNutrition.filter(food => food !== null) as Food[];
      }
      return [];
    } catch (error) {
      console.error('Error recognizing food from image:', error);
      throw error;
    }
  }

  // Premier Features - Natural Language Processing
  async processNaturalLanguageQuery(query: string): Promise<any> {
    try {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Query parameter is required and must be a non-empty string');
      }

      const params = {
        query: query
      };

      const response = await this.makeCachedRequest('foods.nlp', params);

      return response;
    } catch (error) {
      console.error('Error processing natural language query:', error);
      throw error;
    }
  }

  // Recipe search methods
  async searchRecipes(query: string, options?: {
    cuisine?: string;
    diet?: string;
    dishType?: string;
    recipeTypeId?: string;
    maxReadyTime?: number;
    number?: number;
    pageNumber?: number;
    onlyWithImages?: boolean;
    sortBy?: 'popular' | 'relevance' | 'time';
  }): Promise<{ recipes: Recipe[]; totalResults: number; pageNumber: number; maxResults: number }> {
    try {
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Query parameter is required and must be a non-empty string');
      }

      const pageNumber = options?.pageNumber || 0;
      const maxResults = options?.number || 20;
      const onlyWithImages = options?.onlyWithImages !== false; // Default to true

      if (pageNumber < 0 || !Number.isInteger(pageNumber)) {
        throw new Error('Page number must be a non-negative integer');
      }

      if (maxResults <= 0 || maxResults > 50 || !Number.isInteger(maxResults)) {
        throw new Error('Max results must be a positive integer between 1 and 50');
      }

      if (options?.maxReadyTime !== undefined && (options.maxReadyTime < 0 || !Number.isInteger(options.maxReadyTime))) {
        throw new Error('Max ready time must be a non-negative integer');
      }
      
      console.log('Searching for recipes:', query, 'isCyrillic:', isCyrillic(query), 'onlyWithImages:', onlyWithImages);
      
      // Translate Ukrainian/Russian query to English before searching
      let searchQuery = query;
      if (isCyrillic(query)) {
        try {
          const translationResult = await translationService.translate(query, 'en');
          searchQuery = translationResult.translatedText;
          console.log(`🔄 Auto-translation for recipe search: "${query}" → "${searchQuery}" (${translationResult.provider})`);
        } catch (error) {
          console.warn('Failed to translate recipe query, using original:', error);
          // Continue with original query if translation fails
        }
      }
      
      // Request more results if we're filtering by images, to account for filtered items
      const requestedMaxResults = onlyWithImages ? Math.min(maxResults * 2, 50) : maxResults;
      
      const params = {
        search_expression: searchQuery,
        max_results: requestedMaxResults.toString(),
        page_number: pageNumber.toString(),
        ...(options?.cuisine && { recipe_cuisine: options.cuisine }),
        ...(options?.diet && { recipe_diet: options.diet }),
        ...(options?.dishType && { recipe_dish_type: options.dishType }),
        ...(options?.recipeTypeId && { recipe_type_id: options.recipeTypeId }),
        ...(options?.maxReadyTime && { recipe_max_ready_time: options.maxReadyTime.toString() })
      };
      
      const response = await this.makeCachedRequest('recipes.search', params);

      if (response.recipes && response.recipes.recipe) {
        const recipes = Array.isArray(response.recipes.recipe) ? response.recipes.recipe : [response.recipes.recipe];
        
        // Validate recipe objects and filter by images if needed
        let validRecipes = recipes.filter(recipe => 
          recipe && 
          typeof recipe === 'object' && 
          recipe.recipe_id && 
          recipe.recipe_name
        );
        
        // Filter recipes with images if required
        if (onlyWithImages) {
          const beforeCount = validRecipes.length;
          validRecipes = validRecipes.filter(recipe => {
            const hasImage = recipe.recipe_image && 
                            typeof recipe.recipe_image === 'string' && 
                            recipe.recipe_image.trim() !== '' &&
                            !recipe.recipe_image.includes('placeholder');
            return hasImage;
          });
          
          if (beforeCount !== validRecipes.length) {
            console.log(`Filtered out ${beforeCount - validRecipes.length} recipes without images`);
          }
        }
        
        // Sort recipes if sortBy option is provided
        if (options?.sortBy === 'popular') {
          // Sort by recipe name length as a proxy for popularity (shorter names are often more popular)
          // Or you could sort by recipe_id (lower IDs might indicate older/more popular recipes)
          validRecipes.sort((a, b) => {
            // Try to prioritize recipes with more complete data as "popular"
            const aComplete = (a.recipe_image ? 1 : 0) + (a.recipe_description ? 1 : 0);
            const bComplete = (b.recipe_image ? 1 : 0) + (b.recipe_description ? 1 : 0);
            return bComplete - aComplete;
          });
        } else if (options?.sortBy === 'time') {
          // Sort by total preparation time
          validRecipes.sort((a, b) => {
            const aTime = parseInt(a.recipe_preparation_time_min || '0') + parseInt(a.recipe_cooking_time_min || '0');
            const bTime = parseInt(b.recipe_preparation_time_min || '0') + parseInt(b.recipe_cooking_time_min || '0');
            return aTime - bTime;
          });
        }
        
        // Limit to requested number of results
        validRecipes = validRecipes.slice(0, maxResults);
        
        if (validRecipes.length !== recipes.length) {
          console.warn(`Filtered out ${recipes.length - validRecipes.length} recipe items`);
        }
        
        // Convert and translate recipes
        const convertedRecipes = await this.convertFatSecretRecipesToLegacy(validRecipes);
        
        return {
          recipes: convertedRecipes,
          totalResults: parseInt(response.recipes.total_results || '0'),
          pageNumber: parseInt(response.recipes.page_number || '0'),
          maxResults: parseInt(response.recipes.max_results || maxResults.toString())
        };
      }
      return {
        recipes: [],
        totalResults: 0,
        pageNumber: 0,
        maxResults: maxResults
      };
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  }

  async getRecipeById(recipeId: string): Promise<Recipe | null> {
    try {
      if (!recipeId || typeof recipeId !== 'string' || recipeId.trim() === '') {
        throw new Error('Recipe ID is required and must be a non-empty string');
      }

      // For Premier API, we might need to request ingredients explicitly
      const params = { 
        recipe_id: recipeId,
        // Premier API might support additional parameters
      };
      const response = await this.makeCachedRequest('recipe.get', params);

      console.log('=== FatSecret Premier API recipe.get response ===');
      console.log('Full response structure:', Object.keys(response));
      console.log('Recipe object keys:', response.recipe ? Object.keys(response.recipe) : 'No recipe');
      
      // Log full response for debugging (first 5000 chars)
      const responseStr = JSON.stringify(response, null, 2);
      console.log('Response data (first 5000 chars):', responseStr.substring(0, 5000));

      if (response.recipe) {
        const converted = await this.convertFatSecretRecipeToLegacy(response.recipe);
        console.log('Converted recipe with ingredients:', converted.extendedIngredients?.length || 0);
        if (converted.extendedIngredients && converted.extendedIngredients.length > 0) {
          console.log('✅ Ingredients found and translated:', converted.extendedIngredients);
        } else {
          console.warn('❌ No ingredients converted from Premier API response');
        }
        return converted;
      }
      return null;
    } catch (error) {
      console.error('Error getting recipe:', error);
      throw error;
    }
  }

  async getRandomRecipes(number: number = 20): Promise<Recipe[]> {
    try {
      // Use Ukrainian terms for better localization
      const popularTerms = ['курятина', 'паста', 'салат', 'суп', 'десерт', 'хліб', 'овочі', 'м\'ясо', 'риба', 'рис'];
      const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
      
      const result = await this.searchRecipes(randomTerm, { 
        number,
        onlyWithImages: true,
        sortBy: 'popular'
      });
      return result.recipes.slice(0, number);
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      throw error;
    }
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    try {
      if (ingredients.length === 0) return [];
      
      const searchTerm = ingredients[0] || 'recipe';
      const result = await this.searchRecipes(searchTerm, { 
        number: 10,
        onlyWithImages: true
      });
      return result.recipes;
    } catch (error) {
      console.error('Error fetching recipes by ingredients:', error);
      throw error;
    }
  }

  // Premier Features - Food Brands
  async getAllFoodBrands(): Promise<FatSecretBrand[]> {
    try {
      const response = await this.makeCachedRequest('food_brands.get_all');

      if (response.food_brands && response.food_brands.food_brand) {
        const brands = Array.isArray(response.food_brands.food_brand) 
          ? response.food_brands.food_brand 
          : [response.food_brands.food_brand];
        
        return brands.filter(brand => 
          brand && 
          typeof brand === 'object' && 
          brand.brand_id && 
          brand.brand_name
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting food brands:', error);
      throw error;
    }
  }

  // Premier Features - Food Categories
  async getAllFoodCategories(): Promise<FatSecretCategory[]> {
    try {
      const response = await this.makeCachedRequest('food_categories.get_all');

      if (response.food_categories && response.food_categories.food_category) {
        const categories = Array.isArray(response.food_categories.food_category) 
          ? response.food_categories.food_category 
          : [response.food_categories.food_category];
        
        return categories.filter(category => 
          category && 
          typeof category === 'object' && 
          category.category_id && 
          category.category_name
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting food categories:', error);
      throw error;
    }
  }

  // Premier Features - Food Sub Categories
  async getAllFoodSubCategories(): Promise<FatSecretSubCategory[]> {
    try {
      const response = await this.makeCachedRequest('food_sub_categories.get_all');

      if (response.food_sub_categories && response.food_sub_categories.food_sub_category) {
        const subCategories = Array.isArray(response.food_sub_categories.food_sub_category) 
          ? response.food_sub_categories.food_sub_category 
          : [response.food_sub_categories.food_sub_category];
        
        return subCategories.filter(subCategory => 
          subCategory && 
          typeof subCategory === 'object' && 
          subCategory.sub_category_id && 
          subCategory.sub_category_name
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting food sub categories:', error);
      throw error;
    }
  }

  // Premier Features - Recipe Types
  async getAllRecipeTypes(): Promise<FatSecretRecipeType[]> {
    try {
      const response = await this.makeCachedRequest('recipe_types.get_all');

      if (response.recipe_types && response.recipe_types.recipe_type) {
        const recipeTypes = Array.isArray(response.recipe_types.recipe_type) 
          ? response.recipe_types.recipe_type 
          : [response.recipe_types.recipe_type];
        
        return recipeTypes.filter(recipeType => 
          recipeType && 
          typeof recipeType === 'object' && 
          recipeType.recipe_type_id && 
          recipeType.recipe_type_name
        );
      }
      return [];
    } catch (error) {
      console.error('Error getting recipe types:', error);
      throw error;
    }
  }

  // Translate ingredients to Ukrainian using online translator only
  private async translateIngredients(ingredients: any[]): Promise<any[]> {
    if (ingredients.length === 0) return [];
    
    try {
      // Translate all ingredient names in parallel
      const translationPromises = ingredients.map(async (ingredient) => {
        // Check if ingredient name is already in Ukrainian
        const isNameUkrainian = isCyrillic(ingredient.name);
        
        let translatedName = ingredient.name;
        if (!isNameUkrainian) {
          try {
            const nameTranslation = await translationService.translateOnlineOnly(ingredient.name, 'uk');
            translatedName = nameTranslation.translatedText;
          } catch (error) {
            console.warn(`Failed to translate ingredient "${ingredient.name}":`, error);
          }
        }
        
        // Translate unit if it's not empty and not already Ukrainian
        let translatedUnit = ingredient.unit;
        if (ingredient.unit && ingredient.unit.trim() !== '' && !isCyrillic(ingredient.unit)) {
          try {
            const unitTranslation = await translationService.translateOnlineOnly(ingredient.unit, 'uk');
            translatedUnit = unitTranslation.translatedText;
          } catch (error) {
            console.warn(`Failed to translate unit "${ingredient.unit}":`, error);
          }
        }
        
        return {
          ...ingredient,
          name: translatedName,
          original: ingredient.name, // Keep original for reference
          unit: translatedUnit,
          unitShort: translatedUnit
        };
      });
      
      const translated = await Promise.all(translationPromises);
      console.log(`✅ Translated ${translated.length} ingredients online`);
      return translated;
    } catch (error) {
      console.error('Error translating ingredients:', error);
      // Return original ingredients if translation fails
      return ingredients;
    }
  }

  // Helper method to extract ingredient data from Premier API structure
  // Premier API format: { name: "Ingredient Name", quantity: "200 g" }
  private extractIngredientData(ing: any, index: number): any {
    // Log structure for debugging (only first ingredient)
    if (index === 0) {
      console.log('Sample ingredient structure (Premier API):', Object.keys(ing));
      console.log('Sample ingredient data:', ing);
    }
    
    // Premier API standard: name and quantity fields
    // Try name field first (most common in Premier)
    const name = ing.name
      || ing.ingredient_name
      || ing.ingredient_description 
      || ing.food_description
      || ing.food_name
      || ing.description
      || ing.ingredient
      || '';
    
    // Skip if name is empty
    if (!name || name.trim() === '') {
      return null;
    }
    
    // Extract amount and unit from quantity field (Premier API format: "200 g" or "1 cup")
    let amount = 1;
    let unit = '';
    
    // Premier API quantity format: "200 g", "1 cup", "2 tbsp", etc.
    if (ing.quantity) {
      // Parse quantity string like "200 g" or "1.5 cups"
      const quantityStr = String(ing.quantity).trim();
      const quantityMatch = quantityStr.match(/^([\d.]+)\s*(.*)$/);
      if (quantityMatch) {
        amount = parseFloat(quantityMatch[1]) || 1;
        unit = quantityMatch[2]?.trim() || '';
      } else {
        // Try to parse as number
        const num = parseFloat(quantityStr);
        if (!isNaN(num)) {
          amount = num;
        }
      }
    }
    
    // Fallback: try other quantity/amount fields
    if (amount === 1 && !unit) {
      if (ing.ingredient_serving_qty) {
        amount = parseFloat(ing.ingredient_serving_qty);
      } else if (ing.serving_qty) {
        amount = parseFloat(ing.serving_qty);
      } else if (ing.ingredient_serving_description) {
        const servingMatch = ing.ingredient_serving_description.match(/([\d.]+)\s*(.*)/);
        if (servingMatch) {
          amount = parseFloat(servingMatch[1]) || 1;
          unit = servingMatch[2]?.trim() || '';
        }
      } else if (ing.serving_description) {
        const servingMatch = ing.serving_description.match(/([\d.]+)\s*(.*)/);
        if (servingMatch) {
          amount = parseFloat(servingMatch[1]) || 1;
          unit = servingMatch[2]?.trim() || '';
        }
      } else if (ing.amount) {
        amount = parseFloat(ing.amount);
      } else if (ing.qty) {
        amount = parseFloat(ing.qty);
      }
    }
    
    // Get unit if not extracted from quantity
    if (!unit) {
      unit = ing.ingredient_serving_unit
        || ing.serving_unit
        || ing.unit
        || '';
    }
    
    return {
      id: parseInt(ing.ingredient_food_id || ing.food_id || ing.id || String(index)) || index,
      name: name.trim(),
      original: name.trim(),
      amount: amount,
      unit: unit.trim(),
      unitShort: unit.trim(),
      aisle: '',
      image: '',
      meta: []
    };
  }

  // Helper methods to convert FatSecret data to legacy format with online translation
  private async convertFatSecretRecipesToLegacy(fatSecretRecipes: FatSecretRecipe[]): Promise<Recipe[]> {
    // Convert recipes and translate titles and descriptions
    console.log(`🔄 Translating ${fatSecretRecipes.length} recipes to Ukrainian (online)...`);
    
    const convertedRecipes = await Promise.all(
      fatSecretRecipes.map(async (fsRecipe, index) => {
        // Check if text is already in Ukrainian (skip translation if needed)
        const isTitleUkrainian = isCyrillic(fsRecipe.recipe_name);
        const isDescriptionUkrainian = fsRecipe.recipe_description ? isCyrillic(fsRecipe.recipe_description) : true;
        
        // Translate recipe title and description to Ukrainian online (only if not already Ukrainian)
        const [titleTranslation, descriptionTranslation] = await Promise.all([
          isTitleUkrainian
            ? Promise.resolve({ translatedText: fsRecipe.recipe_name, provider: 'Already Ukrainian' })
            : translationService.translateOnlineOnly(fsRecipe.recipe_name, 'uk').catch(() => ({
                translatedText: fsRecipe.recipe_name,
                provider: 'Translation failed'
              })),
          !fsRecipe.recipe_description
            ? Promise.resolve({ translatedText: '', provider: 'No description' })
            : isDescriptionUkrainian
            ? Promise.resolve({ translatedText: fsRecipe.recipe_description, provider: 'Already Ukrainian' })
            : translationService.translateOnlineOnly(fsRecipe.recipe_description, 'uk').catch(() => ({
                translatedText: fsRecipe.recipe_description,
                provider: 'Translation failed'
              }))
        ]);
        
        return {
      id: parseInt(fsRecipe.recipe_id) || index + 1000,
          title: titleTranslation.translatedText,
      image: fsRecipe.recipe_image || '/placeholder.svg',
      readyInMinutes: parseInt(fsRecipe.recipe_preparation_time_min || '0') + parseInt(fsRecipe.recipe_cooking_time_min || '0'),
      servings: parseInt(fsRecipe.recipe_number_of_servings || '1'),
      sourceUrl: fsRecipe.recipe_url,
          summary: descriptionTranslation.translatedText,
      extendedIngredients: [],
      analyzedInstructions: [],
      nutrition: {
        nutrients: [
              { name: 'Calories', amount: parseFloat(fsRecipe.recipe_nutrition.calories || '0'), unit: 'ккал' },
              { name: 'Protein', amount: parseFloat(fsRecipe.recipe_nutrition.protein || '0'), unit: 'г' },
              { name: 'Fat', amount: parseFloat(fsRecipe.recipe_nutrition.fat || '0'), unit: 'г' },
              { name: 'Carbohydrates', amount: parseFloat(fsRecipe.recipe_nutrition.carbohydrate || '0'), unit: 'г' }
            ]
          }
        };
      })
    );
    
    console.log(`✅ Translated ${convertedRecipes.length} recipes online (titles and descriptions)`);
    return convertedRecipes;
  }

  private async convertFatSecretRecipeToLegacy(fsRecipe: any): Promise<Recipe> {
    // Extract ingredients from FatSecret Premier API response
    let extendedIngredients: any[] = [];
    
    console.log('=== Converting recipe, checking for ingredients ===');
    console.log('Available fields:', Object.keys(fsRecipe));
    
    // Premier API structure: recipe.ingredients.ingredient[] with name and quantity
    // Check ingredients field first (Premier API standard structure)
    if (fsRecipe.ingredients) {
      console.log('Found ingredients field (Premier API structure)');
      let ingredients: any[] = [];
      
      // Standard Premier structure: ingredients.ingredient[]
      if (fsRecipe.ingredients.ingredient) {
        ingredients = Array.isArray(fsRecipe.ingredients.ingredient)
          ? fsRecipe.ingredients.ingredient
          : [fsRecipe.ingredients.ingredient];
        console.log('Ingredients from ingredients.ingredient:', ingredients.length);
      } else if (Array.isArray(fsRecipe.ingredients)) {
        ingredients = fsRecipe.ingredients;
        console.log('Ingredients as direct array:', ingredients.length);
      }
      
      const rawIngredients = ingredients
        .filter((ing: any) => ing && typeof ing === 'object')
        .map((ing: any, index: number) => this.extractIngredientData(ing, index))
        .filter((ing: any) => ing !== null);
      
      // Translate ingredients to Ukrainian using online translator
      console.log('🔄 Translating ingredients to Ukrainian (online)...');
      extendedIngredients = await this.translateIngredients(rawIngredients);
      
      console.log('✅ Extracted and translated ingredients:', extendedIngredients.length);
    }
    
    // Fallback: Check recipe_ingredients structure (older format)
    if (extendedIngredients.length === 0 && fsRecipe.recipe_ingredients) {
      console.log('Trying recipe_ingredients field (fallback)');
      let ingredients: any[] = [];
      
      if (fsRecipe.recipe_ingredients.recipe_ingredient) {
        ingredients = Array.isArray(fsRecipe.recipe_ingredients.recipe_ingredient)
          ? fsRecipe.recipe_ingredients.recipe_ingredient
          : [fsRecipe.recipe_ingredients.recipe_ingredient];
        console.log('Ingredients from recipe_ingredient:', ingredients.length);
      } else if (Array.isArray(fsRecipe.recipe_ingredients)) {
        ingredients = fsRecipe.recipe_ingredients;
        console.log('Ingredients as array:', ingredients.length);
      }
      
      if (ingredients.length > 0) {
        const rawIngredients = ingredients
          .filter((ing: any) => ing && typeof ing === 'object')
          .map((ing: any, index: number) => this.extractIngredientData(ing, index))
          .filter((ing: any) => ing !== null);
        
        // Translate ingredients to Ukrainian using online translator
        extendedIngredients = await this.translateIngredients(rawIngredients);
        
        console.log('✅ Extracted and translated ingredients from recipe_ingredients:', extendedIngredients.length);
      }
    }
    
    // Final fallback: check for recipe_ingredient (singular) if still no ingredients
    if (extendedIngredients.length === 0 && fsRecipe.recipe_ingredient) {
      console.log('Trying recipe_ingredient (singular) as last fallback');
      let ingredients: any[] = Array.isArray(fsRecipe.recipe_ingredient)
        ? fsRecipe.recipe_ingredient
        : [fsRecipe.recipe_ingredient];
      
      const rawIngredients = ingredients
        .filter((ing: any) => ing && typeof ing === 'object')
        .map((ing: any, index: number) => this.extractIngredientData(ing, index))
        .filter((ing: any) => ing !== null);
      
      // Translate ingredients to Ukrainian using online translator
      extendedIngredients = await this.translateIngredients(rawIngredients);
      
      if (extendedIngredients.length > 0) {
        console.log('✅ Found and translated ingredients in recipe_ingredient (singular):', extendedIngredients.length);
      }
    }
    
    // Debug: Check all fields for potential ingredient data if still no ingredients
    if (extendedIngredients.length === 0) {
      console.log('🔍 Searching for any ingredient-related fields...');
      Object.keys(fsRecipe).forEach(key => {
        if (key.toLowerCase().includes('ingredient')) {
          console.log(`Found potential ingredient field: ${key}`);
          try {
            const value = fsRecipe[key];
            if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
              const items = Array.isArray(value) ? value : [value];
              console.log(`  Structure:`, items.length > 0 && typeof items[0] === 'object' ? Object.keys(items[0]) : 'not an object array');
            }
          } catch (e) {
            console.log(`  Error checking ${key}:`, e);
          }
        }
      });
    }
    
    // Final check
    if (extendedIngredients.length === 0) {
      console.warn('❌ No ingredients found in Premier API response for recipe:', fsRecipe.recipe_id);
      console.log('All available fields:', Object.keys(fsRecipe));
      console.log('Recipe description (first 200 chars):', fsRecipe.recipe_description?.substring(0, 200));
    } else {
      console.log('✅ Successfully extracted', extendedIngredients.length, 'ingredients from Premier API');
    }
    
    // Extract and translate instructions from FatSecret API response
    let analyzedInstructions: any[] = [];
    
    if (fsRecipe.recipe_directions && fsRecipe.recipe_directions.recipe_direction) {
      const directions = Array.isArray(fsRecipe.recipe_directions.recipe_direction)
        ? fsRecipe.recipe_directions.recipe_direction
        : [fsRecipe.recipe_directions.recipe_direction];
      
      // Translate instruction steps to Ukrainian (only if not already Ukrainian)
      console.log('🔄 Translating instruction steps to Ukrainian (online)...');
      const translatedSteps = await Promise.all(
        directions.map(async (dir: any, index: number) => {
          const stepText = dir.direction_description || dir.direction || '';
          let translatedStep = stepText;
          
          if (stepText && stepText.trim() !== '') {
            // Check if already in Ukrainian
            const isStepUkrainian = isCyrillic(stepText);
            if (!isStepUkrainian) {
              try {
                const translation = await translationService.translateOnlineOnly(stepText, 'uk');
                translatedStep = translation.translatedText;
              } catch (error) {
                console.warn(`Failed to translate step ${index + 1}:`, error);
              }
            }
          }
          
          return {
            number: index + 1,
            step: translatedStep,
            ingredients: extendedIngredients.filter(ing => 
              dir.direction_description?.toLowerCase().includes(ing.original?.toLowerCase() || ing.name.toLowerCase())
            ).map(ing => ({ id: ing.id, name: ing.name })),
            equipment: []
          };
        })
      );
      
      analyzedInstructions = [{
        name: '',
        steps: translatedSteps
      }];
      
      console.log(`✅ Translated ${translatedSteps.length} instruction steps online`);
    }
    
    // Translate recipe title and description to Ukrainian (only if not already Ukrainian)
    console.log('🔄 Translating recipe title and description to Ukrainian (online)...');
    const isTitleUkrainian = isCyrillic(fsRecipe.recipe_name);
    const isDescriptionUkrainian = fsRecipe.recipe_description ? isCyrillic(fsRecipe.recipe_description) : true;
    
    const [titleTranslation, descriptionTranslation] = await Promise.all([
      isTitleUkrainian
        ? Promise.resolve({ translatedText: fsRecipe.recipe_name, provider: 'Already Ukrainian' })
        : translationService.translateOnlineOnly(fsRecipe.recipe_name, 'uk').catch(() => ({
            translatedText: fsRecipe.recipe_name,
            provider: 'Translation failed'
          })),
      !fsRecipe.recipe_description
        ? Promise.resolve({ translatedText: '', provider: 'No description' })
        : isDescriptionUkrainian
        ? Promise.resolve({ translatedText: fsRecipe.recipe_description, provider: 'Already Ukrainian' })
        : translationService.translateOnlineOnly(fsRecipe.recipe_description, 'uk').catch(() => ({
            translatedText: fsRecipe.recipe_description,
            provider: 'Translation failed'
          }))
    ]);
    
    return {
      id: parseInt(fsRecipe.recipe_id) || 1000,
      title: titleTranslation.translatedText,
      image: fsRecipe.recipe_image || '/placeholder.svg',
      readyInMinutes: parseInt(fsRecipe.recipe_preparation_time_min || '0') + parseInt(fsRecipe.recipe_cooking_time_min || '0'),
      servings: parseInt(fsRecipe.recipe_number_of_servings || '1'),
      sourceUrl: fsRecipe.recipe_url,
      summary: descriptionTranslation.translatedText,
      extendedIngredients,
      analyzedInstructions,
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: parseFloat(fsRecipe.recipe_nutrition?.calories || '0'), unit: 'ккал' },
          { name: 'Protein', amount: parseFloat(fsRecipe.recipe_nutrition?.protein || '0'), unit: 'г' },
          { name: 'Fat', amount: parseFloat(fsRecipe.recipe_nutrition?.fat || '0'), unit: 'г' },
          { name: 'Carbohydrates', amount: parseFloat(fsRecipe.recipe_nutrition?.carbohydrate || '0'), unit: 'г' }
        ]
      }
    };
  }

  // Legacy methods for compatibility
  async searchFoodProducts(query: string, number: number = 20): Promise<FoodProduct[]> {
    try {
      const foods = await this.searchFoods(query, 0, number);
      return foods.map(food => ({
        id: parseInt(food.food_id),
        title: food.food_name,
        image: '/placeholder.svg',
        nutrition: {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0
        }
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Localization methods
  public getLocalization() {
    return this.currentLocale;
  }

  public setRegion(region: string, language?: string): void {
    if (SUPPORTED_REGIONS[region as keyof typeof SUPPORTED_REGIONS]) {
      this.currentLocale.region = region;
      this.currentLocale.regionName = SUPPORTED_REGIONS[region as keyof typeof SUPPORTED_REGIONS].name;
      
      if (language && SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
        this.currentLocale.language = language;
        this.currentLocale.languageName = SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES];
      } else {
        this.currentLocale.language = SUPPORTED_REGIONS[region as keyof typeof SUPPORTED_REGIONS].defaultLanguage;
        this.currentLocale.languageName = SUPPORTED_LANGUAGES[this.currentLocale.language as keyof typeof SUPPORTED_LANGUAGES];
      }
      
      // Clear cache when locale changes
      this.clearCache();
      console.log('Locale changed to:', this.currentLocale);
    } else {
      throw new Error(`Unsupported region: ${region}`);
    }
  }

  public getSupportedRegions() {
    return SUPPORTED_REGIONS;
  }

  public getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  // Cache management
  public clearCache(): void {
    cache.clear();
    console.log('Cache cleared');
  }

  public getCacheSize(): number {
    return cache.size;
  }

  // API status
  public isReady(): boolean {
    return true; // Always ready since we have API keys
  }

  public isPremier(): boolean {
    return true; // This is the Premier API service
  }
}

export const fatSecretApiService = new FatSecretPremierApiService();
