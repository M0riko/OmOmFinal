// Smart Fridge System - Enhanced data structures and utilities

export interface SmartFridgeProduct {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: ProductCategory;
  quantity: {
    amount: number;
    unit: UnitType;
  };
  expiryDate?: string;
  addedDate: string;
  lastUsedDate?: string;
  isInPantry: boolean; // Virtual pantry for always-available items
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
  };
  imageUrl?: string;
  notes?: string;
}

export type ProductCategory = 
  | "М'ясо та риба"
  | "Молочні продукти"
  | "Овочі та фрукти"
  | "Крупи та макарони"
  | "Консерви"
  | "Заморожені продукти"
  | "Напої"
  | "Солодощі"
  | "Спеції та приправи"
  | "Хліб та випічка"
  | "Інше";

export type UnitType = 
  | "г" | "кг" | "мл" | "л" | "шт" | "пачка" | "банка" | "пляшка" | "пучок" | "голівка";

export interface ShoppingListItem {
  id: string;
  name: string;
  category: ProductCategory;
  quantity?: {
    amount: number;
    unit: UnitType;
  };
  isCompleted: boolean;
  addedDate: string;
  source: "manual" | "fridge_expired" | "recipe_missing" | "low_stock";
  priority: "low" | "medium" | "high";
  notes?: string;
}

export interface RecipeMatch {
  recipe: any; // Recipe from API
  matchScore: number;
  availableIngredients: string[];
  missingIngredients: string[];
  canCook: boolean; // 100% ingredients available
  needsShopping: boolean; // Missing 1-3 ingredients
}

export interface FridgeAnalytics {
  totalProducts: number;
  expiredProducts: number;
  expiringSoon: number; // Within 3 days
  pantryItems: number;
  categories: Record<ProductCategory, number>;
  nutritionBalance: {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
  };
  wasteStats: {
    used: number;
    wasted: number;
    wastePercentage: number;
  };
  topProducts: Array<{
    name: string;
    frequency: number;
    category: ProductCategory;
  }>;
}

// Utility functions
export function getExpiryStatus(expiryDate?: string): {
  status: "fresh" | "expiring" | "expired";
  daysLeft: number;
  color: "success" | "warning" | "destructive";
  text: string;
} {
  if (!expiryDate) {
    return {
      status: "fresh",
      daysLeft: Infinity,
      color: "success",
      text: "Без терміну"
    };
  }

  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: "expired",
      daysLeft: Math.abs(daysLeft),
      color: "destructive",
      text: `Прострочено ${Math.abs(daysLeft)} дн. тому`
    };
  }

  if (daysLeft <= 2) {
    return {
      status: "expiring",
      daysLeft,
      color: "warning",
      text: `Залишилось ${daysLeft} дн.`
    };
  }

  return {
    status: "fresh",
    daysLeft,
    color: "success",
    text: `Залишилось ${daysLeft} дн.`
  };
}

export function calculateRecipeMatch(
  recipe: any,
  availableProducts: SmartFridgeProduct[]
): RecipeMatch {
  // Normalize product names - remove extra spaces, convert to lowercase
  const availableNames = availableProducts.map(p => 
    p.name.toLowerCase().trim().replace(/\s+/g, ' ')
  );
  
  const recipeIngredients = recipe.extendedIngredients || [];
  
  const availableIngredients: string[] = [];
  const missingIngredients: string[] = [];
  
  recipeIngredients.forEach((ingredient: any) => {
    const ingredientName = ingredient.name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Try to find a match
    let isAvailable = false;
    
    for (const available of availableNames) {
      // Exact match
      if (ingredientName === available || available === ingredientName) {
        isAvailable = true;
        break;
      }
      
      // One contains the other
      if (ingredientName.includes(available) || available.includes(ingredientName)) {
        // But avoid false matches with very short words
        if (available.length >= 3 && ingredientName.length >= 3) {
          isAvailable = true;
          break;
        }
      }
      
      // Match by words (for cases like "молоко коров'яче" vs "молоко")
      const ingredientWords = ingredientName.split(/\s+/).filter(w => w.length > 2);
      const availableWords = available.split(/\s+/).filter(w => w.length > 2);
      
      if (ingredientWords.length > 0 && availableWords.length > 0) {
        // Check if any significant word matches
        const hasCommonWord = ingredientWords.some(iw => 
          availableWords.some(aw => iw.includes(aw) || aw.includes(iw))
        );
        
        if (hasCommonWord) {
          isAvailable = true;
          break;
        }
      }
    }
    
    if (isAvailable) {
      availableIngredients.push(ingredient.name);
    } else {
      missingIngredients.push(ingredient.name);
    }
  });
  
  const matchScore = recipeIngredients.length > 0 
    ? Math.round((availableIngredients.length / recipeIngredients.length) * 100)
    : 0;
  const canCook = missingIngredients.length === 0;
  const needsShopping = missingIngredients.length <= 3 && missingIngredients.length > 0;
  
  return {
    recipe,
    matchScore,
    availableIngredients,
    missingIngredients,
    canCook,
    needsShopping
  };
}

