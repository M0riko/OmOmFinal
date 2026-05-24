// Custom Products Service for user-created products
export interface CustomProduct {
  id: string;
  name: string;
  description?: string;
  calories: number; // per 100g
  protein: number; // per 100g
  fat: number; // per 100g
  carbs: number; // per 100g
  fiber?: number; // per 100g
  sugar?: number; // per 100g
  sodium?: number; // per 100g
  category?: string;
  brand?: string;
  createdAt: string;
  updatedAt: string;
  isUserCreated: true; // Flag to identify custom products
}

export interface CustomProductFormData {
  name: string;
  description?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category?: string;
  brand?: string;
}

class CustomProductsService {
  private readonly STORAGE_KEY = 'omomo_custom_products';
  private products: CustomProduct[] = [];

  constructor() {
    this.loadProducts();
  }

  // Load products from localStorage
  private loadProducts(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.products = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading custom products:', error);
      this.products = [];
    }
  }

  // Save products to localStorage
  private saveProducts(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
    } catch (error) {
      console.error('Error saving custom products:', error);
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add new custom product
  addProduct(productData: CustomProductFormData): CustomProduct {
    const now = new Date().toISOString();
    const product: CustomProduct = {
      id: this.generateId(),
      name: productData.name.trim(),
      description: productData.description?.trim(),
      calories: Math.max(0, productData.calories),
      protein: Math.max(0, productData.protein),
      fat: Math.max(0, productData.fat),
      carbs: Math.max(0, productData.carbs),
      fiber: productData.fiber ? Math.max(0, productData.fiber) : undefined,
      sugar: productData.sugar ? Math.max(0, productData.sugar) : undefined,
      sodium: productData.sodium ? Math.max(0, productData.sodium) : undefined,
      category: productData.category?.trim(),
      brand: productData.brand?.trim(),
      createdAt: now,
      updatedAt: now,
      isUserCreated: true
    };

    this.products.push(product);
    this.saveProducts();
    return product;
  }

  // Update existing custom product
  updateProduct(id: string, productData: Partial<CustomProductFormData>): CustomProduct | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const product = this.products[index];
    const updatedProduct: CustomProduct = {
      ...product,
      name: productData.name?.trim() || product.name,
      description: productData.description?.trim() || product.description,
      calories: productData.calories !== undefined ? Math.max(0, productData.calories) : product.calories,
      protein: productData.protein !== undefined ? Math.max(0, productData.protein) : product.protein,
      fat: productData.fat !== undefined ? Math.max(0, productData.fat) : product.fat,
      carbs: productData.carbs !== undefined ? Math.max(0, productData.carbs) : product.carbs,
      fiber: productData.fiber !== undefined ? Math.max(0, productData.fiber) : product.fiber,
      sugar: productData.sugar !== undefined ? Math.max(0, productData.sugar) : product.sugar,
      sodium: productData.sodium !== undefined ? Math.max(0, productData.sodium) : product.sodium,
      category: productData.category?.trim() || product.category,
      brand: productData.brand?.trim() || product.brand,
      updatedAt: new Date().toISOString()
    };

    this.products[index] = updatedProduct;
    this.saveProducts();
    return updatedProduct;
  }

  // Delete custom product
  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    this.saveProducts();
    return true;
  }

  // Get all custom products
  getAllProducts(): CustomProduct[] {
    return [...this.products];
  }

  // Get product by ID
  getProduct(id: string): CustomProduct | null {
    return this.products.find(p => p.id === id) || null;
  }

  // Search custom products
  searchProducts(query: string): CustomProduct[] {
    if (!query.trim()) return this.products;

    const searchTerm = query.toLowerCase().trim();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm)
    );
  }

  // Get products by category
  getProductsByCategory(category: string): CustomProduct[] {
    return this.products.filter(p => p.category?.toLowerCase() === category.toLowerCase());
  }

  // Get all categories
  getCategories(): string[] {
    const categories = new Set<string>();
    this.products.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories).sort();
  }

  // Get all brands
  getBrands(): string[] {
    const brands = new Set<string>();
    this.products.forEach(product => {
      if (product.brand) {
        brands.add(product.brand);
      }
    });
    return Array.from(brands).sort();
  }

  // Calculate nutrition for specific amount
  calculateNutrition(product: CustomProduct, grams: number): {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  } {
    const multiplier = grams / 100;
    return {
      calories: Math.round(product.calories * multiplier),
      protein: Math.round(product.protein * multiplier * 10) / 10,
      fat: Math.round(product.fat * multiplier * 10) / 10,
      carbs: Math.round(product.carbs * multiplier * 10) / 10,
      fiber: product.fiber ? Math.round(product.fiber * multiplier * 10) / 10 : undefined,
      sugar: product.sugar ? Math.round(product.sugar * multiplier * 10) / 10 : undefined,
      sodium: product.sodium ? Math.round(product.sodium * multiplier * 10) / 10 : undefined
    };
  }

  // Validate product data
  validateProductData(data: CustomProductFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name.trim()) {
      errors.push('Назва продукту обов\'язкова');
    }

    if (data.calories < 0) {
      errors.push('Калорії не можуть бути від\'ємними');
    }

    if (data.protein < 0) {
      errors.push('Білки не можуть бути від\'ємними');
    }

    if (data.fat < 0) {
      errors.push('Жири не можуть бути від\'ємними');
    }

    if (data.carbs < 0) {
      errors.push('Вуглеводи не можуть бути від\'ємними');
    }

    if (data.fiber !== undefined && data.fiber < 0) {
      errors.push('Клітковина не може бути від\'ємною');
    }

    if (data.sugar !== undefined && data.sugar < 0) {
      errors.push('Цукор не може бути від\'ємним');
    }

    if (data.sodium !== undefined && data.sodium < 0) {
      errors.push('Натрій не може бути від\'ємним');
    }

    // Check for reasonable values
    if (data.calories > 1000) {
      errors.push('Калорії на 100г не можуть перевищувати 1000');
    }

    if (data.protein > 100) {
      errors.push('Білки на 100г не можуть перевищувати 100г');
    }

    if (data.fat > 100) {
      errors.push('Жири на 100г не можуть перевищувати 100г');
    }

    if (data.carbs > 100) {
      errors.push('Вуглеводи на 100г не можуть перевищувати 100г');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get statistics
  getStats(): {
    totalProducts: number;
    totalCategories: number;
    totalBrands: number;
    averageCalories: number;
    averageProtein: number;
    averageFat: number;
    averageCarbs: number;
  } {
    const totalProducts = this.products.length;
    const totalCategories = this.getCategories().length;
    const totalBrands = this.getBrands().length;

    if (totalProducts === 0) {
      return {
        totalProducts: 0,
        totalCategories: 0,
        totalBrands: 0,
        averageCalories: 0,
        averageProtein: 0,
        averageFat: 0,
        averageCarbs: 0
      };
    }

    const totalCalories = this.products.reduce((sum, p) => sum + p.calories, 0);
    const totalProtein = this.products.reduce((sum, p) => sum + p.protein, 0);
    const totalFat = this.products.reduce((sum, p) => sum + p.fat, 0);
    const totalCarbs = this.products.reduce((sum, p) => sum + p.carbs, 0);

    return {
      totalProducts,
      totalCategories,
      totalBrands,
      averageCalories: Math.round(totalCalories / totalProducts),
      averageProtein: Math.round(totalProtein / totalProducts * 10) / 10,
      averageFat: Math.round(totalFat / totalProducts * 10) / 10,
      averageCarbs: Math.round(totalCarbs / totalProducts * 10) / 10
    };
  }

  // Clear all products (for testing/reset)
  clearAllProducts(): void {
    this.products = [];
    this.saveProducts();
  }

  // Export products to JSON
  exportProducts(): string {
    return JSON.stringify(this.products, null, 2);
  }

  // Import products from JSON
  importProducts(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const importedProducts = JSON.parse(jsonData);
      
      if (!Array.isArray(importedProducts)) {
        return { success: false, imported: 0, errors: ['Невірний формат даних'] };
      }

      const errors: string[] = [];
      let imported = 0;

      importedProducts.forEach((product, index) => {
        const validation = this.validateProductData(product);
        if (validation.isValid) {
          this.products.push({
            ...product,
            id: this.generateId(), // Generate new ID to avoid conflicts
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isUserCreated: true
          });
          imported++;
        } else {
          errors.push(`Продукт ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (imported > 0) {
        this.saveProducts();
      }

      return { success: true, imported, errors };
    } catch (error) {
      return { success: false, imported: 0, errors: ['Помилка парсингу JSON'] };
    }
  }
}

// Export singleton instance
export const customProductsService = new CustomProductsService();
export default customProductsService;
