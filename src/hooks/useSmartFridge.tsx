import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  SmartFridgeProduct, 
  ShoppingListItem, 
  RecipeMatch, 
  FridgeAnalytics,
  getExpiryStatus,
  calculateRecipeMatch,
  generateFridgeAnalytics,
  STORAGE_KEYS,
  DEFAULT_PANTRY_ITEMS,
  ProductCategory,
  UnitType
} from "@/lib/smart-fridge";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

export function useSmartFridge() {
  const [products, setProducts] = useState<SmartFridgeProduct[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load data from API on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchFridgeData = async () => {
      const token = localStorage.getItem('omomo_auth_token');
      if (!token) return;

      try {
        const [fridgeRes, shoppingRes] = await Promise.all([
          fetch(`${API_BASE}/api/fridge`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/shopping`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const fridgeData = await fridgeRes.json();
        const shoppingData = await shoppingRes.json();

        if (fridgeData.products) {
          setProducts(fridgeData.products.map((p: any) => ({
            id: p._id,
            name: p.name,
            category: p.category,
            quantity: { amount: p.quantity, unit: p.unit },
            expiryDate: p.expiryDate,
            addedDate: p.addedAt,
            isInPantry: false,
            barcode: p.barcode,
            imageUrl: p.imageUrl,
            nutrition: { calories: 0, protein: 0, fat: 0, carbs: 0 } // Default for now
          })));
        }

        if (shoppingData.items) {
          setShoppingList(shoppingData.items.map((i: any) => ({
            id: i._id,
            name: i.name,
            category: i.category,
            quantity: { amount: i.amount || 1, unit: i.unit || 'шт' },
            isCompleted: i.isBought,
            addedDate: i.createdAt
          })));
        }
      } catch (error) {
        console.error("Error loading fridge data from API:", error);
      }
    };

    fetchFridgeData();
  }, [isAuthenticated]);

  // Save data to localStorage is disabled - saving happens directly to API in action functions

  // Search products in database
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await apiService.searchFoodsWithNutrition(query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Помилка пошуку продуктів");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Add product to fridge
  const addProduct = useCallback((productData: Partial<SmartFridgeProduct>) => {
    const newProduct: SmartFridgeProduct = {
      id: crypto.randomUUID(),
      name: productData.name || "",
      brand: productData.brand,
      barcode: productData.barcode,
      category: productData.category || "Інше",
      quantity: productData.quantity || { amount: 1, unit: "шт" },
      expiryDate: productData.expiryDate,
      addedDate: new Date().toISOString(),
      isInPantry: productData.isInPantry || false,
      nutrition: productData.nutrition || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      },
      imageUrl: productData.imageUrl,
      notes: productData.notes
    };

    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/fridge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newProduct.name,
          category: newProduct.category,
          quantity: newProduct.quantity.amount,
          unit: newProduct.quantity.unit,
          expiryDate: newProduct.expiryDate,
          barcode: newProduct.barcode,
          imageUrl: newProduct.imageUrl
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProducts(prev => [{...newProduct, id: data.product._id}, ...prev]);
        }
      })
      .catch(console.error);
    } else {
      setProducts(prev => [newProduct, ...prev]);
    }
    
    toast.success("Продукт додано до холодильника!");
    return newProduct;
  }, []);

  // Add product from search results
  const addProductFromSearch = useCallback((searchResult: any, quantity: { amount: number; unit: UnitType }, expiryDate?: string) => {
    const productData: Partial<SmartFridgeProduct> = {
      name: searchResult.food_name,
      category: determineCategory(searchResult.food_name),
      quantity,
      expiryDate,
      nutrition: {
        calories: searchResult.calories || 0,
        protein: searchResult.protein || 0,
        fat: searchResult.fat || 0,
        carbs: searchResult.carbohydrate || 0
      }
    };

    return addProduct(productData);
  }, [addProduct]);

  const removeProduct = useCallback((productId: string, addToShoppingListFlag?: boolean) => {
    const product = products.find(p => p.id === productId);
    
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/fridge/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(console.error);
    }
    
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    if (product && addToShoppingListFlag) {
      addToShoppingList(product, "low_stock");
    } else {
      toast.success("Продукт видалено з холодильника");
    }
  }, [products]);

  // Update product
  const updateProduct = useCallback((productId: string, updates: Partial<SmartFridgeProduct>) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/fridge/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      }).catch(console.error);
    }
    
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, ...updates } : p
    ));
    toast.success("Продукт оновлено");
  }, []);

  // Mark product as used
  const markProductAsUsed = useCallback((productId: string) => {
    updateProduct(productId, { lastUsedDate: new Date().toISOString() });
  }, [updateProduct]);

  // Add to shopping list
  const addToShoppingList = useCallback((product: SmartFridgeProduct, source: ShoppingListItem["source"] = "manual") => {
    const existingItem = shoppingList.find(item => 
      item.name.toLowerCase() === product.name.toLowerCase()
    );

    if (existingItem) {
      toast.info("Продукт вже є в списку покупок");
      return;
    }

    const newItem: ShoppingListItem = {
      id: crypto.randomUUID(),
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      isCompleted: false,
      addedDate: new Date().toISOString(),
      source,
      priority: source === "fridge_expired" ? "high" : "medium"
    };

    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          amount: newItem.quantity.amount,
          unit: newItem.quantity.unit,
          isBought: false
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.item) {
          setShoppingList(prev => [{...newItem, id: data.item._id}, ...prev]);
        }
      })
      .catch(console.error);
    } else {
      setShoppingList(prev => [newItem, ...prev]);
    }

    toast.success("Додано до списку покупок");
  }, [shoppingList]);

  // Remove from shopping list
  const removeFromShoppingList = useCallback((itemId: string) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/shopping/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(console.error);
    }
    
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
    toast.success("Видалено зі списку покупок");
  }, []);

  // Toggle shopping list item completion
  const toggleShoppingListItem = useCallback((itemId: string) => {
    const item = shoppingList.find(i => i.id === itemId);
    if (!item) return;
    
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/shopping/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isBought: !item.isCompleted })
      }).catch(console.error);
    }
    
    setShoppingList(prev => prev.map(item => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  }, [shoppingList]);

  // Get recipe matches
  const getRecipeMatches = useCallback(async (): Promise<RecipeMatch[]> => {
    // Filter only fridge products (exclude pantry items)
    const fridgeProductsList = products.filter(p => !p.isInPantry);
    
    if (fridgeProductsList.length === 0) return [];

    setLoading(true);
    try {
      const ingredientNames = fridgeProductsList.map(p => p.name.trim());
      
      if (ingredientNames.length === 0) return [];

      const allRecipes: any[] = [];
      
      // Search for recipes with available ingredients (use up to 5 ingredients for better variety)
      const searchIngredients = ingredientNames.slice(0, 5);
      for (const ingredient of searchIngredients) {
        try {
          const result = await apiService.searchRecipes(ingredient, { number: 8 });
          allRecipes.push(...result.recipes);
        } catch (error) {
          console.error(`Error searching recipes for ${ingredient}:`, error);
        }
      }

      // Remove duplicates and calculate matches
      const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
        index === self.findIndex(r => r.id === recipe.id)
      );

      // Use only fridge products for matching calculation
      const matches = uniqueRecipes
        .map(recipe => calculateRecipeMatch(recipe, fridgeProductsList))
        .filter(match => match.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 15); // Increase limit for more options

      return matches;
    } catch (error) {
      console.error("Error getting recipe matches:", error);
      toast.error("Помилка завантаження рецептів");
      return [];
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Computed values
  const analytics = useMemo(() => generateFridgeAnalytics(products), [products]);

  const expiredProducts = useMemo(() => 
    products.filter(p => getExpiryStatus(p.expiryDate).status === "expired"),
    [products]
  );

  const expiringProducts = useMemo(() => 
    products.filter(p => getExpiryStatus(p.expiryDate).status === "expiring"),
    [products]
  );

  const fridgeProducts = useMemo(() => 
    products.filter(p => !p.isInPantry),
    [products]
  );

  const pantryProducts = useMemo(() => 
    products.filter(p => p.isInPantry),
    [products]
  );

  const completedShoppingItems = useMemo(() => 
    shoppingList.filter(item => item.isCompleted),
    [shoppingList]
  );

  const pendingShoppingItems = useMemo(() => 
    shoppingList.filter(item => !item.isCompleted),
    [shoppingList]
  );

  return {
    // Data
    products,
    fridgeProducts,
    pantryProducts,
    shoppingList,
    searchResults,
    analytics,
    expiredProducts,
    expiringProducts,
    completedShoppingItems,
    pendingShoppingItems,
    
    // Loading states
    loading,
    searchLoading,
    
    // Actions
    searchProducts,
    addProduct,
    addProductFromSearch,
    removeProduct,
    updateProduct,
    markProductAsUsed,
    addToShoppingList,
    removeFromShoppingList,
    toggleShoppingListItem,
    getRecipeMatches
  };
}

// Helper function to determine category from product name
function determineCategory(productName: string): ProductCategory {
  const name = productName.toLowerCase();
  
  if (name.includes("м'ясо") || name.includes("риба") || name.includes("курятина") || name.includes("свинина") || name.includes("яловичина")) {
    return "М'ясо та риба";
  }
  if (name.includes("молоко") || name.includes("сир") || name.includes("йогурт") || name.includes("творог") || name.includes("масло")) {
    return "Молочні продукти";
  }
  if (name.includes("овоч") || name.includes("фрукт") || name.includes("яблуко") || name.includes("банан") || name.includes("помидор")) {
    return "Овочі та фрукти";
  }
  if (name.includes("крупа") || name.includes("рис") || name.includes("гречка") || name.includes("макарон") || name.includes("борошно")) {
    return "Крупи та макарони";
  }
  if (name.includes("консерв") || name.includes("банка")) {
    return "Консерви";
  }
  if (name.includes("заморожен") || name.includes("морозилк")) {
    return "Заморожені продукти";
  }
  if (name.includes("напій") || name.includes("сік") || name.includes("вода") || name.includes("чай") || name.includes("кава")) {
    return "Напої";
  }
  if (name.includes("солод") || name.includes("цукерк") || name.includes("торт") || name.includes("печиво")) {
    return "Солодощі";
  }
  if (name.includes("спеці") || name.includes("приправ") || name.includes("сіль") || name.includes("перець")) {
    return "Спеції та приправи";
  }
  if (name.includes("хліб") || name.includes("булочк") || name.includes("випічк")) {
    return "Хліб та випічка";
  }
  
  return "Інше";
}
