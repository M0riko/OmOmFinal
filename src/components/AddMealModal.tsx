import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Clock, Users, Apple, ShoppingCart } from "lucide-react";
import { apiService, Recipe, Food, OpenFoodFactsProduct } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetMealType?: "breakfast" | "lunch" | "dinner" | "snack";
  onAddMeal?: (recipe: Recipe) => void;
  onAddManual?: (meal: { name: string; calories: number; protein: number; fat: number; carbs: number }) => void;
}

export function AddMealModal({ 
  open, 
  onOpenChange, 
  presetMealType,
  onAddMeal,
  onAddManual 
}: AddMealModalProps) {
  const mealType = presetMealType || "lunch";
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Food[]>([]);
  const [offProducts, setOffProducts] = useState<OpenFoodFactsProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const mealTypeLabels = {
    breakfast: "Сніданок",
    lunch: "Обід",
    dinner: "Вечеря",
    snack: "Перекус"
  };

  const searchItems = async () => {
    if (!searchQuery.trim()) {
      toast.warning("Введіть назву для пошуку");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "products") {
        const [result, offResult] = await Promise.all([
          apiService.searchFoodsWithCustom(searchQuery, 0, 15),
          apiService.searchOpenFoodFacts(searchQuery, 10)
        ]);
        setProducts(result);
        setOffProducts(offResult);
        if (result.length === 0 && offResult.length === 0) {
          toast.info("Продуктів не знайдено");
        }
      } else if (activeTab === "recipes") {
        const result = await apiService.searchRecipes(searchQuery, { number: 10 });
        setRecipes(result.recipes);
        if (result.recipes.length === 0) {
          toast.info("Рецептів не знайдено");
        }
      }
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Помилка пошуку");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = (recipe: Recipe) => {
    if (onAddMeal) {
      onAddMeal(recipe);
    }
    closeModal();
    toast.success(`Рецепт "${recipe.title}" додано до ${mealTypeLabels[mealType]}`);
  };

  const handleAddProduct = (product: Food) => {
    if (onAddManual) {
      onAddManual({
        name: product.food_name,
        calories: product.calories || 0,
        protein: product.protein || 0,
        fat: product.fat || 0,
        carbs: product.carbs || 0
      });
    }
    closeModal();
    toast.success(`Продукт "${product.food_name}" додано до ${mealTypeLabels[mealType]}`);
  };

  const handleAddOFFProduct = (product: OpenFoodFactsProduct) => {
    if (onAddManual) {
      onAddManual({
        name: product.name,
        calories: product.calories || 0,
        protein: product.protein || 0,
        fat: product.fat || 0,
        carbs: product.carbs || 0
      });
    }
    closeModal();
    toast.success(`Продукт "${product.name}" додано до ${mealTypeLabels[mealType]}`);
  };

  const handleAddManualSubmit = (meal: any) => {
    if (onAddManual) {
      onAddManual(meal);
    }
    closeModal();
    toast.success(`Страву додано до ${mealTypeLabels[mealType]}`);
  };

  const closeModal = () => {
    onOpenChange(false);
    setSearchQuery("");
    setRecipes([]);
    setProducts([]);
    setOffProducts([]);
  };

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setRecipes([]);
      setProducts([]);
      setOffProducts([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Додати до прийому: {mealTypeLabels[mealType]}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Знайдіть продукт, рецепт або додайте дані вручну
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => {
            setActiveTab(val);
            setRecipes([]);
            setProducts([]);
            setOffProducts([]);
            // Don't clear searchQuery so they can search same term across tabs
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="products">Продукти</TabsTrigger>
            <TabsTrigger value="recipes">Рецепти</TabsTrigger>
            <TabsTrigger value="manual">Вручну</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Пошук продуктів (наприклад: банан, бургер)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchItems()}
                className="flex-1 bg-background/50 border-input focus:border-primary/50 text-foreground"
              />
              <Button 
                onClick={searchItems} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* Products Results */}
            {(products.length > 0 || offProducts.length > 0) && (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                
                {/* OFF Products */}
                {offProducts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Магазинні продукти (Open Food Facts)
                    </h3>
                    {offProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="p-4 bg-card/30 backdrop-blur-sm border border-border hover:border-primary/40 transition-all cursor-pointer shadow-none"
                        onClick={() => handleAddOFFProduct(product)}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingCart className="w-6 h-6 text-secondary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base mb-1 line-clamp-2">
                              {product.name}
                            </h4>
                            {product.brands && (
                              <p className="text-xs text-muted-foreground mb-2">{product.brands}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs bg-orange-500/10 border-orange-500/20 text-orange-400">
                                {Math.round(product.calories)} ккал
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-400">
                                Б: {Math.round(product.protein)}г
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                                Ж: {Math.round(product.fat)}г
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20 text-green-400">
                                В: {Math.round(product.carbs)}г
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddOFFProduct(product);
                            }}
                            className="flex-shrink-0 bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* FatSecret Products */}
                {products.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <Apple className="w-4 h-4" />
                      Базові продукти (FatSecret)
                    </h3>
                    {products.map((product) => (
                      <Card
                        key={product.food_id}
                        className="p-4 bg-card/30 backdrop-blur-sm border border-border hover:border-primary/40 transition-all cursor-pointer shadow-none"
                        onClick={() => handleAddProduct(product)}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                            <Apple className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base mb-2 line-clamp-2">{product.food_name}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs bg-orange-500/10 border-orange-500/20 text-orange-400">
                                {product.calories} ккал
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-400">
                                Б: {product.protein}г
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                                Ж: {product.fat}г
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20 text-green-400">
                                В: {product.carbs}г
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddProduct(product);
                            }}
                            className="flex-shrink-0 bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {!loading && products.length === 0 && offProducts.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Натисніть "Пошук" для початку</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Пошук рецептів (наприклад: салат, паста)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchItems()}
                className="flex-1 bg-background/50 border-input focus:border-primary/50 text-foreground"
              />
              <Button 
                onClick={searchItems} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* Recipes Results */}
            {recipes.length > 0 && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {recipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="p-4 bg-card/30 backdrop-blur-sm border border-border hover:border-primary/40 transition-all cursor-pointer shadow-none"
                    onClick={() => handleAddRecipe(recipe)}
                  >
                    <div className="flex gap-4">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-2 line-clamp-2">{recipe.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.readyInMinutes} хв</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{recipe.servings} порцій</span>
                          </div>
                          {recipe.nutrition?.nutrients && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(recipe.nutrition.nutrients.find((n: any) => n.name === "Calories")?.amount || 0)} ккал
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddRecipe(recipe);
                        }}
                        className="flex-shrink-0 bg-primary hover:bg-primary/90"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {!loading && recipes.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Натисніть "Пошук" для початку</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <ManualMealForm
              mealType={mealType}
              onSave={handleAddManualSubmit}
              onCancel={closeModal}
            />
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ManualMealForm({ mealType, onSave, onCancel }: { mealType: string; onSave: (meal: any) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");

  return (
    <div className="space-y-4">
      <Input
        placeholder="Назва страви"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-background/50 border-input"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          placeholder="Калорії"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="bg-background/50 border-input"
        />
        <Input
          type="number"
          placeholder="Білки (г)"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          className="bg-background/50 border-input"
        />
        <Input
          type="number"
          placeholder="Жири (г)"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          className="bg-background/50 border-input"
        />
        <Input
          type="number"
          placeholder="Вуглеводи (г)"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          className="bg-background/50 border-input"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave({ name, calories: Number(calories), protein: Number(protein), fat: Number(fat), carbs: Number(carbs) })}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Додати
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-input"
        >
          Скасувати
        </Button>
      </div>
    </div>
  );
}
