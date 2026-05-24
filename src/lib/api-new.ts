// Новый улучшенный API сервис с кэшированием и fallback данными
import CryptoJS from 'crypto-js';

// Конфигурация API
const FATSECRET_CLIENT_ID = "64e762751e134d2193adae8b47740c7c";
const FATSECRET_CLIENT_SECRET = "c09fe9f970f94835ba1a355241eecc77";
const FATSECRET_BASE_URL = "/api/fatsecret";

// Кэш для API запросов
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут
const cache = new Map<string, { data: any; timestamp: number }>();

// Fallback данные для офлайн режима
const FALLBACK_FOODS = [
  { food_id: "1", food_name: "Яйце куряче", calories: 155, protein: 13, fat: 11, carbs: 1.1 },
  { food_id: "2", food_name: "Молоко 3.2%", calories: 60, protein: 3.2, fat: 3.2, carbs: 4.7 },
  { food_id: "3", food_name: "Хліб білий", calories: 265, protein: 9, fat: 3.2, carbs: 49 },
  { food_id: "4", food_name: "Масло вершкове", calories: 748, protein: 0.5, fat: 82.5, carbs: 0.8 },
  { food_id: "5", food_name: "Сир твердий", calories: 363, protein: 25, fat: 27, carbs: 2 },
  { food_id: "6", food_name: "Курятина", calories: 165, protein: 31, fat: 3.6, carbs: 0 },
  { food_id: "7", food_name: "Риба", calories: 206, protein: 22, fat: 12, carbs: 0 },
  { food_id: "8", food_name: "Картопля", calories: 77, protein: 2, fat: 0.1, carbs: 17 },
  { food_id: "9", food_name: "Морква", calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6 },
  { food_id: "10", food_name: "Цибуля", calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3 },
  { food_id: "11", food_name: "Помідори", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
  { food_id: "12", food_name: "Огірки", calories: 16, protein: 0.7, fat: 0.1, carbs: 4 },
  { food_id: "13", food_name: "Яблука", calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
  { food_id: "14", food_name: "Банани", calories: 89, protein: 1.1, fat: 0.3, carbs: 23 },
  { food_id: "15", food_name: "Рис", calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  { food_id: "16", food_name: "Гречка", calories: 132, protein: 4.5, fat: 1.1, carbs: 25 },
  { food_id: "17", food_name: "Макарони", calories: 131, protein: 5, fat: 1.1, carbs: 25 },
  { food_id: "18", food_name: "Йогурт", calories: 59, protein: 10, fat: 0.4, carbs: 3.6 },
  { food_id: "19", food_name: "Творог", calories: 103, protein: 18, fat: 0.6, carbs: 3.3 },
  { food_id: "20", food_name: "Олія соняшникова", calories: 899, protein: 0, fat: 99.9, carbs: 0 }
];

const FALLBACK_RECIPES = [
  {
    id: 1,
    title: "Омлет з сиром",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    readyInMinutes: 15,
    servings: 2,
    summary: "Смачний омлет з сиром та зеленню",
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 320, unit: "kcal" },
        { name: "Protein", amount: 25, unit: "g" },
        { name: "Fat", amount: 22, unit: "g" },
        { name: "Carbs", amount: 3, unit: "g" }
      ]
    }
  },
  {
    id: 2,
    title: "Салат з помідорів та огірків",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    readyInMinutes: 10,
    servings: 4,
    summary: "Свіжий овочевий салат",
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 45, unit: "kcal" },
        { name: "Protein", amount: 2, unit: "g" },
        { name: "Fat", amount: 1, unit: "g" },
        { name: "Carbs", amount: 8, unit: "g" }
      ]
    }
  },
  {
    id: 3,
    title: "Куряча грудка з картоплею",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    readyInMinutes: 45,
    servings: 4,
    summary: "Смачна куряча грудка з запеченою картоплею",
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 280, unit: "kcal" },
        { name: "Protein", amount: 35, unit: "g" },
        { name: "Fat", amount: 8, unit: "g" },
        { name: "Carbs", amount: 15, unit: "g" }
      ]
    }
  },
  {
    id: 4,
    title: "Молочна каша з рисом",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    readyInMinutes: 25,
    servings: 2,
    summary: "Смачна молочна каша з рисом",
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 180, unit: "kcal" },
        { name: "Protein", amount: 6, unit: "g" },
        { name: "Fat", amount: 4, unit: "g" },
        { name: "Carbs", amount: 32, unit: "g" }
      ]
    }
  },
  {
    id: 5,
    title: "Сирники",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    readyInMinutes: 30,
    servings: 6,
    summary: "Традиційні українські сирники",
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 220, unit: "kcal" },
        { name: "Protein", amount: 15, unit: "g" },
        { name: "Fat", amount: 8, unit: "g" },
        { name: "Carbs", amount: 25, unit: "g" }
      ]
    }
  },
  {
    id: 6,
    title: "Гречка з м'ясом",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
    readyInMinutes: 40,
    servings: 4,
    summary: "Смачна гречка з курячим м'ясом",
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 250, unit: "kcal" },
        { name: "Protein", amount: 20, unit: "g" },
        { name: "Fat", amount: 6, unit: "g" },
        { name: "Carbs", amount: 30, unit: "g" }
      ]
    }
  }
];

