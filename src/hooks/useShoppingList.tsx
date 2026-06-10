import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useSmartFridge } from './useSmartFridge';
import { useMealPlanner } from './useMealPlanner';
import { useAuth } from './useAuth';

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  isAutoAdded: boolean;
  source: 'manual' | 'meal_plan' | 'recipe' | 'fridge' | 'suggestion';
  addedDate: string;
  completedDate?: string;
  estimatedPrice?: number;
  notes?: string;
}

export interface ShoppingCategory {
  id: string;
  name: string;
  order: number;
  color: string;
  icon: string;
}

export interface ShoppingStats {
  totalItems: number;
  completedItems: number;
  totalEstimatedCost: number;
  categoryBreakdown: Record<string, number>;
  weeklySpending: number[];
  topItems: Array<{ name: string; frequency: number; lastBought: string }>;
}

const STORAGE_KEY = 'omomo_shopping_list';
const CATEGORIES_KEY = 'omomo_shopping_categories';
const STATS_KEY = 'omomo_shopping_stats';

const defaultCategories: ShoppingCategory[] = [
  { id: 'vegetables', name: 'Овочі та фрукти', order: 1, color: 'bg-green-100 text-green-800', icon: 'Apple' },
  { id: 'dairy', name: 'Молочні продукти', order: 2, color: 'bg-blue-100 text-blue-800', icon: 'Milk' },
  { id: 'meat', name: 'М\'ясо та риба', order: 3, color: 'bg-red-100 text-red-800', icon: 'Carrot' },
  { id: 'bakery', name: 'Хліб та випічка', order: 4, color: 'bg-yellow-100 text-yellow-800', icon: 'Bread' },
  { id: 'pantry', name: 'Бакалея', order: 5, color: 'bg-orange-100 text-orange-800', icon: 'Package' },
  { id: 'frozen', name: 'Заморожені продукти', order: 6, color: 'bg-cyan-100 text-cyan-800', icon: 'Snowflake' },
  { id: 'beverages', name: 'Напої', order: 7, color: 'bg-purple-100 text-purple-800', icon: 'Coffee' },
  { id: 'snacks', name: 'Снеки та солодощі', order: 8, color: 'bg-pink-100 text-pink-800', icon: 'Cookie' },
  { id: 'household', name: 'Побутові товари', order: 9, color: 'bg-gray-100 text-gray-800', icon: 'Home' },
  { id: 'other', name: 'Інше', order: 10, color: 'bg-slate-100 text-slate-800', icon: 'MoreHorizontal' }
];

const ShoppingListContext = createContext<ReturnType<typeof useShoppingListInternal> | undefined>(undefined);

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const value = useShoppingListInternal();
  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (context === undefined) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
}

