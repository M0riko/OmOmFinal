// FatSecret Premier API Integration
import { toast } from "sonner";
import { fatSecretApiService, type Food, type Recipe, type FoodProduct } from './fatsecret-api';
import { translationService } from './translation-service';
import { customProductsService, CustomProduct } from './custom-products';

// Re-export types for compatibility
export type { Food, Recipe, FoodProduct };

// Enhanced API service with FatSecret Premier integration
class EnhancedApiService {
  constructor() {
    // Listen for online/offline status
    window.addEventListener('online', () => {
      console.log('Back online - using FatSecret Premier API');
    });
    
    window.addEventListener('offline', () => {
      console.log('Offline - API unavailable');
    });
  }

  // Food search methods
  async searchFoods(query: string, pageNumber: number = 0, maxResults: number = 20): Promise<Food[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      // Check if query is in Cyrillic (Ukrainian/Russian)
      const isCyrillicQuery = this.isCyrillic(query);
      
      if (isCyrillicQuery) {
        console.log(`🔄 Detected Cyrillic query: "${query}"`);
        
        // Use automatic translation service
        try {
          const translationResult = await translationService.translate(query, 'en');
          console.log(`✅ Auto-translated: "${query}" → "${translationResult.translatedText}" (${translationResult.provider})`);
          
          // Search with translated query
          const foods = await fatSecretApiService.searchFoods(translationResult.translatedText, pageNumber, maxResults);
          
          return foods.map(food => ({
            food_id: food.food_id,
            food_name: `${food.food_name} (${query})`, // Show original query
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0
          }));
        } catch (translationError) {
          console.warn('Auto-translation failed:', translationError);
          
          // Try dictionary translation
          const englishQuery = this.translateToEnglish(query);
          if (englishQuery !== query) {
            const englishFoods = await fatSecretApiService.searchFoods(englishQuery, pageNumber, maxResults);
            return englishFoods.map(food => ({
              food_id: food.food_id,
              food_name: `${food.food_name} (${query})`,
              calories: 0,
              protein: 0,
              fat: 0,
              carbs: 0
            }));
          }
        }
      }

      // For non-Cyrillic queries, search directly
      const foods = await fatSecretApiService.searchFoods(query, pageNumber, maxResults);

      return foods.map(food => ({
        food_id: food.food_id,
        food_name: food.food_name,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      }));
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error('Помилка пошуку продуктів');
      throw error;
    }
  }

  async searchFoodsWithNutrition(query: string, maxResults: number = 20): Promise<Food[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      const foods = await fatSecretApiService.searchFoodsWithNutrition(query, maxResults);
      
      if (foods.length === 0 && this.isCyrillic(query)) {
        // Try English translation for Cyrillic queries
        const englishQuery = this.translateToEnglish(query);
        if (englishQuery !== query) {
          const englishFoods = await fatSecretApiService.searchFoodsWithNutrition(englishQuery, maxResults);
          return englishFoods.map(food => ({
            ...food,
            food_name: `${food.food_name} (${query})` // Show original query
          }));
        }
      }

      return foods;
    } catch (error) {
      console.error('Error searching foods with nutrition:', error);
      toast.error('Помилка пошуку продуктів з харчовою цінністю');
      throw error;
    }
  }

  async getFoodDetails(foodId: string): Promise<any> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.getFoodDetails(foodId);
    } catch (error) {
      console.error('Error getting food details:', error);
      toast.error('Помилка отримання деталей продукту');
      throw error;
    }
  }

  // Recipe search methods
  async searchRecipes(query: string, options?: any): Promise<{ recipes: Recipe[]; totalResults: number; pageNumber: number; maxResults: number }> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      const result = await fatSecretApiService.searchRecipes(query, options);
      
      if (result.recipes.length === 0 && this.isCyrillic(query)) {
        // Try English translation for Cyrillic queries
        const englishQuery = this.translateToEnglish(query);
        if (englishQuery !== query) {
          const englishResult = await fatSecretApiService.searchRecipes(englishQuery, options);
          return {
            ...englishResult,
            recipes: englishResult.recipes.map(recipe => ({
              ...recipe,
              title: `${recipe.title} (${query})` // Show original query
            }))
          };
        }
      }

      return result;
    } catch (error) {
      console.error('Error searching recipes:', error);
      toast.error('Помилка пошуку рецептів');
      throw error;
    }
  }

  async getRandomRecipes(number: number = 20): Promise<Recipe[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.getRandomRecipes(number);
    } catch (error) {
      console.error('Error getting random recipes:', error);
      toast.error('Помилка отримання випадкових рецептів');
      throw error;
    }
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.getRecipesByIngredients(ingredients);
    } catch (error) {
      console.error('Error getting recipes by ingredients:', error);
      toast.error('Помилка пошуку рецептів за інгредієнтами');
      throw error;
    }
  }

  async searchFoodProducts(query: string): Promise<FoodProduct[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.searchFoodProducts(query, 20);
    } catch (error) {
      console.error('Error searching food products:', error);
      toast.error('Помилка пошуку продуктів');
      throw error;
    }
  }

  // Premier Features
  async autocompleteSearch(query: string, maxResults: number = 10): Promise<any[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.autocompleteSearch(query, maxResults);
    } catch (error) {
      console.error('Error in autocomplete search:', error);
      throw error;
    }
  }

  async scanBarcode(barcode: string): Promise<Food | null> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.scanBarcode(barcode);
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('Помилка сканування штрих-коду');
      throw error;
    }
  }

  async recognizeFoodFromImage(imageData: string): Promise<Food[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.recognizeFoodFromImage(imageData);
    } catch (error) {
      console.error('Error recognizing food from image:', error);
      toast.error('Помилка розпізнавання їжі з зображення');
      throw error;
    }
  }

  async processNaturalLanguageQuery(query: string): Promise<any> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.processNaturalLanguageQuery(query);
    } catch (error) {
      console.error('Error processing natural language query:', error);
      throw error;
    }
  }

  async getAllFoodBrands(): Promise<any[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.getAllFoodBrands();
    } catch (error) {
      console.error('Error getting food brands:', error);
      throw error;
    }
  }

  async getAllFoodCategories(): Promise<any[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.getAllFoodCategories();
    } catch (error) {
      console.error('Error getting food categories:', error);
      throw error;
    }
  }

  async getAllFoodSubCategories(): Promise<any[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.getAllFoodSubCategories();
    } catch (error) {
      console.error('Error getting food sub categories:', error);
      throw error;
    }
  }

  async getAllRecipeTypes(): Promise<any[]> {
    if (!navigator.onLine) {
      throw new Error('Немає з\'єднання з інтернетом');
    }

    try {
      return await fatSecretApiService.getAllRecipeTypes();
    } catch (error) {
      console.error('Error getting recipe types:', error);
      throw error;
    }
  }

  // Utility methods
  private isCyrillic(text: string): boolean {
    return /[а-яёіїєґ]/i.test(text);
  }

  private translateToEnglish(query: string): string {
    const translations: Record<string, string> = {
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
    
    return translations[query.toLowerCase()] || query;
  }

  // Management methods
  public clearCache(): void {
    fatSecretApiService.clearCache();
    console.log('Cache cleared');
  }

  public getCacheSize(): number {
    return fatSecretApiService.getCacheSize();
  }

  public isReady(): boolean {
    return fatSecretApiService.isReady();
  }

  public isPremier(): boolean {
    return fatSecretApiService.isPremier();
  }

  public getLocalization() {
    return fatSecretApiService.getLocalization();
  }

  public setRegion(region: string, language?: string): void {
    fatSecretApiService.setRegion(region, language);
  }

  public getSupportedRegions() {
    return fatSecretApiService.getSupportedRegions();
  }

  public getSupportedLanguages() {
    return fatSecretApiService.getSupportedLanguages();
  }

  // Custom Products Management
  // Convert custom product to Food interface
  private convertCustomProductToFood(customProduct: CustomProduct): Food {
    return {
      food_id: customProduct.id,
      food_name: customProduct.name,
      calories: customProduct.calories,
      protein: customProduct.protein,
      fat: customProduct.fat,
      carbs: customProduct.carbs
    };
  }

  // Search custom products
  searchCustomProducts(query: string, maxResults: number = 20): Food[] {
    const customProducts = customProductsService.searchProducts(query);
    return customProducts
      .slice(0, maxResults)
      .map(product => this.convertCustomProductToFood(product));
  }

  // Get all custom products
  getAllCustomProducts(): Food[] {
    const customProducts = customProductsService.getAllProducts();
    return customProducts.map(product => this.convertCustomProductToFood(product));
  }

  // Get custom product by ID
  getCustomProduct(id: string): Food | null {
    const product = customProductsService.getProduct(id);
    return product ? this.convertCustomProductToFood(product) : null;
  }

  // Add custom product
  addCustomProduct(productData: any): CustomProduct {
    return customProductsService.addProduct(productData);
  }

  // Update custom product
  updateCustomProduct(id: string, productData: any): CustomProduct | null {
    return customProductsService.updateProduct(id, productData);
  }

  // Delete custom product
  deleteCustomProduct(id: string): boolean {
    return customProductsService.deleteProduct(id);
  }

  // Get custom product categories
  getCustomProductCategories(): string[] {
    return customProductsService.getCategories();
  }

  // Get custom product brands
  getCustomProductBrands(): string[] {
    return customProductsService.getBrands();
  }

  // Get custom products statistics
  getCustomProductsStats() {
    return customProductsService.getStats();
  }

  // Enhanced search that includes custom products
  async searchFoodsWithCustom(query: string, pageNumber: number = 0, maxResults: number = 20): Promise<Food[]> {
    try {
      // Search FatSecret products
      const fatSecretFoods = await this.searchFoods(query, pageNumber, maxResults);
      
      // Search custom products
      const customFoods = this.searchCustomProducts(query, Math.max(5, Math.floor(maxResults / 4)));
      
      // Combine results, prioritizing custom products
      const combinedResults = [...customFoods, ...fatSecretFoods];
      
      // Remove duplicates based on name similarity
      const uniqueResults = combinedResults.filter((food, index, array) => {
        return array.findIndex(f => 
          f.food_name.toLowerCase() === food.food_name.toLowerCase()
        ) === index;
      });
      
      return uniqueResults.slice(0, maxResults);
    } catch (error) {
      console.error('Error searching foods with custom:', error);
      // Fallback to custom products only
      return this.searchCustomProducts(query, maxResults);
    }
  }
}

export const apiService = new EnhancedApiService();