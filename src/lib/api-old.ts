// FatSecret Platform API service
import CryptoJS from 'crypto-js';

// FatSecret API Configuration
const FATSECRET_CLIENT_ID = "64e762751e134d2193adae8b47740c7c";
const FATSECRET_CLIENT_SECRET = "c09fe9f970f94835ba1a355241eecc77";
const FATSECRET_BASE_URL = "/api/fatsecret";

// FatSecret API Interfaces
export interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  brand_name?: string;
}

export interface FatSecretFoodDetails {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  brand_name?: string;
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

// Legacy interfaces for compatibility
export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl?: string;
  summary?: string;
  extendedIngredients: Ingredient[];
  analyzedInstructions: Instruction[];
  nutrition?: Nutrition;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

export interface Instruction {
  steps: InstructionStep[];
}

export interface InstructionStep {
    number: number;
    step: string;
}

export interface Nutrition {
  nutrients: Nutrient[];
}

export interface Nutrient {
    name: string;
    amount: number;
    unit: string;
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

class ApiService {
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

  private async makeFatSecretRequest(method: string, params: Record<string, string> = {}): Promise<any> {
    try {
      // Validate required parameters
      if (!method || typeof method !== 'string') {
        throw new Error('Method parameter is required and must be a string');
      }

      if (!FATSECRET_CLIENT_ID || !FATSECRET_CLIENT_SECRET) {
        throw new Error('FatSecret API credentials are not configured');
      }

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
        const errorText = await response.text();
        console.error('FatSecret API Error:', response.status, errorText);
        throw new Error(`FatSecret API request failed: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('FatSecret API Response:', responseText.substring(0, 200) + '...');

      // Validate response
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from FatSecret API');
    }

    try {
        const parsedResponse = JSON.parse(responseText);
        
        // Check for API errors in response
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

  // Food search methods - try different localization approaches
  async searchFoods(query: string, pageNumber: number = 0, maxResults: number = 20): Promise<FatSecretFood[]> {
    try {
      // Validate input parameters
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Query parameter is required and must be a non-empty string');
      }

      if (pageNumber < 0 || !Number.isInteger(pageNumber)) {
        throw new Error('Page number must be a non-negative integer');
      }

      if (maxResults <= 0 || maxResults > 50 || !Number.isInteger(maxResults)) {
        throw new Error('Max results must be a positive integer between 1 and 50');
      }

      // Detect if query is in Cyrillic (Ukrainian/Russian)
      const isCyrillic = /[а-яёіїєґ]/i.test(query);
      
      console.log('Searching for:', query, 'isCyrillic:', isCyrillic);
      
      // Try different localization parameters
      const searchParams: Record<string, string> = {
        search_expression: query,
        page_number: pageNumber.toString(),
        max_results: maxResults.toString()
      };
      
      // Try different locale parameters for Ukraine
      if (isCyrillic) {
        // Try different locale formats
        searchParams.locale = 'uk_UA'; // Ukrainian locale
        // Also try without locale to see if it works
        console.log('Using Ukrainian locale:', searchParams.locale);
      }
      
      let response = await this.makeFatSecretRequest('foods.search', searchParams);

      console.log('Food search response:', response);

      // If no results with Ukrainian locale, try without locale
      if (isCyrillic && (!response.foods || !response.foods.food || 
          (Array.isArray(response.foods.food) ? response.foods.food.length === 0 : false))) {
        console.log('No results with Ukrainian locale, trying without locale');
        const fallbackParams = { ...searchParams };
        delete fallbackParams.locale;
        response = await this.makeFatSecretRequest('foods.search', fallbackParams);
        console.log('Fallback food search response:', response);
        
        // If still no results, try English translation
        if (!response.foods || !response.foods.food || 
            (Array.isArray(response.foods.food) ? response.foods.food.length === 0 : false)) {
          console.log('No results without locale, trying English translation');
          const englishTranslations: Record<string, string> = {
            'риба': 'fish',
            'рыба': 'fish',
            'паста': 'pasta',
            'макарони': 'pasta',
            'курятина': 'chicken',
            'курица': 'chicken',
            'мясо': 'meat',
            'овочі': 'vegetables',
            'овощи': 'vegetables',
            'салат': 'salad',
            'суп': 'soup',
            'борщ': 'borscht',
            'рис': 'rice',
            'картопля': 'potato',
            'картофель': 'potato',
            'хліб': 'bread',
            'хлеб': 'bread',
            'десерт': 'dessert',
            'торт': 'cake',
            'печиво': 'cookies',
            'печенье': 'cookies',
            'гречка': 'buckwheat',
            'яйце': 'egg',
            'яйцо': 'egg',
            'молоко': 'milk',
            'сир': 'cheese',
            'сыр': 'cheese',
            'томат': 'tomato',
            'помидор': 'tomato',
            'огірок': 'cucumber',
            'огурец': 'cucumber',
            'цибуля': 'onion',
            'лук': 'onion',
            'морква': 'carrot',
            'морковь': 'carrot',
            'яблуко': 'apple',
            'яблоко': 'apple',
            'банан': 'banana',
            'творог': 'cottage cheese',
            'йогурт': 'yogurt',
            'масло': 'butter',
            'олія': 'oil'
          };
          
          const englishQuery = englishTranslations[query.toLowerCase()];
          if (englishQuery) {
            console.log('Trying English translation for food:', englishQuery);
            const translationParams = { ...fallbackParams };
            translationParams.search_expression = englishQuery;
            response = await this.makeFatSecretRequest('foods.search', translationParams);
            console.log('English translation food search response:', response);
          }
        }
      }

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
        
        return validFoods;
      }
      return [];
    } catch (error) {
      console.error('Error searching foods:', error);
      throw error;
    }
  }

  async getFoodDetails(foodId: string, locale?: string): Promise<FatSecretFoodDetails | null> {
    try {
      // Validate input parameters
      if (!foodId || typeof foodId !== 'string' || foodId.trim() === '') {
        throw new Error('Food ID is required and must be a non-empty string');
      }

      const requestParams: Record<string, string> = {
        food_id: foodId
      };
      
      // Add Ukrainian localization if locale is provided
      if (locale) {
        requestParams.locale = locale;
        requestParams.language = 'uk';
        requestParams.region = 'UA';
        requestParams.country = 'UA';
      }
      
      const response = await this.makeFatSecretRequest('food.get', requestParams);

      console.log('Food details response:', response);

      return response.food || null;
    } catch (error) {
      console.error('Error getting food details:', error);
      throw error;
    }
  }

  async searchFoodsWithNutrition(query: string, maxResults: number = 20): Promise<any[]> {
    try {
      // Validate input parameters
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Query parameter is required and must be a non-empty string');
      }

      if (maxResults <= 0 || maxResults > 50 || !Number.isInteger(maxResults)) {
        throw new Error('Max results must be a positive integer between 1 and 50');
      }

      const foods = await this.searchFoods(query, 0, maxResults);
      
      // Detect if query is in Cyrillic for consistent localization
      const isCyrillic = /[а-яёіїєґ]/i.test(query);
      const locale = isCyrillic ? 'uk_UA' : undefined; // Use Ukrainian locale
      
      // Get nutrition info for each food
      const foodsWithNutrition = await Promise.all(
        foods.slice(0, 10).map(async (food) => {
          try {
            // Validate food object
            if (!food || !food.food_id) {
              console.warn('Invalid food object:', food);
      return null;
    }

            const details = await this.getFoodDetails(food.food_id, locale);
            if (details && details.servings && details.servings.serving) {
              const serving = Array.isArray(details.servings.serving) 
                ? details.servings.serving[0] 
                : details.servings.serving;
              
              // Validate serving object
              if (!serving || typeof serving !== 'object') {
                console.warn('Invalid serving object for food:', food.food_id);
                return food;
              }
              
              return {
                ...food,
                calories: parseFloat(serving.calories || '0') || 0,
                protein: parseFloat(serving.protein || '0') || 0,
                fat: parseFloat(serving.fat || '0') || 0,
                carbohydrate: parseFloat(serving.carbohydrate || '0') || 0,
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

      // Filter out null results
      const validFoodsWithNutrition = foodsWithNutrition.filter(food => food !== null);
      
      return validFoodsWithNutrition;
    } catch (error) {
      console.error('Error searching foods with nutrition:', error);
      throw error;
    }
  }

  // Recipe search methods
  async searchRecipes(query: string, options?: {
    cuisine?: string;
    diet?: string;
    dishType?: string;
    maxReadyTime?: number;
    number?: number;
    pageNumber?: number;
  }): Promise<{ recipes: Recipe[]; totalResults: number; pageNumber: number; maxResults: number }> {
    try {
      // Validate input parameters
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new Error('Query parameter is required and must be a non-empty string');
      }

      const pageNumber = options?.pageNumber || 0;
      const maxResults = options?.number || 20;

      // Validate pagination parameters
      if (pageNumber < 0 || !Number.isInteger(pageNumber)) {
        throw new Error('Page number must be a non-negative integer');
      }

      if (maxResults <= 0 || maxResults > 50 || !Number.isInteger(maxResults)) {
        throw new Error('Max results must be a positive integer between 1 and 50');
      }

      // Validate maxReadyTime if provided
      if (options?.maxReadyTime !== undefined && (options.maxReadyTime < 0 || !Number.isInteger(options.maxReadyTime))) {
        throw new Error('Max ready time must be a non-negative integer');
      }
      
      // Detect if query is in Cyrillic for localization
      const isCyrillic = /[а-яёіїєґ]/i.test(query);
      
      const requestParams: Record<string, string> = {
        search_expression: query,
        max_results: maxResults.toString(),
        page_number: pageNumber.toString(),
        ...(options?.cuisine && { recipe_cuisine: options.cuisine }),
        ...(options?.diet && { recipe_diet: options.diet }),
        ...(options?.dishType && { recipe_dish_type: options.dishType }),
        ...(options?.maxReadyTime && { recipe_max_ready_time: options.maxReadyTime.toString() })
      };
      
      // Add Ukrainian localization for Cyrillic queries
      if (isCyrillic) {
        requestParams.locale = 'uk_UA';
        console.log('Using Ukrainian locale for recipes:', requestParams.locale);
        // Remove other parameters that might not be supported
        // requestParams.language = 'uk';
        // requestParams.region = 'UA';
        // requestParams.country = 'UA';
      }
      
      let response = await this.makeFatSecretRequest('recipes.search', requestParams);

      console.log('Recipe search response:', response);

      // If no results with Ukrainian locale, try without locale
      if (isCyrillic && (!response.recipes || !response.recipes.recipe || 
          (Array.isArray(response.recipes.recipe) ? response.recipes.recipe.length === 0 : false))) {
        console.log('No results with Ukrainian locale, trying without locale');
        const fallbackParams = { ...requestParams };
        delete fallbackParams.locale;
        response = await this.makeFatSecretRequest('recipes.search', fallbackParams);
        console.log('Fallback search response:', response);
        
        // If still no results, try English translation
        if (!response.recipes || !response.recipes.recipe || 
            (Array.isArray(response.recipes.recipe) ? response.recipes.recipe.length === 0 : false)) {
          console.log('No results without locale, trying English translation');
          const englishTranslations: Record<string, string> = {
            'риба': 'fish',
            'рыба': 'fish',
            'паста': 'pasta',
            'макарони': 'pasta',
            'курятина': 'chicken',
            'курица': 'chicken',
            'мясо': 'meat',
            'овочі': 'vegetables',
            'овощи': 'vegetables',
            'салат': 'salad',
            'суп': 'soup',
            'борщ': 'borscht',
            'рис': 'rice',
            'картопля': 'potato',
            'картофель': 'potato',
            'хліб': 'bread',
            'хлеб': 'bread',
            'десерт': 'dessert',
            'торт': 'cake',
            'печиво': 'cookies',
            'печенье': 'cookies'
          };
          
          const englishQuery = englishTranslations[query.toLowerCase()];
          if (englishQuery) {
            console.log('Trying English translation:', englishQuery);
            const translationParams = { ...fallbackParams };
            translationParams.search_expression = englishQuery;
            response = await this.makeFatSecretRequest('recipes.search', translationParams);
            console.log('English translation search response:', response);
          }
        }
      }

      if (response.recipes && response.recipes.recipe) {
        const recipes = Array.isArray(response.recipes.recipe) ? response.recipes.recipe : [response.recipes.recipe];
        
        // Validate recipe objects
        const validRecipes = recipes.filter(recipe => 
          recipe && 
          typeof recipe === 'object' && 
          recipe.recipe_id && 
          recipe.recipe_name
        );
        
        if (validRecipes.length !== recipes.length) {
          console.warn(`Filtered out ${recipes.length - validRecipes.length} invalid recipe items`);
        }
        
        return {
          recipes: this.convertFatSecretRecipesToLegacy(validRecipes),
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

  async getRecipeById(recipeId: string, locale?: string): Promise<Recipe | null> {
    try {
      // Validate input parameters
      if (!recipeId || typeof recipeId !== 'string' || recipeId.trim() === '') {
        throw new Error('Recipe ID is required and must be a non-empty string');
      }

      const requestParams: Record<string, string> = {
        recipe_id: recipeId
      };
      
      // Add Ukrainian localization if locale is provided
      if (locale) {
        requestParams.locale = locale;
        requestParams.language = 'uk';
        requestParams.region = 'UA';
        requestParams.country = 'UA';
      }
      
      const response = await this.makeFatSecretRequest('recipe.get', requestParams);

      console.log('Recipe details response:', response);

      if (response.recipe) {
        return this.convertFatSecretRecipeToLegacy(response.recipe);
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
      
      const result = await this.searchRecipes(randomTerm, { number });
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
      const result = await this.searchRecipes(searchTerm, { number: 10 });
      return result.recipes;
    } catch (error) {
      console.error('Error fetching recipes by ingredients:', error);
      throw error;
    }
  }

  // Helper methods to convert FatSecret data to legacy format
  private convertFatSecretRecipesToLegacy(fatSecretRecipes: FatSecretRecipe[]): Recipe[] {
    return fatSecretRecipes.map((fsRecipe, index) => ({
      id: parseInt(fsRecipe.recipe_id) || index + 1000,
      title: fsRecipe.recipe_name,
      image: fsRecipe.recipe_image || '/placeholder.svg',
      readyInMinutes: parseInt(fsRecipe.recipe_preparation_time_min || '0') + parseInt(fsRecipe.recipe_cooking_time_min || '0'),
      servings: parseInt(fsRecipe.recipe_number_of_servings || '1'),
      sourceUrl: fsRecipe.recipe_url,
      summary: fsRecipe.recipe_description,
      extendedIngredients: [], // FatSecret doesn't provide detailed ingredients in search
      analyzedInstructions: [], // FatSecret doesn't provide detailed instructions in search
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: parseFloat(fsRecipe.recipe_nutrition.calories || '0'), unit: 'kcal' },
          { name: 'Protein', amount: parseFloat(fsRecipe.recipe_nutrition.protein || '0'), unit: 'g' },
          { name: 'Fat', amount: parseFloat(fsRecipe.recipe_nutrition.fat || '0'), unit: 'g' },
          { name: 'Carbs', amount: parseFloat(fsRecipe.recipe_nutrition.carbohydrate || '0'), unit: 'g' }
        ]
      }
    }));
  }

  private convertFatSecretRecipeToLegacy(fsRecipe: any): Recipe {
    return {
      id: parseInt(fsRecipe.recipe_id) || 1000,
      title: fsRecipe.recipe_name,
      image: fsRecipe.recipe_image || '/placeholder.svg',
      readyInMinutes: parseInt(fsRecipe.recipe_preparation_time_min || '0') + parseInt(fsRecipe.recipe_cooking_time_min || '0'),
      servings: parseInt(fsRecipe.recipe_number_of_servings || '1'),
      sourceUrl: fsRecipe.recipe_url,
      summary: fsRecipe.recipe_description,
      extendedIngredients: [], // Will be populated if needed
      analyzedInstructions: [], // Will be populated if needed
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: parseFloat(fsRecipe.recipe_nutrition?.calories || '0'), unit: 'kcal' },
          { name: 'Protein', amount: parseFloat(fsRecipe.recipe_nutrition?.protein || '0'), unit: 'g' },
          { name: 'Fat', amount: parseFloat(fsRecipe.recipe_nutrition?.fat || '0'), unit: 'g' },
          { name: 'Carbs', amount: parseFloat(fsRecipe.recipe_nutrition?.carbohydrate || '0'), unit: 'g' }
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
          calories: 0, // Will be filled when getting details
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

  // API is ready to use with provided keys
  public isReady(): boolean {
    return true; // Always ready since we have API keys
  }
}

export const apiService = new ApiService();