// Интерфейсы
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

// Утилиты для кэширования
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

// Утилиты для поиска в fallback данных
function searchInFallbackFoods(query: string): Food[] {
  const searchTerm = query.toLowerCase();
  return FALLBACK_FOODS.filter(food => 
    food.food_name.toLowerCase().includes(searchTerm)
  ).map(food => ({
    food_id: food.food_id,
    food_name: food.food_name,
    calories: food.calories,
    protein: food.protein,
    fat: food.fat,
    carbs: food.carbs
  }));
}

function searchInFallbackRecipes(query: string): Recipe[] {
  const searchTerm = query.toLowerCase();
  return FALLBACK_RECIPES.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm) ||
    (recipe.summary && recipe.summary.toLowerCase().includes(searchTerm))
  );
}

// Основной API класс
class ImprovedApiService {
  private isOnline = navigator.onLine;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor() {
    // Слушаем изменения онлайн статуса
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Очередь запросов для обработки при восстановлении соединения
  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    while (this.requestQueue.length > 0 && this.isOnline) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Queue processing error:', error);
        }
      }
    }
    this.isProcessingQueue = false;
  }

  // Базовый метод для API запросов
  private async makeRequest(method: string, params: Record<string, any> = {}): Promise<any> {
    const cacheKey = getCacheKey(method, params);
    
    // Проверяем кэш
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('Using cached data for:', method);
      return cached;
    }

    // Если офлайн, возвращаем fallback данные
    if (!this.isOnline) {
      console.log('Offline mode, using fallback data for:', method);
      return this.getFallbackData(method, params);
    }

    try {
      const result = await this.makeFatSecretRequest(method, params);
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('API request failed, using fallback data:', error);
      return this.getFallbackData(method, params);
    }
  }

  // Получение fallback данных
  private getFallbackData(method: string, params: Record<string, any>): any {
    switch (method) {
      case 'foods.search':
        const query = params.search_expression || '';
        return { foods: { food: searchInFallbackFoods(query) } };
      
      case 'recipes.search':
        const recipeQuery = params.search_expression || '';
        return { recipes: { recipe: searchInFallbackRecipes(recipeQuery) } };
      
      default:
        return {};
    }
  }

  // FatSecret API запрос
  private async makeFatSecretRequest(method: string, params: Record<string, any> = {}): Promise<any> {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: FATSECRET_CLIENT_ID,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: this.generateTimestamp(),
      oauth_version: '1.0',
      method: method,
      format: 'json',
      ...params
    };

    const signatureBaseString = this.createSignatureBaseString('POST', 'https://platform.fatsecret.com/rest/server.api', oauthParams);
    const signingKey = `${encodeURIComponent(FATSECRET_CLIENT_SECRET)}&`;
    const signature = CryptoJS.HmacSHA1(signatureBaseString, signingKey);
    oauthParams.oauth_signature = CryptoJS.enc.Base64.stringify(signature);

    console.log('FatSecret API Request:', method, params);

    const response = await fetch(FATSECRET_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(oauthParams)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('FatSecret API Response:', responseText.substring(0, 200) + '...');

    try {
      const parsedResponse = JSON.parse(responseText);
      
      if (parsedResponse.error) {
        throw new Error(`API Error: ${parsedResponse.error.message || 'Unknown error'}`);
      }
      
      return parsedResponse;
    } catch (parseError) {
      throw new Error('Invalid JSON response from API');
    }
  }

  // Утилиты для OAuth
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

  // Публичные методы API
  async searchFoods(query: string, pageNumber: number = 0, maxResults: number = 20): Promise<Food[]> {
    if (!query.trim()) return [];

    const params = {
      search_expression: query,
      page_number: pageNumber.toString(),
      max_results: maxResults.toString()
    };

    const response = await this.makeRequest('foods.search', params);
    
    if (response.foods && response.foods.food) {
      const foods = Array.isArray(response.foods.food) ? response.foods.food : [response.foods.food];
      return foods.map((food: any) => ({
        food_id: food.food_id,
        food_name: food.food_name,
        calories: 0, // Будет заполнено при получении деталей
        protein: 0,
        fat: 0,
        carbs: 0
      }));
    }
    
    return [];
  }

  async searchFoodsWithNutrition(query: string, maxResults: number = 20): Promise<Food[]> {
    const foods = await this.searchFoods(query, 0, maxResults);
    
    // Для fallback данных сразу возвращаем с питательной ценностью
    if (!this.isOnline || foods.length === 0) {
      return searchInFallbackFoods(query).slice(0, maxResults);
    }

    // Для API данных получаем детали
    const foodsWithNutrition = await Promise.all(
      foods.slice(0, 10).map(async (food) => {
        try {
          const details = await this.getFoodDetails(food.food_id);
          if (details && details.servings && details.servings.serving) {
            const serving = Array.isArray(details.servings.serving) 
              ? details.servings.serving[0] 
              : details.servings.serving;
            
            return {
              ...food,
              calories: parseFloat(serving.calories || '0') || 0,
              protein: parseFloat(serving.protein || '0') || 0,
              fat: parseFloat(serving.fat || '0') || 0,
              carbs: parseFloat(serving.carbohydrate || '0') || 0,
              fiber: parseFloat(serving.fiber || '0') || 0,
              sugar: parseFloat(serving.sugar || '0') || 0,
              sodium: parseFloat(serving.sodium || '0') || 0
            };
          }
          return food;
        } catch (error) {
          console.error('Error getting food details for', food.food_id, error);
          return food;
        }
      })
    );

    return foodsWithNutrition.filter(food => food !== null);
  }

  async getFoodDetails(foodId: string): Promise<any> {
    const params = { food_id: foodId };
    return await this.makeRequest('food.get', params);
  }

  async searchRecipes(query: string, options?: {
    cuisine?: string;
    diet?: string;
    dishType?: string;
    maxReadyTime?: number;
    number?: number;
    pageNumber?: number;
  }): Promise<{ recipes: Recipe[]; totalResults: number; pageNumber: number; maxResults: number }> {
    if (!query.trim()) {
      return { recipes: [], totalResults: 0, pageNumber: 0, maxResults: 0 };
    }

    const pageNumber = options?.pageNumber || 0;
    const maxResults = options?.number || 20;

    const params = {
      search_expression: query,
      max_results: maxResults.toString(),
      page_number: pageNumber.toString(),
      ...(options?.cuisine && { recipe_cuisine: options.cuisine }),
      ...(options?.diet && { recipe_diet: options.diet }),
      ...(options?.dishType && { recipe_dish_type: options.dishType }),
      ...(options?.maxReadyTime && { recipe_max_ready_time: options.maxReadyTime.toString() })
    };

    const response = await this.makeRequest('recipes.search', params);

    if (response.recipes && response.recipes.recipe) {
      const recipes = Array.isArray(response.recipes.recipe) ? response.recipes.recipe : [response.recipes.recipe];
      
      const convertedRecipes = recipes.map((fsRecipe: any, index: number) => ({
        id: parseInt(fsRecipe.recipe_id) || index + 1000,
        title: fsRecipe.recipe_name,
        image: fsRecipe.recipe_image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        readyInMinutes: parseInt(fsRecipe.recipe_preparation_time_min || '0') + parseInt(fsRecipe.recipe_cooking_time_min || '0'),
        servings: parseInt(fsRecipe.recipe_number_of_servings || '1'),
        sourceUrl: fsRecipe.recipe_url,
        summary: fsRecipe.recipe_description,
        extendedIngredients: [],
        analyzedInstructions: [],
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: parseFloat(fsRecipe.recipe_nutrition?.calories || '0'), unit: 'kcal' },
            { name: 'Protein', amount: parseFloat(fsRecipe.recipe_nutrition?.protein || '0'), unit: 'g' },
            { name: 'Fat', amount: parseFloat(fsRecipe.recipe_nutrition?.fat || '0'), unit: 'g' },
            { name: 'Carbs', amount: parseFloat(fsRecipe.recipe_nutrition?.carbohydrate || '0'), unit: 'g' }
          ]
        }
      }));

      return {
        recipes: convertedRecipes,
        totalResults: parseInt(response.recipes.total_results || '0'),
        pageNumber: parseInt(response.recipes.page_number || '0'),
        maxResults: parseInt(response.recipes.max_results || maxResults.toString())
      };
    }

    return { recipes: [], totalResults: 0, pageNumber: 0, maxResults: maxResults };
  }

  async getRandomRecipes(number: number = 20): Promise<Recipe[]> {
    const popularTerms = ['курятина', 'паста', 'салат', 'суп', 'десерт', 'хліб', 'овочі', 'м\'ясо', 'риба', 'рис'];
    const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
    
    const result = await this.searchRecipes(randomTerm, { number });
    return result.recipes.slice(0, number);
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    if (ingredients.length === 0) return [];
    
    const searchTerm = ingredients[0] || 'recipe';
    const result = await this.searchRecipes(searchTerm, { number: 10 });
    return result.recipes;
  }

  // Legacy методы для совместимости
  async searchFoodProducts(query: string, number: number = 20): Promise<FoodProduct[]> {
    const foods = await this.searchFoods(query, 0, number);
    return foods.map(food => ({
      id: parseInt(food.food_id),
      title: food.food_name,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      nutrition: {
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs
      }
    }));
  }

  public isReady(): boolean {
    return true;
  }

  // Методы для управления кэшем
  public clearCache(): void {
    cache.clear();
  }

  public getCacheSize(): number {
    return cache.size;
  }
}

export const apiService = new ImprovedApiService();


