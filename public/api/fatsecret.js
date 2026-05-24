// Local fallback API endpoint for development
// This file serves as a fallback when the proxy server is not running

// Simple fallback data for development
const fallbackData = {
  'foods.search': {
    foods: {
      food: [
        {
          food_id: '1',
          food_name: 'Chicken Breast',
          food_description: 'Per 100g - Calories: 165kcal | Protein: 31g | Fat: 3.6g | Carbs: 0g',
          brand_name: 'Generic'
        },
        {
          food_id: '2', 
          food_name: 'Tomato',
          food_description: 'Per 100g - Calories: 18kcal | Protein: 0.9g | Fat: 0.2g | Carbs: 3.9g',
          brand_name: 'Generic'
        }
      ]
    }
  },
  'recipes.search': {
    recipes: {
      recipe: [
        {
          recipe_id: '1',
          recipe_name: 'Chicken with Tomatoes',
          recipe_url: 'https://example.com/recipe1',
          recipe_image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
          recipe_nutrition: {
            calories: '250',
            protein: '30g',
            fat: '8g',
            carbs: '12g'
          }
        }
      ]
    }
  }
};

// Handle requests
if (typeof window !== 'undefined') {
  // Browser environment - this won't work, but shows the structure
  console.log('Fallback API endpoint loaded');
} else {
  // Node.js environment - could be used for testing
  console.log('Fallback API endpoint ready');
}
