import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { FridgeHeaderBar } from "@/components/FridgeHeaderBar";
import { FridgeTabsNav } from "@/components/FridgeTabsNav";
import { FridgeStatCards } from "@/components/FridgeStatCards";
import { FridgeSearchFilters } from "@/components/FridgeSearchFilters";
import { FridgeProductGrid } from "@/components/FridgeProductGrid";
import { FridgeEmptyState } from "@/components/FridgeEmptyState";
import { FridgeRecommendations } from "@/components/FridgeRecommendations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Utensils, 
  ShoppingCart, 
  BarChart3,
  CheckCircle,
  Circle,
  Trash2,
  Package,
  AlertTriangle,
  Clock,
  TrendingUp
} from "lucide-react";
import { useSmartFridge } from "@/hooks/useSmartFridge";
import { ProductCategory, getExpiryStatus } from "@/lib/smart-fridge";
import { AddProductModal } from "@/components/AddProductModal";
import { RecipeDetails } from "@/components/RecipeDetails";
import { toast } from "sonner";

export default function SmartFridge() {
  const {
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
    loading,
    searchLoading,
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
  } = useSmartFridge();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [recipeDetailsOpen, setRecipeDetailsOpen] = useState(false);
  const [recipeMatches, setRecipeMatches] = useState<any[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [activeTab, setActiveTab] = useState<"fridge" | "recipes" | "shopping" | "analytics">("fridge");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showExpired, setShowExpired] = useState(false);
  const [showPantry, setShowPantry] = useState(false);

  const categories: ProductCategory[] = [
    "М'ясо та риба",
    "Молочні продукти", 
    "Овочі та фрукти",
    "Крупи та макарони",
    "Консерви",
    "Заморожені продукти",
    "Напої",
    "Солодощі",
    "Спеції та приправи",
    "Хліб та випічка",
    "Інше"
  ];

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = showPantry ? pantryProducts : fridgeProducts;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (showExpired) {
      filtered = filtered.filter(product => {
        const status = getExpiryStatus(product.expiryDate);
        return status.status === "expired" || status.status === "expiring";
      });
    }
    
    return filtered;
  }, [fridgeProducts, pantryProducts, searchQuery, selectedCategory, showExpired, showPantry]);

  // Load recipe matches
  const loadRecipeMatches = useCallback(async () => {
    setLoadingRecipes(true);
    try {
      const matches = await getRecipeMatches();
      setRecipeMatches(matches);
    } catch (error) {
      console.error("Error loading recipe matches:", error);
      toast.error("Помилка завантаження рецептів");
    } finally {
      setLoadingRecipes(false);
    }
  }, [getRecipeMatches]);

  // Auto-load recipes when tab changes to "recipes" or when products change
  useEffect(() => {
    if (activeTab === "recipes" && fridgeProducts.length > 0) {
      loadRecipeMatches();
    }
  }, [activeTab, fridgeProducts.length, loadRecipeMatches]);

  const openRecipeDetails = (recipe: any) => {
    setSelectedRecipe(recipe);
    setRecipeDetailsOpen(true);
  };

  const handleProductUsed = (productId: string) => {
    markProductAsUsed(productId);
    toast.success("Продукт відмічено як використаний");
  };

  const handleAddToShoppingList = (product: any) => {
    addToShoppingList(product, "low_stock");
  };

  const handleStatCardClick = (type: "total" | "expired" | "expiring" | "pantry") => {
    switch (type) {
      case "expired":
        setShowExpired(true);
        setActiveTab("fridge");
        break;
      case "expiring":
        setShowExpired(true);
        setActiveTab("fridge");
        break;
      case "pantry":
        setShowPantry(true);
        setActiveTab("fridge");
        break;
      default:
        setActiveTab("fridge");
    }
  };

  const handleViewExpired = () => {
    setShowExpired(true);
    setActiveTab("fridge");
  };

  const handleViewExpiring = () => {
    setShowExpired(true);
    setActiveTab("fridge");
  };

  const handleViewRecipes = () => {
    setActiveTab("recipes");
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "fridge":
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <FridgeStatCards
              totalProducts={fridgeProducts.length}
              expiredCount={expiredProducts.length}
              expiringCount={expiringProducts.length}
              pantryCount={pantryProducts.length}
              onCardClick={handleStatCardClick}
            />

            {/* Search & Filters */}
            <FridgeSearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              showExpired={showExpired}
              onToggleExpired={() => setShowExpired(!showExpired)}
              showPantry={showPantry}
              onTogglePantry={() => setShowPantry(!showPantry)}
              categories={categories}
            />

            {/* Product List */}
            {filteredProducts.length === 0 ? (
              <FridgeEmptyState
                isPantry={showPantry}
                onAddProduct={() => setShowAddModal(true)}
              />
            ) : (
              <FridgeProductGrid
                products={filteredProducts}
                onProductUsed={handleProductUsed}
                onAddToShoppingList={handleAddToShoppingList}
                onRemoveProduct={removeProduct}
              />
            )}

            {/* Smart Recommendations */}
            <FridgeRecommendations
              expiredProducts={expiredProducts}
              expiringProducts={expiringProducts}
              availableRecipes={recipeMatches}
              onViewExpired={handleViewExpired}
              onViewExpiring={handleViewExpiring}
              onViewRecipes={handleViewRecipes}
            />
          </div>
        );

      case "recipes":
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Рецепти з ваших продуктів</h3>
                  {fridgeProducts.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {fridgeProducts.length} продуктів
                    </Badge>
                  )}
                </div>
                {fridgeProducts.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadRecipeMatches}
                    disabled={loadingRecipes}
                    className="gap-2 border-2 hover:bg-muted/50"
                  >
                    {loadingRecipes ? "Пошук..." : "Оновити рецепти"}
                  </Button>
                )}
              </div>
              
              {loadingRecipes ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Завантаження рецептів...</p>
                </div>
              ) : recipeMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipeMatches.map((match: any) => (
                    <Card key={match.recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openRecipeDetails(match.recipe)}>
                      <div className="aspect-video bg-muted relative">
                        <img 
                          src={match.recipe.image} 
                          alt={match.recipe.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400";
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge 
                            variant={match.canCook ? "default" : match.needsShopping ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            {match.canCook ? "Можна готувати" : match.needsShopping ? "Потрібно докупити" : `${match.matchScore}% співпадіння`}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-2">{match.recipe.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {match.recipe.readyInMinutes} хв
                          </div>
                          <div className="flex items-center gap-1">
                            <Utensils className="w-4 h-4" />
                            {match.recipe.servings} порцій
                          </div>
                        </div>
                        {match.availableIngredients.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">Є в холодильнику:</p>
                            <div className="flex flex-wrap gap-1">
                              {match.availableIngredients.slice(0, 3).map((ingredient: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                              {match.availableIngredients.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{match.availableIngredients.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        {match.missingIngredients.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-muted-foreground mb-1">Потрібно докупити:</p>
                            <div className="flex flex-wrap gap-1">
                              {match.missingIngredients.slice(0, 2).map((ingredient: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                              {match.missingIngredients.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{match.missingIngredients.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        <Button size="sm" variant="outline" className="w-full border-2 hover:bg-muted/50">
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
                    onClick={() => setShowAddModal(true)}
                    className="border-2 hover:bg-muted/50"
                  >
                    Додати продукти
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );

      case "shopping":
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Список покупок</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {pendingShoppingItems.length} активних
                  </Badge>
                  <Badge variant="secondary">
                    {completedShoppingItems.length} виконаних
                  </Badge>
                </div>
              </div>

              {shoppingList.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Список покупок порожній</p>
                  <p className="text-sm text-muted-foreground">
                    Продукти будуть автоматично додаватися з холодильника та рецептів
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shoppingList.map((item) => (
                    <Card key={item.id} className="p-3 bg-card/50 backdrop-blur-sm border border-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShoppingListItem(item.id)}
                          >
                            {item.isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <h4 className={`font-medium ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {item.name}
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              <span>{item.category}</span>
                              {item.quantity && (
                                <span className="ml-2">
                                  {item.quantity.amount} {item.quantity.unit}
                                </span>
                              )}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {item.source === "manual" ? "Вручну" : 
                                 item.source === "fridge_expired" ? "Прострочено" :
                                 item.source === "recipe_missing" ? "З рецепту" : "Закінчується"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromShoppingList(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Всього продуктів</h4>
                </div>
                <p className="text-2xl font-bold">{analytics.totalProducts}</p>
              </Card>

              <Card className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h4 className="font-semibold">Прострочено</h4>
                </div>
                <p className="text-2xl font-bold text-destructive">{analytics.expiredProducts}</p>
              </Card>

              <Card className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold">Скоро прострочиться</h4>
                </div>
                <p className="text-2xl font-bold text-warning">{analytics.expiringSoon}</p>
              </Card>

              <Card className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <h4 className="font-semibold">Відсоток відходів</h4>
                </div>
                <p className="text-2xl font-bold text-success">{analytics.wasteStats.wastePercentage}%</p>
              </Card>
            </div>

            {analytics.nutritionBalance.totalCalories > 0 && (
              <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Загальна поживна цінність</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round(analytics.nutritionBalance.totalCalories)}</p>
                    <p className="text-sm text-muted-foreground">Ккал</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{Math.round(analytics.nutritionBalance.totalProtein)}г</p>
                    <p className="text-sm text-muted-foreground">Білки</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-500">{Math.round(analytics.nutritionBalance.totalFat)}г</p>
                    <p className="text-sm text-muted-foreground">Жири</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{Math.round(analytics.nutritionBalance.totalCarbs)}г</p>
                    <p className="text-sm text-muted-foreground">Вуглеводи</p>
                  </div>
                </div>
              </Card>
            )}

            {analytics.topProducts.length > 0 && (
              <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Найчастіші продукти</h3>
                <div className="space-y-2">
                  {analytics.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded bg-card/50 backdrop-blur-sm">
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{product.category}</Badge>
                      </div>
                      <Badge variant="secondary">{product.frequency} разів</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-4 pb-20 md:pb-8 md:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <FridgeHeaderBar
            expiredCount={expiredProducts.length}
            expiringCount={expiringProducts.length}
            onAddProduct={() => setShowAddModal(true)}
          />

          {/* Tabs Navigation */}
          <div className="mb-6">
            <FridgeTabsNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Tab Content */}
          {getTabContent()}
        </main>
        <MobileBottomNav />
      </div>
      
      {/* Add Product Modal */}
      <AddProductModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddProduct={addProduct}
        onSearchProducts={searchProducts}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onAddFromSearch={addProductFromSearch}
      />
      
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
