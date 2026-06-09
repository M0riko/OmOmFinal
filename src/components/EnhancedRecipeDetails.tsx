import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Users, 
  ExternalLink, 
  Heart, 
  X, 
  ChefHat, 
  Flame, 
  Milk, 
  Apple, 
  Carrot,
  Leaf,
  CandyCane,
  Plus,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Calendar,
  Star,
  MessageSquare,
  Share2
} from "lucide-react";
import { Recipe } from "@/lib/api";
import { fatSecretApiService } from "@/lib/fatsecret-api";
import { useState, useEffect } from "react";
import { useSmartFridge } from "@/hooks/useSmartFridge";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useDaily } from "@/hooks/useDaily";
import { toast } from "sonner";

// Type definitions for Meal Plan
type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type MealPlanItem = {
  id: string;
  recipeId?: number;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  image?: string;
  date: string;
};

type EnhancedRecipeDetailsProps = {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  translateRecipeToCyrillic: (name: string) => string;
};

interface IngredientWithStatus {
  name: string;
  amount: string;
  unit: string;
  isAvailable: boolean;
  isInShoppingList: boolean;
}

export function EnhancedRecipeDetails({ 
  recipe, 
  open, 
  onOpenChange, 
  isFavorite, 
  onToggleFavorite,
  translateRecipeToCyrillic 
}: EnhancedRecipeDetailsProps) {
  const { products, addToShoppingList } = useSmartFridge();
  const { addToMealPlan } = useMealPlanner();
  const { addFromRecipe } = useShoppingList();
  const { addEntry } = useDaily();
  const [servings, setServings] = useState(recipe?.servings || 1);
  const [ingredients, setIngredients] = useState<IngredientWithStatus[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showAddToMealPlan, setShowAddToMealPlan] = useState(false);
  const [planDate, setPlanDate] = useState(new Date().toISOString().split('T')[0]);
  const [planMealType, setPlanMealType] = useState<MealType>("lunch");

  const handleAddToMealPlan = () => {
    if (!recipe) return;

    try {
      const STORAGE_KEY = "omomo_meal_plans";
      const saved = localStorage.getItem(STORAGE_KEY);
      let plans = saved ? JSON.parse(saved) : [];

      let datePlan = plans.find((p: any) => p.date === planDate);
      if (!datePlan) {
        datePlan = {
          date: planDate,
          plan: { breakfast: [], lunch: [], dinner: [], snack: [] },
          totals: { calories: 0, protein: 0, fat: 0, carbs: 0 }
        };
        plans.push(datePlan);
      }

      const calories = getNutritionPerServing('Calories');
      const protein = getNutritionPerServing('Protein');
      const fats = getNutritionPerServing('Fat');
      const carbs = getNutritionPerServing('Carbohydrates');

      const mealItem: MealPlanItem = {
        id: crypto.randomUUID(),
        recipeId: recipe.id,
        name: translateRecipeToCyrillic(recipe.title),
        mealType: planMealType,
        calories,
        protein,
        fat: fats,
        carbs,
        image: recipe.image,
        date: planDate
      };

      datePlan.plan[planMealType].push(mealItem);
      datePlan.totals.calories += calories;
      datePlan.totals.protein += protein;
      datePlan.totals.fat += fats;
      datePlan.totals.carbs += carbs;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      toast.success(`"${translateRecipeToCyrillic(recipe.title)}" додано до плану харчування!`);
      setShowAddToMealPlan(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding to meal plan:", error);
      toast.error("Помилка збереження в план харчування");
    }
  };

  useEffect(() => {
    if (recipe && open) {
      setServings(recipe.servings);
      
      // Load full recipe details with ingredients if not available
      if (!recipe.extendedIngredients || recipe.extendedIngredients.length === 0) {
        console.log('Loading full recipe details for recipe ID:', recipe.id);
        fatSecretApiService.getRecipeById(recipe.id.toString())
          .then((fullRecipeData) => {
            console.log('Full recipe data loaded:', fullRecipeData);
            if (fullRecipeData) {
              // Update recipe with full ingredients
              const updatedRecipe = { ...recipe, ...fullRecipeData };
              console.log('Updated recipe with ingredients:', updatedRecipe.extendedIngredients?.length || 0);
              
              // Update local state to trigger re-render
              if (fullRecipeData.extendedIngredients && fullRecipeData.extendedIngredients.length > 0) {
                console.log('Using real ingredients from API:', fullRecipeData.extendedIngredients.length);
                analyzeIngredients(updatedRecipe);
              } else {
                console.warn('No ingredients found in full recipe data from API');
                // Don't use fallback - show message that ingredients are not available
                setIngredients([]);
              }
            } else {
              analyzeIngredients(recipe);
            }
          })
          .catch((error) => {
            console.error('Error loading full recipe details:', error);
            analyzeIngredients(recipe);
          });
      } else {
        console.log('Recipe already has ingredients:', recipe.extendedIngredients.length);
        analyzeIngredients(recipe);
      }
    }
  }, [recipe, open, products]);

  const analyzeIngredients = (recipeToAnalyze?: Recipe) => {
    const recipeData = recipeToAnalyze || recipe;
    if (!recipeData?.extendedIngredients || recipeData.extendedIngredients.length === 0) {
      console.warn('No ingredients to analyze');
      setIngredients([]);
      return;
    }
    
    console.log('Analyzing ingredients:', recipeData.extendedIngredients.length);

    const analyzedIngredients: IngredientWithStatus[] = recipeData.extendedIngredients.map(ingredient => {
      const ingredientName = ingredient.name.toLowerCase().trim();
      
      // Проверяем, есть ли ингредиент в холодильнике
      const isAvailable = products.some(product => {
        const productName = product.name.toLowerCase().trim();
        return ingredientName.includes(productName) || 
               productName.includes(ingredientName) ||
               ingredientName.split(' ').some(word => 
                 productName.includes(word) && word.length > 2
               );
      });

      return {
        name: ingredient.name,
        amount: ingredient.amount?.toString() || "1",
        unit: ingredient.unit || "шт",
        isAvailable,
        isInShoppingList: false // Можно добавить проверку списка покупок
      };
    });

    setIngredients(analyzedIngredients);
  };

  const addIngredientToShoppingList = (ingredient: IngredientWithStatus) => {
    addToShoppingList({
      name: ingredient.name,
      quantity: parseFloat(ingredient.amount) || 1,
      unit: ingredient.unit,
      category: 'other',
      expiryDate: null,
      nutrition: null
    });
    
    setIngredients(prev => prev.map(ing => 
      ing.name === ingredient.name 
        ? { ...ing, isInShoppingList: true }
        : ing
    ));
  };

  const addAllMissingIngredients = () => {
    if (!recipe) return;
    
    const count = addFromRecipe(recipe);
    if (count > 0) {
      toast.success(`Додано ${count} інгредієнтів до списку покупок!`);
    } else {
      toast.info("Всі інгредієнти вже є в холодильнику або списку покупок");
    }
  };

  const addToMealPlanHandler = (mealType: string, date: string) => {
    if (!recipe) return;

    addToMealPlan(date, mealType, recipe);
    toast.success(`Додано до плану харчування!`);
    setShowAddToMealPlan(false);
  };

  const logMeal = () => {
    if (!recipe) return;

    const calories = getNutritionPerServing('Calories');
    const protein = getNutritionPerServing('Protein');
    const fats = getNutritionPerServing('Fat');
    const carbs = getNutritionPerServing('Carbohydrates');

    addEntry({
      type: "meal",
      name: translateRecipeToCyrillic(recipe.title),
      mealType: "lunch", // Default to lunch, could be enhanced
      calories,
      protein,
      fats,
      carbs
    });
    
    toast.success(`"${translateRecipeToCyrillic(recipe.title)}" додано до щоденника!`);
    onOpenChange(false);
  };

  const getNutritionPerServing = (nutrientName: string) => {
    if (!recipe?.nutrition?.nutrients) return 0;
    const nutrient = recipe.nutrition.nutrients.find(n => n.name === nutrientName);
    return nutrient ? Math.round(nutrient.amount / recipe.servings * servings) : 0;
  };

  const getIngredientIcon = (ingredientName: string) => {
    const name = ingredientName.toLowerCase();
    if (name.includes('chicken') || name.includes('meat') || name.includes('beef')) return Carrot;
    if (name.includes('milk') || name.includes('cheese') || name.includes('dairy')) return Milk;
    if (name.includes('vegetable') || name.includes('carrot') || name.includes('onion')) return Apple;
    if (name.includes('sweet') || name.includes('sugar') || name.includes('dessert')) return CandyCane;
    return Leaf;
  };

  if (!recipe) return null;

  const displayTitle = translateRecipeToCyrillic(recipe.title);
  const availableCount = ingredients.filter(ing => ing.isAvailable).length;
  const totalIngredients = ingredients.length;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {displayTitle}
              </DialogTitle>
              {displayTitle !== recipe.title && (
                <p className="text-sm text-muted-foreground italic">
                  ({recipe.title})
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(recipe as Recipe)}
                className="h-9 w-9 p-0"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка - Фото и основная информация */}
          <div className="lg:col-span-1 space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={recipe.image} 
                alt={displayTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400";
                }}
              />
            </div>

            {/* Основная информация */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{recipe.readyInMinutes} хвилин</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{recipe.servings} порцій</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{recipe.dishTypes?.[0] || 'Основна страва'}</span>
                </div>
              </div>
            </Card>

            {/* КБЖУ */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Харчова цінність (на порцію)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Калориї</span>
                  </div>
                  <span className="font-medium">{getNutritionPerServing('Calories')} ккал</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">Білки</span>
                  </div>
                  <span className="font-medium">{getNutritionPerServing('Protein')}г</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Вуглеводи</span>
                  </div>
                  <span className="font-medium">{getNutritionPerServing('Carbohydrates')}г</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm">Жири</span>
                  </div>
                  <span className="font-medium">{getNutritionPerServing('Fat')}г</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Правая колонка - Ингредиенты и инструкции */}
          <div className="lg:col-span-2 space-y-6">
            {/* Количество порций */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="servings" className="text-sm font-medium">
                  Кількість порцій
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    disabled={servings <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServings(servings + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </Card>

            {/* Ингредиенты */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Інгредієнти</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {availableCount}/{totalIngredients} є
                  </Badge>
                  {availableCount < totalIngredients && (
                    <Button
                      size="sm"
                      onClick={addAllMissingIngredients}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Додати всі
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {ingredients.length === 0 ? (
                  <Card className="p-6 text-center">
                    <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2 font-medium">
                      Інгредієнти недоступні для цього рецепту
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      FatSecret API не надає список інгредієнтів для цього рецепту.
                      Детальну інформацію можна знайти на офіційному сайті рецепту.
                    </p>
                    {recipe?.sourceUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="mt-2"
                      >
                        <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Переглянути повний рецепт на FatSecret
                        </a>
                      </Button>
                    )}
                  </Card>
                ) : (
                  ingredients.map((ingredient, index) => {
                  const IconComponent = getIngredientIcon(ingredient.name);
                  return (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        ingredient.isAvailable 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-muted/50 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-4 h-4 ${
                          ingredient.isAvailable 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-muted-foreground'
                        }`} />
                        <div>
                          <span className={`font-medium ${
                            ingredient.isAvailable ? 'text-green-800 dark:text-green-200' : 'text-foreground'
                          }`}>
                            {ingredient.name}
                          </span>
                          <div className="text-sm text-muted-foreground">
                            {ingredient.amount} {ingredient.unit}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {ingredient.isAvailable ? (
                          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Є
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addIngredientToShoppingList(ingredient)}
                            disabled={ingredient.isInShoppingList}
                            className="gap-1"
                          >
                            {ingredient.isInShoppingList ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Додано
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                В список
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </Card>

            {/* Инструкции */}
            {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Інструкції</h4>
                <div className="space-y-4">
                  {recipe.analyzedInstructions[0].steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed">{step.step}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Действия */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Дії</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  onClick={() => setShowAddToMealPlan(true)}
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Додати в план
                </Button>
                <Button 
                  onClick={logMeal}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Приготував(ла)
                </Button>
                {recipe.sourceUrl && (
                  <Button 
                    variant="outline" 
                    asChild
                    className="gap-2"
                  >
                    <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Оригінал
                    </a>
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Поділитися
                </Button>
              </div>
            </Card>

            {/* Рейтинг и отзывы */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Оцінка та відгук</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Оцінка:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => setRating(star)}
                        className="h-6 w-6 p-0"
                      >
                        <Star className={`w-4 h-4 ${
                          star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                        }`} />
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Ваш відгук</Label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Поділіться своїми враженнями..."
                    className="w-full p-3 border rounded-lg resize-none h-20 text-sm"
                  />
                </div>
                <Button size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Зберегти відгук
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Модалка для додавання в План харчування */}
    <Dialog open={showAddToMealPlan} onOpenChange={setShowAddToMealPlan}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Додати до плану харчування</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Дата</Label>
            <Input 
              type="date" 
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label>Прийом їжі</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={planMealType === "breakfast" ? "default" : "outline"}
                onClick={() => setPlanMealType("breakfast")}
              >Сніданок</Button>
              <Button 
                variant={planMealType === "lunch" ? "default" : "outline"}
                onClick={() => setPlanMealType("lunch")}
              >Обід</Button>
              <Button 
                variant={planMealType === "dinner" ? "default" : "outline"}
                onClick={() => setPlanMealType("dinner")}
              >Вечеря</Button>
              <Button 
                variant={planMealType === "snack" ? "default" : "outline"}
                onClick={() => setPlanMealType("snack")}
              >Перекус</Button>
            </div>
          </div>
          <Button onClick={handleAddToMealPlan} className="w-full mt-4">
            Зберегти в план
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