function useShoppingListInternal() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [categories, setCategories] = useState<ShoppingCategory[]>(defaultCategories);
  const [stats, setStats] = useState<ShoppingStats>({
    totalItems: 0,
    completedItems: 0,
    totalEstimatedCost: 0,
    categoryBreakdown: {},
    weeklySpending: [],
    topItems: []
  });
  const [isStoreMode, setIsStoreMode] = useState(false);

  const { products } = useSmartFridge();
  const { weeklyPlan } = useMealPlanner();
  const { isAuthenticated } = useAuth();

  // Загрузка данных из API
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const token = localStorage.getItem('omomo_auth_token');
    if (!token) return;

    fetch(`${API_BASE}/api/shopping`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.items) {
        setItems(data.items.map((i: any) => ({
          id: i._id,
          name: i.name,
          category: i.category || 'other',
          quantity: i.amount || 1,
          unit: i.unit || 'шт',
          priority: 'medium',
          isCompleted: i.isBought,
          isAutoAdded: false,
          source: 'manual',
          addedDate: i.createdAt,
          completedDate: i.boughtAt
        })));
      }
    })
    .catch(console.error);
    
    // Load local only categories and stats (could be moved to user settings later)
    try {
      const savedCategories = localStorage.getItem(CATEGORIES_KEY);
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      const savedStats = localStorage.getItem(STATS_KEY);
      if (savedStats) setStats(JSON.parse(savedStats));
    } catch {}
  }, [isAuthenticated]);

  // Сохранение локальных данных (кэш/настройки)
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving shopping list settings:', error);
    }
  }, [categories, stats]);

  // Обновление статистики
  useEffect(() => {
    const newStats: ShoppingStats = {
      totalItems: items.length,
      completedItems: items.filter(item => item.isCompleted).length,
      totalEstimatedCost: items
        .filter(item => !item.isCompleted)
        .reduce((sum, item) => sum + (item.estimatedPrice || 0), 0),
      categoryBreakdown: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      weeklySpending: calculateWeeklySpending(),
      topItems: calculateTopItems()
    };
    setStats(newStats);
  }, [items]);

  const calculateWeeklySpending = (): number[] => {
    // Простая реализация - можно улучшить с реальными данными
    return [150, 200, 180, 220, 190, 160, 170];
  };

  const calculateTopItems = () => {
    // Анализ истории покупок для определения топ товаров
    const itemFrequency: Record<string, { count: number; lastBought: string }> = {};
    
    items.forEach(item => {
      if (item.isCompleted) {
        const key = item.name.toLowerCase();
        if (!itemFrequency[key]) {
          itemFrequency[key] = { count: 0, lastBought: item.completedDate || '' };
        }
        itemFrequency[key].count++;
        if (item.completedDate && item.completedDate > itemFrequency[key].lastBought) {
          itemFrequency[key].lastBought = item.completedDate;
        }
      }
    });

    return Object.entries(itemFrequency)
      .map(([name, data]) => ({ name, frequency: data.count, lastBought: data.lastBought }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  };

  // Добавление товара вручную
  const addItem = useCallback((item: Omit<ShoppingItem, 'id' | 'addedDate' | 'isCompleted'>) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          amount: item.quantity,
          unit: item.unit,
          isBought: false
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.item) {
          setItems(prev => [{
            ...item,
            id: data.item._id,
            addedDate: data.item.createdAt,
            isCompleted: false
          }, ...prev]);
        }
      })
      .catch(console.error);
    } else {
      const newItem: ShoppingItem = {
        ...item,
        id: crypto.randomUUID(),
        addedDate: new Date().toISOString(),
        isCompleted: false
      };
      setItems(prev => [newItem, ...prev]);
    }
  }, []);

  // Автоматическое добавление из плана питания
  const addFromMealPlan = useCallback(() => {
    if (!weeklyPlan) return;

    const newItems: ShoppingItem[] = [];
    const existingItems = items.map(item => item.name.toLowerCase());

    // Проходим по всем дням недели
    Object.values(weeklyPlan).forEach(dailyPlan => {
      Object.values(dailyPlan.meals).forEach(meal => {
        if (meal.recipe?.extendedIngredients) {
          meal.recipe.extendedIngredients.forEach(ingredient => {
            const ingredientName = ingredient.name.toLowerCase();
            
            // Проверяем, есть ли ингредиент в холодильнике
            const isInFridge = products.some(product => 
              product.name.toLowerCase().includes(ingredientName) ||
              ingredientName.includes(product.name.toLowerCase())
            );

            // Проверяем, не добавлен ли уже в список
            const isAlreadyAdded = existingItems.includes(ingredientName);

            if (!isInFridge && !isAlreadyAdded) {
              newItems.push({
                id: crypto.randomUUID(),
                name: ingredient.name,
                quantity: ingredient.amount || 1,
                unit: ingredient.unit || 'шт',
                category: getCategoryForIngredient(ingredient.name),
                priority: 'medium',
                isCompleted: false,
                isAutoAdded: true,
                source: 'meal_plan',
                addedDate: new Date().toISOString(),
                estimatedPrice: Math.round(Math.random() * 50 + 10)
              });
            }
          });
        }
      });
    });

    if (newItems.length > 0) {
      setItems(prev => [...newItems, ...prev]);
      return newItems.length;
    }
    return 0;
  }, [weeklyPlan, products, items]);

  // Автоматическое добавление из рецепта
  const addFromRecipe = useCallback((recipe: any) => {
    if (!recipe.extendedIngredients) return;

    const newItems: ShoppingItem[] = [];
    const existingItems = items.map(item => item.name.toLowerCase());

    recipe.extendedIngredients.forEach((ingredient: any) => {
      const ingredientName = ingredient.name.toLowerCase();
      
      const isInFridge = products.some(product => 
        product.name.toLowerCase().includes(ingredientName) ||
        ingredientName.includes(product.name.toLowerCase())
      );

      const isAlreadyAdded = existingItems.includes(ingredientName);

      if (!isInFridge && !isAlreadyAdded) {
        newItems.push({
          id: crypto.randomUUID(),
          name: ingredient.name,
          quantity: ingredient.amount || 1,
          unit: ingredient.unit || 'шт',
          category: getCategoryForIngredient(ingredient.name),
          priority: 'medium',
          isCompleted: false,
          isAutoAdded: true,
          source: 'recipe',
          addedDate: new Date().toISOString(),
          estimatedPrice: Math.round(Math.random() * 50 + 10)
        });
      }
    });

    if (newItems.length > 0) {
      setItems(prev => [...newItems, ...prev]);
      return newItems.length;
    }
    return 0;
  }, [products, items]);

  // Добавление из холодильника (когда продукт закончился)
  const addFromFridge = useCallback((productName: string) => {
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: productName,
      quantity: 1,
      unit: 'шт',
      category: getCategoryForIngredient(productName),
      priority: 'high',
      isCompleted: false,
      isAutoAdded: true,
      source: 'fridge',
      addedDate: new Date().toISOString(),
      estimatedPrice: Math.round(Math.random() * 50 + 10)
    };
    setItems(prev => [newItem, ...prev]);
  }, []);

  // Переключение статуса товара
  const toggleItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/shopping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isBought: !item.isCompleted, boughtAt: !item.isCompleted ? new Date().toISOString() : null })
      }).catch(console.error);
    }

    setItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            isCompleted: !item.isCompleted,
            completedDate: !item.isCompleted ? new Date().toISOString() : undefined
          }
        : item
    ));
  }, [items]);

  // Удаление товара
  const removeItem = useCallback((id: string) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      fetch(`${API_BASE}/api/shopping/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(console.error);
    }
    
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Обновление товара
  const updateItem = useCallback((id: string, updates: Partial<ShoppingItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  // Получение товаров, сгруппированных по категориям
  const getItemsByCategory = useCallback(() => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    
    return sortedCategories.map(category => ({
      category,
      items: items
        .filter(item => item.category === category.id)
        .sort((a, b) => {
          // Сначала незавершенные, потом завершенные
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
          }
          // Затем по приоритету
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
    })).filter(group => group.items.length > 0);
  }, [items, categories]);

  // Получение предложений на основе истории
  const getSuggestions = useCallback(() => {
    return stats.topItems.filter(topItem => 
      !items.some(item => 
        item.name.toLowerCase().includes(topItem.name.toLowerCase()) && !item.isCompleted
      )
    ).slice(0, 5);
  }, [stats.topItems, items]);

  // Экспорт списка для поделиться
  const exportList = useCallback(() => {
    const groupedItems = getItemsByCategory();
    let text = '🛒 Список покупок\n\n';
    
    groupedItems.forEach(group => {
      text += `📦 ${group.category.name}\n`;
      group.items
        .filter(item => !item.isCompleted)
        .forEach(item => {
          text += `• ${item.name} - ${item.quantity} ${item.unit}\n`;
        });
      text += '\n';
    });
    
    return text;
  }, [getItemsByCategory]);

  return {
    items,
    categories,
    stats,
    isStoreMode,
    setIsStoreMode,
    addItem,
    addFromMealPlan,
    addFromRecipe,
    addFromFridge,
    toggleItem,
    removeItem,
    updateItem,
    getItemsByCategory,
    getSuggestions,
    exportList
  };
}

// Вспомогательная функция для определения категории ингредиента
function getCategoryForIngredient(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('молоко') || name.includes('сир') || name.includes('йогурт') || 
      name.includes('масло') || name.includes('сметана') || name.includes('творог')) {
    return 'dairy';
  }
  
  if (name.includes('м\'ясо') || name.includes('курятина') || name.includes('свинина') || 
      name.includes('яловичина') || name.includes('риба') || name.includes('лосось')) {
    return 'meat';
  }
  
  if (name.includes('овочі') || name.includes('фрукти') || name.includes('морква') || 
      name.includes('цибуля') || name.includes('картопля') || name.includes('помідор')) {
    return 'vegetables';
  }
  
  if (name.includes('хліб') || name.includes('булка') || name.includes('батон')) {
    return 'bakery';
  }
  
  if (name.includes('рис') || name.includes('гречка') || name.includes('макарони') || 
      name.includes('крупа') || name.includes('борошно')) {
    return 'pantry';
  }
  
  if (name.includes('напій') || name.includes('сік') || name.includes('вода') || 
      name.includes('кава') || name.includes('чай')) {
    return 'beverages';
  }
  
  return 'other';
}