export function generateFridgeAnalytics(products: SmartFridgeProduct[]): FridgeAnalytics {
  const expiredProducts = products.filter(p => {
    const status = getExpiryStatus(p.expiryDate);
    return status.status === "expired";
  }).length;
  
  const expiringSoon = products.filter(p => {
    const status = getExpiryStatus(p.expiryDate);
    return status.status === "expiring";
  }).length;
  
  const pantryItems = products.filter(p => p.isInPantry).length;
  
  const categories = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<ProductCategory, number>);
  
  const nutritionBalance = products.reduce((acc, product) => {
    if (product.nutrition) {
      acc.totalCalories += product.nutrition.calories;
      acc.totalProtein += product.nutrition.protein;
      acc.totalFat += product.nutrition.fat;
      acc.totalCarbs += product.nutrition.carbs;
    }
    return acc;
  }, {
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0
  });
  
  // Calculate top products (simplified - would need usage tracking)
  const productFrequency = products.reduce((acc, product) => {
    acc[product.name] = (acc[product.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topProducts = Object.entries(productFrequency)
    .map(([name, frequency]) => ({
      name,
      frequency,
      category: products.find(p => p.name === name)?.category || "Інше"
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
  
  return {
    totalProducts: products.length,
    expiredProducts,
    expiringSoon,
    pantryItems,
    categories,
    nutritionBalance,
    wasteStats: {
      used: 0, // Would need usage tracking
      wasted: expiredProducts,
      wastePercentage: products.length > 0 ? Math.round((expiredProducts / products.length) * 100) : 0
    },
    topProducts
  };
}

// Storage keys
export const STORAGE_KEYS = {
  FRIDGE_PRODUCTS: "omomo_smart_fridge_products",
  SHOPPING_LIST: "omomo_shopping_list",
  PANTRY_ITEMS: "omomo_pantry_items",
  FRIDGE_ANALYTICS: "omomo_fridge_analytics"
} as const;

// Default pantry items (always available)
export const DEFAULT_PANTRY_ITEMS: Partial<SmartFridgeProduct>[] = [
  { name: "Сіль", category: "Спеції та приправи", isInPantry: true },
  { name: "Цукор", category: "Спеції та приправи", isInPantry: true },
  { name: "Олія соняшникова", category: "Спеції та приправи", isInPantry: true },
  { name: "Олія оливкова", category: "Спеції та приправи", isInPantry: true },
  { name: "Перець чорний", category: "Спеції та приправи", isInPantry: true },
  { name: "Лавровий лист", category: "Спеції та приправи", isInPantry: true },
  { name: "Часник", category: "Спеції та приправи", isInPantry: true },
  { name: "Цибуля", category: "Овочі та фрукти", isInPantry: true },
  { name: "Морква", category: "Овочі та фрукти", isInPantry: true },
  { name: "Картопля", category: "Овочі та фрукти", isInPantry: true },
  { name: "Рис", category: "Крупи та макарони", isInPantry: true },
  { name: "Гречка", category: "Крупи та макарони", isInPantry: true },
  { name: "Макарони", category: "Крупи та макарони", isInPantry: true },
  { name: "Борошно", category: "Крупи та макарони", isInPantry: true },
  { name: "Яйця", category: "Молочні продукти", isInPantry: true }
];
