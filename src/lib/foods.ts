// Legacy food interface for compatibility
export type Food = {
  id: string;
  name: string;
  proteinPer100: number;
  fatsPer100: number;
  carbsPer100: number;
};

// Empty local foods array - all data now comes from FatSecret API
export const FOODS: Food[] = [];

// Helper function to calculate macros for grams
export function calculateMacrosForGrams(food: Food, grams: number): {
  protein: number;
  fats: number;
  carbs: number;
  calories: number;
} {
  const multiplier = grams / 100;
  return {
    protein: food.proteinPer100 * multiplier,
    fats: food.fatsPer100 * multiplier,
    carbs: food.carbsPer100 * multiplier,
    calories: (food.proteinPer100 * 4 + food.fatsPer100 * 9 + food.carbsPer100 * 4) * multiplier
  };
}

// Helper function to calculate macros for FatSecret food data
export function calculateMacrosForFatSecretFood(food: any, grams: number): {
  protein: number;
  fats: number;
  carbs: number;
  calories: number;
} {
  const multiplier = grams / 100;
  return {
    protein: (food.protein || 0) * multiplier,
    fats: (food.fat || 0) * multiplier,
    carbs: (food.carbohydrate || 0) * multiplier,
    calories: (food.calories || 0) * multiplier
  };
}