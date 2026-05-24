import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { Card } from "@/components/ui/card";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { Search, Plus, AlertTriangle, Clock, Utensils, ShoppingCart, Calendar, Barcode, Camera, Star } from "lucide-react";
import { apiService, Recipe } from "@/lib/api";
import { toast } from "sonner";
import { RecipeDetails } from "@/components/RecipeDetails";

export default function Fridge() {
  type Item = { 
    id: string; 
    name: string; 
    qty: string; 
    expires?: string; 
    category?: string;
    addedDate: string;
    nutrition?: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    };
  };
  
  const KEY = "omomo_fridge";
  const [items, setItems] = useState<Item[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeDetailsOpen, setRecipeDetailsOpen] = useState(false);
  const { earn, has } = useAchievements();
  
  // Form states
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [expires, setExpires] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Product search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const categories = [
    "М'ясо та риба",
    "Молочні продукти", 
    "Овочі та фрукти",
    "Крупи та макарони",
    "Консерви",
    "Заморожені продукти",
    "Напої",
    "Солодощі",
    "Інше"
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  useEffect(() => {
    if (items.length > 0) {
      loadRecipeSuggestions();
    }
  }, [items]);

  const loadRecipeSuggestions = async () => {
    setLoading(true);
    try {
      const ingredientNames = items.map(item => item.name);
      
      if (ingredientNames.length === 0) {
        setSuggestedRecipes([]);
        return;
      }
      
      // Get recipes for multiple ingredients to find better matches
      const searchTerms = ingredientNames.slice(0, 3); // Use up to 3 main ingredients
      const allRecipes: Recipe[] = [];
      
      // Search for recipes with each ingredient
      for (const term of searchTerms) {
        try {
          // Try both original term and simplified version
          const searchTermsToTry = [term];
          
          // If term contains parentheses, try without them
          if (term.includes('(') && term.includes(')')) {
            const simplified = term.split('(')[0].trim();
            if (simplified && simplified !== term) {
              searchTermsToTry.push(simplified);
            }
          }
          
          // Try each search term
          for (const searchTerm of searchTermsToTry) {
            try {
              const result = await apiService.searchRecipes(searchTerm, { number: 6 });
              allRecipes.push(...result.recipes);
            } catch (error) {
              console.error(`Error searching for ${searchTerm}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error processing term ${term}:`, error);
        }
      }
      
      // Remove duplicates and calculate match scores
      const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
        index === self.findIndex(r => r.id === recipe.id)
      );
      
      const scoredRecipes = uniqueRecipes.map(recipe => {
        const recipeTitle = recipe.title.toLowerCase();
        const recipeSummary = (recipe.summary || '').toLowerCase();
        const recipeText = `${recipeTitle} ${recipeSummary}`;
        
        let matchScore = 0;
        let matchedIngredients: string[] = [];
        
        ingredientNames.forEach(ingredient => {
          const ingredientLower = ingredient.toLowerCase();
          
          // Exact match
          if (recipeText.includes(ingredientLower)) {
            matchScore += 2;
            matchedIngredients.push(ingredient);
          } else {
            // Partial match - check individual words
            const words = ingredientLower.split(' ').filter(word => word.length > 2);
            words.forEach(word => {
              if (recipeText.includes(word)) {
                matchScore += 0.5;
                if (!matchedIngredients.includes(ingredient)) {
                  matchedIngredients.push(ingredient);
                }
              }
            });
          }
        });
        
        // Bonus for recipes that use multiple ingredients from fridge
        const ingredientRatio = matchedIngredients.length / ingredientNames.length;
        matchScore += ingredientRatio * 2;
        
        return { 
          ...recipe, 
          matchScore, 
          matchedIngredients,
          ingredientRatio: Math.round(ingredientRatio * 100)
        };
      });
      
      // Sort by match score and take top recipes
      const sortedRecipes = scoredRecipes
        .filter(recipe => recipe.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 9);
      
      if (sortedRecipes.length === 0) {
        toast.info("Рецепти не знайдено. Спробуйте додати більше продуктів або перевірте інтернет-з'єднання.");
      } else {
        setSuggestedRecipes(sortedRecipes);
        toast.success(`Знайдено ${sortedRecipes.length} рецептів з ваших продуктів!`);
      }
    } catch (error) {
      console.error("Error loading recipe suggestions:", error);
      toast.error("Помилка завантаження рецептів. Перевірте інтернет-з'єднання.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          searchProducts(query);
        }, 500); // 500ms delay
      };
    })(),
    []
  );

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    setSearchLoading(true);
    try {
      const products = await apiService.searchFoodsWithNutrition(query, 10);
      setSearchResults(products);
      setShowSearchResults(true);
      
      if (products.length === 0) {
        toast.info("Продукти не знайдені. Використовуються локальні дані.");
      }
    } catch (error: any) {
      console.error("Error searching products:", error);
      toast.error("Помилка пошуку. Використовуються локальні дані.");
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const addItemFromSearch = (product: any) => {
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: product.food_name,
      qty: qty || "1 шт",
      expires,
      category,
      addedDate: new Date().toISOString(),
      nutrition: {
        calories: product.calories || 0,
        protein: product.protein || 0,
        fat: product.fat || 0,
        carbs: product.carbohydrate || 0
      }
    };

    setItems((prev) => [newItem, ...prev]);
    if (!has("first_fridge_item")) earn("first_fridge_item");
    setName(""); setQty(""); setExpires(""); setCategory("");
    setSearchQuery(""); setSearchResults([]); setShowSearchResults(false);
    toast.success("Продукт додано до холодильника!");
  };

  const addItem = async () => {
    if (!name) return;
    
    // Try to get nutrition info from API
    let nutrition;
    try {
      const products = await apiService.searchFoodProducts(name);
      if (products.length > 0) {
        nutrition = products[0].nutrition;
      }
    } catch (error) {
      console.error("Error fetching nutrition:", error);
    }

    const newItem: Item = {
      id: crypto.randomUUID(),
      name,
      qty,
      expires,
      category,
      addedDate: new Date().toISOString(),
      nutrition
    };

    setItems((prev) => [newItem, ...prev]);
    if (!has("first_fridge_item")) earn("first_fridge_item");
    setName(""); setQty(""); setExpires(""); setCategory("");
    toast.success("Продукт додано до холодильника!");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Продукт видалено!");
  };

  const openRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDetailsOpen(true);
  };


  const getExpiryStatus = (expires?: string) => {
    if (!expires) return null;
    const expiryDate = new Date(expires);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: "expired", text: "Прострочено", color: "destructive" };
    if (diffDays <= 2) return { status: "expiring", text: "Скоро прострочиться", color: "warning" };
    return { status: "fresh", text: "Свіжий", color: "success" };
  };

  const filtered = useMemo(() => {
    let filteredItems = items;
    
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filteredItems = filteredItems.filter((i) => 
        i.name.toLowerCase().includes(q) || 
        (i.category || "").toLowerCase().includes(q)
      );
    }
    
            if (selectedCategory && selectedCategory !== "all") {
              filteredItems = filteredItems.filter((i) => i.category === selectedCategory);
            }
    
    return filteredItems;
  }, [items, query, selectedCategory]);

  const expiredItems = items.filter(item => {
    const status = getExpiryStatus(item.expires);
    return status?.status === "expired";
  });

  const expiringItems = items.filter(item => {
    const status = getExpiryStatus(item.expires);
    return status?.status === "expiring";
  });

  const totalNutrition = useMemo(() => {
    return items.reduce((total, item) => {
      if (item.nutrition) {
        total.calories += item.nutrition.calories;
        total.protein += item.nutrition.protein;
        total.fat += item.nutrition.fat;
        total.carbs += item.nutrition.carbs;
      }
      return total;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [items]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-3 pb-24 md:pb-8 md:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Холодильник</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Знайдіть рецепти з ваших продуктів</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {expiredItems.length > 0 && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  {expiredItems.length} прострочено
                </Badge>
              )}
              {expiringItems.length > 0 && (
                <Badge variant="warning" className="gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {expiringItems.length} скоро прострочиться
                </Badge>
              )}
            </div>
          </div>

          <Tabs defaultValue="recipes" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="recipes" className="text-xs md:text-sm py-2 md:py-3">
                <span className="hidden sm:inline">Рецепти з продуктів</span>
                <span className="sm:hidden">Рецепти</span>
              </TabsTrigger>
              <TabsTrigger value="items" className="text-xs md:text-sm py-2 md:py-3">
                <span className="hidden sm:inline">Мій холодильник</span>
                <span className="sm:hidden">Холодильник</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs md:text-sm py-2 md:py-3">
                <span className="hidden sm:inline">Статистика</span>
                <span className="sm:hidden">Стат.</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="space-y-4">
              <Card className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Рецепти з ваших продуктів</h3>
                    {items.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {items.length} продуктів
                      </Badge>
                    )}
                  </div>
                  {items.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadRecipeSuggestions}
                      disabled={loading}
                      className="gap-2"
                    >
                      <Search className="w-4 h-4" />
                      {loading ? "Пошук..." : "Оновити рецепти"}
                    </Button>
                  )}
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Завантаження рецептів...</p>
                  </div>
                ) : suggestedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedRecipes.map((recipe: any) => (
                      <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openRecipeDetails(recipe)}>
                        <div className="aspect-video bg-muted relative">
                          <img 
                            src={recipe.image} 
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400";
                            }}
                          />
                          {/* Match Score Badge */}
                          {recipe.ingredientRatio && (
                            <div className="absolute top-2 right-2">
                              <Badge 
                                variant={recipe.ingredientRatio >= 50 ? "default" : recipe.ingredientRatio >= 25 ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {recipe.ingredientRatio}% співпадіння
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-2 line-clamp-2">{recipe.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {recipe.readyInMinutes} хв
                            </div>
                            <div className="flex items-center gap-1">
                              <Utensils className="w-4 h-4" />
                              {recipe.servings} порцій
                            </div>
                          </div>
                          {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground mb-1">Є в холодильнику:</p>
                              <div className="flex flex-wrap gap-1">
                                {recipe.matchedIngredients.slice(0, 3).map((ingredient: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {ingredient}
                                  </Badge>
                                ))}
                                {recipe.matchedIngredients.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{recipe.matchedIngredients.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="w-full">
                            Переглянути рецепт
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Utensils className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Додайте продукти до холодильника, щоб отримати пропозиції рецептів</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const itemsTab = document.querySelector('[value="items"]') as HTMLElement;
                        if (itemsTab) itemsTab.click();
                      }}
                    >
                      Додати продукти
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <Card className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4">Додати продукт</h3>
                <div className="space-y-4">
                  {/* Product Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Пошук продукту в базі даних</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          placeholder="Введіть назву продукту для пошуку..." 
                          value={searchQuery} 
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            debouncedSearch(e.target.value);
                          }}
                          onKeyPress={(e) => e.key === 'Enter' && searchProducts(searchQuery)}
                          className="pr-10"
                        />
                        {searchLoading && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => searchProducts(searchQuery)}
                        disabled={!searchQuery.trim() || searchLoading}
                        className="gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Пошук
                      </Button>
                    </div>
                    
                    {/* Search Results */}
                    {showSearchResults && (
                      <Card className="max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {searchResults.length > 0 ? (
                            <>
                              <h4 className="text-sm font-medium mb-2">Знайдені продукти:</h4>
                              <div className="space-y-1">
                                {searchResults.map((product, index) => (
                                  <div 
                                    key={index}
                                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                    onClick={() => addItemFromSearch(product)}
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{product.food_name}</div>
                                      {product.calories > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                          {Math.round(product.calories)} ккал • 
                                          Б: {Math.round(product.protein)}г • 
                                          Ж: {Math.round(product.fat)}г • 
                                          В: {Math.round(product.carbs)}г
                                        </div>
                                      )}
                                    </div>
                                    <Button size="sm" variant="outline">
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">
                                Продукти не знайдені. Спробуйте іншу назву або додайте вручну.
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>

                  <div className="text-center text-sm text-muted-foreground">або</div>

                  {/* Manual Entry */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Додати вручну</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <Input 
                        placeholder="Назва продукту" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem()}
                      />
                      <Input 
                        placeholder="Кількість (6 шт, 1 л, 500 г)" 
                        value={qty} 
                        onChange={(e) => setQty(e.target.value)} 
                      />
                      <Input 
                        type="date"
                        placeholder="Термін придатності" 
                        value={expires} 
                        onChange={(e) => setExpires(e.target.value)} 
                      />
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Категорія" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addItem} disabled={!name} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Додати продукт
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <Input 
                      placeholder="Пошук продуктів..." 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)}
                      className="gap-2"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Всі категорії" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі категорії</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {filtered.length === 0 && (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">Нічого не знайдено</p>
                    </Card>
                  )}
                  {filtered.map((item) => {
                    const expiryStatus = getExpiryStatus(item.expires);
                    return (
                      <Card key={item.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {item.qty && (
                                <Badge variant="outline" className="text-xs">
                                  {item.qty}
                                </Badge>
                              )}
                              {expiryStatus && (
                                <Badge variant={expiryStatus.color as any} className="text-xs">
                                  {expiryStatus.text}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.category && <span>{item.category}</span>}
                              {item.expires && (
                                <span className="ml-2">
                                  Термін: {new Date(item.expires).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {item.nutrition && (
                              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                <span>{item.nutrition.calories} ккал</span>
                                <span>Б: {item.nutrition.protein}г</span>
                                <span>Ж: {item.nutrition.fat}г</span>
                                <span>В: {item.nutrition.carbs}г</span>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeItem(item.id)}
                          >
                            Видалити
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>


            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Всього продуктів</h4>
                  </div>
                  <p className="text-2xl font-bold">{items.length}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h4 className="font-semibold">Прострочено</h4>
                  </div>
                  <p className="text-2xl font-bold text-destructive">{expiredItems.length}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <h4 className="font-semibold">Скоро прострочиться</h4>
                  </div>
                  <p className="text-2xl font-bold text-warning">{expiringItems.length}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-success" />
                    <h4 className="font-semibold">Категорій</h4>
                  </div>
                  <p className="text-2xl font-bold text-success">
                    {new Set(items.map(item => item.category).filter(Boolean)).size}
                  </p>
                </Card>
              </div>

              {totalNutrition.calories > 0 && (
                <Card className="p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4">Загальна поживна цінність</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{Math.round(totalNutrition.calories)}</p>
                      <p className="text-sm text-muted-foreground">Ккал</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">{Math.round(totalNutrition.protein)}г</p>
                      <p className="text-sm text-muted-foreground">Білки</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-500">{Math.round(totalNutrition.fat)}г</p>
                      <p className="text-sm text-muted-foreground">Жири</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">{Math.round(totalNutrition.carbs)}г</p>
                      <p className="text-sm text-muted-foreground">Вуглеводи</p>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

          </Tabs>
        </main>
        <MobileBottomNav />
      </div>
      
      {/* Recipe Details Modal */}
      <RecipeDetails
        recipe={selectedRecipe}
        open={recipeDetailsOpen}
        onOpenChange={setRecipeDetailsOpen}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
    </div>
  );
}

function FridgeSuggestions({ available }: { available: string[] }) {
  const KEY = "omomo_recipes";
  const [recipes, setRecipes] = useState<{ id: string; title: string; ingredients: string }[]>([]);
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setRecipes(JSON.parse(raw)); } catch {} }, []);

  const matches = useMemo(() => {
    if (recipes.length === 0 || available.length === 0) return [] as { id: string; title: string; score: number }[];
    return recipes
      .map((r) => {
        const ingredients = r.ingredients.toLowerCase().split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
        const hit = ingredients.filter((ing) => available.some((a) => ing.includes(a) || a.includes(ing))).length;
        const score = ingredients.length ? Math.round((hit / ingredients.length) * 100) : 0;
        return { id: r.id, title: r.title, score };
      })
      .filter((m) => m.score >= 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [recipes, available]);

  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground">Додайте рецепти на вкладці «Рецепти», щоб отримати підказки тут.</p>;
  }

  return (
    <div className="space-y-2">
      {matches.map((m) => (
        <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">{m.title}</div>
            <div className="text-xs text-muted-foreground">Співпадіння з холодильником: {m.score}%</div>
          </div>
        </div>
      ))}
    </div>
  );
}


