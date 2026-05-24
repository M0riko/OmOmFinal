import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDaily } from "@/hooks/useDaily";
import { useAchievements } from "@/hooks/useAchievements";
import { calculateMacrosForFatSecretFood } from "@/lib/foods";
import { apiService } from "@/lib/api";
import { customProductsService, CustomProduct } from "@/lib/custom-products";
import { CustomProductModal } from "./CustomProductModal";
import { Clock, Utensils, Search, Plus, Sun, Moon, Apple, Coffee, Loader2, Flame, Zap, Target, TrendingUp, Package, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

type AddItemModalProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  presetType?: "meal" | "product";
  presetMealType?: "breakfast" | "lunch" | "dinner" | "snack";
};

export function AddItemModal({ open, onOpenChange, presetType, presetMealType }: AddItemModalProps) {
  const { addEntry } = useDaily();
  const { earn, has } = useAchievements();
  const [type, setType] = useState<"meal" | "product">(presetType || "meal");
  const [name, setName] = useState("");
  // Removed time state - no longer needed
  const [grams, setGrams] = useState<number | "">(100);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(presetMealType || "breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [fatSecretFoods, setFatSecretFoods] = useState<any[]>([]);
  const [customFoods, setCustomFoods] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "quick" | "custom">("search");
  const [customProductModalOpen, setCustomProductModalOpen] = useState(false);
  const [editingCustomProduct, setEditingCustomProduct] = useState<CustomProduct | null>(null);

  const macros = useMemo(() => {
    if (!selectedFood) {
      // Default values for manual entry
      const g = typeof grams === "number" ? grams : Number(grams) || 0;
      return {
        calories: Math.round(g * 3), // ~300 kcal per 100g average
        protein: Math.round(g * 0.15), // ~15g protein per 100g average
        fats: Math.round(g * 0.1), // ~10g fat per 100g average
        carbs: Math.round(g * 0.45) // ~45g carbs per 100g average
      };
    }
    
    const g = typeof grams === "number" ? grams : Number(grams) || 0;
    return calculateMacrosForFatSecretFood(selectedFood, g);
  }, [selectedFood, grams]);

  // Minimal fallback translations for cases when Cyrillic doesn't work
  const basicTranslations: Record<string, string> = {
    'гречка': 'buckwheat',
    'куряче філе': 'chicken breast',
    'куриная грудка': 'chicken breast',
    'рис': 'rice',
    'яйце': 'egg',
    'яйцо': 'egg',
    'хліб': 'bread',
    'хлеб': 'bread',
    'молоко': 'milk',
    'сир': 'cheese',
    'сыр': 'cheese',
    'мясо': 'meat',
    'риба': 'fish',
    'рыба': 'fish',
    'картопля': 'potato',
    'картофель': 'potato',
    'макарони': 'pasta',
    'макароны': 'pasta',
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
    'олія': 'oil',
    'сахар': 'sugar',
    'соль': 'salt',
    'перец': 'pepper',
    'чеснок': 'garlic',
    'петрушка': 'parsley',
    'укроп': 'dill',
    'базилик': 'basil',
    'орехи': 'nuts',
    'миндаль': 'almonds',
    'мед': 'honey',
    'шоколад': 'chocolate',
    'печенье': 'cookies',
    'торт': 'cake',
    'мороженое': 'ice cream'
  };

  // Reverse translations for displaying results in Cyrillic
  const reverseTranslations: Record<string, string> = {
    'buckwheat': 'Гречка',
    'chicken breast': 'Куряче філе',
    'chicken': 'Курятина',
    'rice': 'Рис',
    'egg': 'Яйце',
    'eggs': 'Яйця',
    'bread': 'Хліб',
    'milk': 'Молоко',
    'cheese': 'Сир',
    'meat': 'М\'ясо',
    'fish': 'Риба',
    'potato': 'Картопля',
    'potatoes': 'Картопля',
    'pasta': 'Макарони',
    'tomato': 'Томат',
    'tomatoes': 'Томати',
    'cucumber': 'Огірок',
    'cucumbers': 'Огірки',
    'onion': 'Цибуля',
    'onions': 'Цибуля',
    'carrot': 'Морква',
    'carrots': 'Морква',
    'apple': 'Яблуко',
    'apples': 'Яблука',
    'banana': 'Банан',
    'bananas': 'Банани',
    'cottage cheese': 'Творог',
    'yogurt': 'Йогурт',
    'butter': 'Масло',
    'oil': 'Олія',
    'sugar': 'Цукор',
    'salt': 'Сіль',
    'pepper': 'Перець',
    'garlic': 'Часник',
    'parsley': 'Петрушка',
    'dill': 'Кріп',
    'basil': 'Базилік',
    'nuts': 'Горіхи',
    'almonds': 'Міндаль',
    'honey': 'Мед',
    'chocolate': 'Шоколад',
    'cookies': 'Печиво',
    'cake': 'Торт',
    'ice cream': 'Морозиво'
  };

  // Function to translate food names to Cyrillic if possible
  const translateToCyrillic = (foodName: string): string => {
    // Validate input
    if (!foodName || typeof foodName !== 'string') {
      return '';
    }

    const lowerName = foodName.toLowerCase();
    
    // Check for exact matches first
    if (reverseTranslations[lowerName]) {
      return reverseTranslations[lowerName];
    }
    
    // Check for partial matches
    for (const [english, cyrillic] of Object.entries(reverseTranslations)) {
      if (lowerName.includes(english)) {
        return foodName.replace(new RegExp(english, 'gi'), cyrillic);
      }
    }
    
    return foodName; // Return original if no translation found
  };

  // Search foods including custom products
  const searchFoods = async (query: string) => {
    // Validate input
    if (!query || typeof query !== 'string' || !query.trim()) {
      setFatSecretFoods([]);
      setCustomFoods([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for:', query, 'isCyrillic:', /[а-яёіїєґ]/i.test(query));
      
      // Search FatSecret foods
      let fatSecretResults = await apiService.searchFoodsWithNutrition(query, 10);
      console.log('FatSecret search results:', fatSecretResults.length);
      
      // If no results and query is in Cyrillic, try English translation
      if (fatSecretResults.length === 0 && /[а-яёіїєґ]/i.test(query)) {
        const englishQuery = basicTranslations[query.toLowerCase()];
        if (englishQuery) {
          console.log('Trying English translation:', englishQuery);
          fatSecretResults = await apiService.searchFoodsWithNutrition(englishQuery, 10);
          console.log('English search results:', fatSecretResults.length);
        }
      }
      
      // Search custom products
      const customResults = apiService.searchCustomProducts(query, 10);
      console.log('Custom products search results:', customResults.length);
      
      setFatSecretFoods(fatSecretResults);
      setCustomFoods(customResults);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error("Помилка при пошуку продуктів");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (presetType) setType(presetType);
    if (presetMealType) setMealType(presetMealType);
  }, [presetType, presetMealType]);

  function reset() {
    setName("");
    setGrams(100);
    setSearchQuery("");
    setSelectedFood(null);
    setFatSecretFoods([]);
    setCustomFoods([]);
    setIsSearching(false);
    setActiveTab("search");
    setCustomProductModalOpen(false);
    setEditingCustomProduct(null);
  }

  function submit() {
    if (!name.trim()) {
      toast.error("Введіть назву страви");
      return;
    }
    
    const g = typeof grams === "number" ? grams : Number(grams) || 0;
    if (g <= 0) {
      toast.error("Введіть правильну кількість грамів");
      return;
    }

    addEntry({ 
      type, 
      name: name.trim(), 
      time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }), // Auto-generate current time
      mealType, 
      foodId: selectedFood?.food_id || '', 
      grams: g, 
      calories: macros.calories, 
      protein: macros.protein, 
      fats: macros.fats, 
      carbs: macros.carbs 
    });
    
    if (!has("first_meal")) earn("first_meal");
    toast.success("Страву додано!");
    reset();
    onOpenChange(false);
  }

  const quickAddFood = (foodName: string) => {
    setName(foodName);
    setSearchQuery(foodName);
    searchFoods(foodName);
  };

  const handleCustomProductAdded = (product: CustomProduct) => {
    // Refresh custom products list
    const customResults = apiService.searchCustomProducts(searchQuery, 10);
    setCustomFoods(customResults);
    
    // Auto-select the new product
    const newFood = apiService.getCustomProduct(product.id);
    if (newFood) {
      setSelectedFood(newFood);
      setName(product.name);
    }
  };

  const handleEditCustomProduct = (product: CustomProduct) => {
    setEditingCustomProduct(product);
    setCustomProductModalOpen(true);
  };

  const handleDeleteCustomProduct = (productId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цей продукт?')) {
      apiService.deleteCustomProduct(productId);
      // Refresh custom products list
      const customResults = apiService.searchCustomProducts(searchQuery, 10);
      setCustomFoods(customResults);
      toast.success('Продукт видалено');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Utensils className="w-6 h-6 text-primary" />
            Додати страву
          </DialogTitle>
          <DialogDescription className="text-base">
            Додайте нову страву до свого денного раціону. Час буде встановлено автоматично.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Meal Type Selection */}
          <div className="space-y-4">
            <label className="text-base font-semibold text-foreground">Прийом їжі</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "breakfast", label: "Сніданок", icon: Coffee, color: "from-orange-400 to-orange-600", bgColor: "bg-orange-50", textColor: "text-orange-700" },
                { key: "lunch", label: "Обід", icon: Sun, color: "from-yellow-400 to-yellow-600", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
                { key: "dinner", label: "Вечеря", icon: Moon, color: "from-purple-400 to-purple-600", bgColor: "bg-purple-50", textColor: "text-purple-700" },
                { key: "snack", label: "Перекус", icon: Apple, color: "from-green-400 to-green-600", bgColor: "bg-green-50", textColor: "text-green-700" }
              ].map((meal) => {
                const IconComponent = meal.icon;
                const isSelected = mealType === meal.key;
                return (
                  <Button
                    key={meal.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => setMealType(meal.key as any)}
                    className={`
                      h-16 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                      transition-all duration-300 hover:scale-105 border-2
                      ${isSelected 
                        ? `bg-gradient-to-br ${meal.color} text-white shadow-lg border-transparent` 
                        : `${meal.bgColor} ${meal.textColor} hover:bg-gradient-to-br hover:${meal.color} hover:text-white border-gray-200 hover:border-transparent`
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm font-medium">{meal.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Time is now auto-generated, no need for user input */}

          {/* Tabs for Search, Quick Add, and Custom Products */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "search" | "quick" | "custom")}>
            <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 rounded-xl">
              <TabsTrigger 
                value="search" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
              >
                <Search className="w-4 h-4" />
                Пошук
              </TabsTrigger>
              <TabsTrigger 
                value="quick" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
              >
                <Zap className="w-4 h-4" />
                Швидко
              </TabsTrigger>
              <TabsTrigger 
                value="custom" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
              >
                <Package className="w-4 h-4" />
                Мої продукти
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4 mt-6">
              {/* Food Search */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-base font-semibold flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Пошук продукту (FatSecret API)
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Введіть назву продукту українською, російською або англійською мовою
                  </p>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Наприклад: риба, курятина, молоко, bread, cheese..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 h-12 text-base border-2 focus:border-primary/50"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                
                {searchQuery && (
                  <div className="max-h-64 overflow-y-auto border-2 border-muted/30 rounded-xl bg-muted/10">
                    {(fatSecretFoods.length > 0 || customFoods.length > 0) ? (
                      <div className="p-3 space-y-2">
                        {/* Custom Products Section */}
                        {customFoods.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2 py-1">
                              <Package className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Мої продукти</span>
                              <Badge variant="secondary" className="text-xs">
                                {customFoods.length}
                              </Badge>
                            </div>
                            {customFoods.map((food) => {
                              const customProduct = customProductsService.getProduct(food.food_id);
                              return (
                                <div key={food.food_id} className="relative group">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start h-auto p-4 hover:bg-background/80 rounded-lg border border-transparent hover:border-primary/20"
                                    onClick={() => {
                                      setSelectedFood(food);
                                      setName(food.food_name);
                                      setSearchQuery("");
                                    }}
                                  >
                                    <div className="text-left w-full">
                                      <div className="font-semibold text-base mb-1 flex items-center gap-2">
                                        {food.food_name}
                                        <Badge variant="outline" className="text-xs">
                                          Мої
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Flame className="w-3 h-3" />
                                          {food.calories || 0} ккал
                                        </span>
                                        <span>Б: {food.protein || 0}г</span>
                                        <span>Ж: {food.fat || 0}г</span>
                                        <span>В: {food.carbs || 0}г</span>
                                      </div>
                                    </div>
                                  </Button>
                                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (customProduct) handleEditCustomProduct(customProduct);
                                        }}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCustomProduct(food.food_id);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* FatSecret Products Section */}
                        {fatSecretFoods.length > 0 && (
                          <div className="space-y-2">
                            {customFoods.length > 0 && <div className="border-t border-muted/30 my-2" />}
                            <div className="flex items-center gap-2 px-2 py-1">
                              <Search className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-500">FatSecret API</span>
                              <Badge variant="secondary" className="text-xs">
                                {fatSecretFoods.length}
                              </Badge>
                            </div>
                            {fatSecretFoods.map((food) => {
                              const displayName = translateToCyrillic(food.food_name);
                              return (
                                <Button
                                  key={food.food_id}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start h-auto p-4 hover:bg-background/80 rounded-lg border border-transparent hover:border-primary/20"
                                  onClick={() => {
                                    setSelectedFood(food);
                                    setName(displayName);
                                    setSearchQuery("");
                                  }}
                                >
                                  <div className="text-left w-full">
                                    <div className="font-semibold text-base mb-1">{displayName}</div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Flame className="w-3 h-3" />
                                        {food.calories || 0} ккал
                                      </span>
                                      <span>Б: {food.protein || 0}г</span>
                                      <span>Ж: {food.fat || 0}г</span>
                                      <span>В: {food.carbohydrate || 0}г</span>
                                    </div>
                                    {displayName !== food.food_name && (
                                      <div className="text-xs text-muted-foreground italic mt-1">
                                        ({food.food_name})
                                      </div>
                                    )}
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : isSearching ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
                        <p className="font-medium">Пошук продуктів...</p>
                        <p className="text-sm mt-1">Використовуємо FatSecret API та ваші продукти</p>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <div className="space-y-3">
                          <p className="font-medium">Продукт не знайдено</p>
                          <p className="text-sm">Спробуйте пошукати іншою мовою або створіть власний продукт</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="quick" className="space-y-6 mt-6">
              {/* Quick Add Categories */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold">Рекомендовані продукти</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/20" onClick={() => quickAddFood('гречка')}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">Гречка</h3>
                          <p className="text-sm text-muted-foreground">Крупа</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/20" onClick={() => quickAddFood('куряче філе')}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">Куряче філе</h3>
                          <p className="text-sm text-muted-foreground">М'ясо</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/20" onClick={() => quickAddFood('рис')}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">Рис</h3>
                          <p className="text-sm text-muted-foreground">Крупа</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/20" onClick={() => quickAddFood('яйце')}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">Яйце</h3>
                          <p className="text-sm text-muted-foreground">Білок</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Popular Foods Grid */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Популярні продукти</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {['хліб', 'молоко', 'сир', 'томат', 'огірок', 'цибуля', 'морква', 'яблуко', 'банан', 'творог', 'йогурт', 'масло'].map((food) => (
                      <Button
                        key={food}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(food);
                          searchFoods(food);
                        }}
                        className="h-10 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {food}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6 mt-6">
              {/* Custom Products Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Мої продукти</h3>
                    <p className="text-sm text-muted-foreground">
                      Створюйте та керуйте власними продуктами з точними значеннями КБЖУ
                    </p>
                  </div>
                  <Button
                    onClick={() => setCustomProductModalOpen(true)}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Plus className="w-4 h-4" />
                    Додати продукт
                  </Button>
                </div>

                {/* Custom Products List */}
                <div className="space-y-3">
                  {(() => {
                    const allCustomProducts = customProductsService.getAllProducts();
                    if (allCustomProducts.length === 0) {
                      return (
                        <Card className="p-8 text-center border-dashed border-2 border-muted/30">
                          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="font-medium mb-2">Немає власних продуктів</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Створіть свій перший продукт з точними значеннями КБЖУ
                          </p>
                          <Button
                            onClick={() => setCustomProductModalOpen(true)}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Створити продукт
                          </Button>
                        </Card>
                      );
                    }

                    return allCustomProducts.map((product) => (
                      <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-base">{product.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {product.category || 'Без категорії'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {product.calories} ккал
                              </span>
                              <span>Б: {product.protein}г</span>
                              <span>Ж: {product.fat}г</span>
                              <span>В: {product.carbs}г</span>
                            </div>
                            {product.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedFood(apiService.getCustomProduct(product.id));
                                setName(product.name);
                                setActiveTab("search");
                              }}
                            >
                              Вибрати
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditCustomProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteCustomProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ));
                  })()}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Custom Name Input */}
          <div className="space-y-3">
            <label className="text-base font-semibold">Назва страви</label>
            <Input
              placeholder="Введіть назву страви або виберіть продукт вище"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 text-base border-2 focus:border-primary/50"
            />
          </div>

          {/* Quantity Input */}
          <div className="space-y-3">
            <label className="text-base font-semibold">Кількість (грами)</label>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="100"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value) || "")}
                className="flex-1 h-12 text-base border-2 focus:border-primary/50"
                min="1"
              />
              <div className="flex gap-2">
                {[50, 100, 150, 200].map((amount) => (
                  <Button
                    key={amount}
                    variant={grams === amount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGrams(amount)}
                    className="h-12 px-4 font-medium"
                  >
                    {amount}г
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Nutrition Info */}
          {(selectedFood || name.trim()) && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
              <h4 className="font-bold mb-5 text-foreground flex items-center gap-2 text-lg">
                <Flame className="w-6 h-6 text-primary" />
                Поживна цінність
                {selectedFood?.food_id && (
                  <Badge variant="default" className="text-xs bg-primary/20 text-primary-foreground">
                    FatSecret
                  </Badge>
                )}
                {!selectedFood && name.trim() && (
                  <Badge variant="outline" className="text-xs">
                    Орієнтовні значення
                  </Badge>
                )}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <div className="text-3xl font-bold text-primary mb-2">{Math.round(macros.calories)}</div>
                  <div className="text-sm text-primary/80 font-semibold">Ккал</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round(macros.protein)}г</div>
                  <div className="text-sm text-blue-600/80 font-semibold">Білки</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{Math.round(macros.fats)}г</div>
                  <div className="text-sm text-yellow-600/80 font-semibold">Жири</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30">
                  <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(macros.carbs)}г</div>
                  <div className="text-sm text-green-600/80 font-semibold">Вуглеводи</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center bg-background/50 rounded-lg p-3">
                {selectedFood?.food_id ? (
                  <>Точні дані з FatSecret API • {typeof grams === "number" ? grams : Number(grams) || 0}г</>
                ) : (
                  <>Орієнтовні значення • {typeof grams === "number" ? grams : Number(grams) || 0}г</>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 h-12 text-base font-medium border-2 hover:bg-muted/50"
            >
              Скасувати
            </Button>
            <Button 
              onClick={submit} 
              disabled={!name.trim() || (typeof grams === "number" ? grams <= 0 : Number(grams) <= 0)}
              className="flex-1 h-12 text-base font-medium gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Додати страву
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Custom Product Modal */}
      <CustomProductModal
        open={customProductModalOpen}
        onOpenChange={setCustomProductModalOpen}
        editingProduct={editingCustomProduct}
        onProductAdded={handleCustomProductAdded}
      />
    </Dialog>
  );
}