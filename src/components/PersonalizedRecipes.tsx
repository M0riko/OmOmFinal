import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Refrigerator, 
  Heart, 
  Sparkles, 
  TrendingUp,
  Clock,
  Users,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiService, Recipe } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useDaily } from "@/hooks/useDaily";
import { useSmartFridge } from "@/hooks/useSmartFridge";

interface PersonalizedRecipesProps {
  favorites: number[];
  onToggleFavorite: (recipeId: number) => void;
  onOpenRecipeDetails: (recipe: Recipe) => void;
  translateRecipeToCyrillic: (name: string) => string;
}

export function PersonalizedRecipes({ 
  favorites, 
  onToggleFavorite, 
  onOpenRecipeDetails,
  translateRecipeToCyrillic 
}: PersonalizedRecipesProps) {
  const { user } = useAuth();
  const { totals } = useDaily();
  const { products } = useSmartFridge();
  const [recommendations, setRecommendations] = useState<{
    goalBased: Recipe[];
    fridgeBased: Recipe[];
    preferenceBased: Recipe[];
  }>({
    goalBased: [],
    fridgeBased: [],
    preferenceBased: []
  });
  const [loading, setLoading] = useState(true);

  const targetCalories = user?.targets?.calories || 2000;
  const remainingCalories = targetCalories - totals.calories;
  const remainingProtein = (user?.targets?.protein || 150) - (totals.protein || 0);

  useEffect(() => {
    loadPersonalizedRecommendations();
  }, [user, totals, products, favorites]);

  const loadPersonalizedRecommendations = async () => {
    setLoading(true);
    try {
      // 1. Рекомендации на основе целей
      const goalBasedRecipes = await loadGoalBasedRecipes();
      
      // 2. Рекомендации на основе холодильника
      const fridgeBasedRecipes = await loadFridgeBasedRecipes();
      
      // 3. Рекомендации на основе предпочтений
      const preferenceBasedRecipes = await loadPreferenceBasedRecipes();

      setRecommendations({
        goalBased: goalBasedRecipes,
        fridgeBased: fridgeBasedRecipes,
        preferenceBased: preferenceBasedRecipes
      });
    } catch (error) {
      console.error('Error loading personalized recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoalBasedRecipes = async (): Promise<Recipe[]> => {
    try {
      // Определяем тип рекомендаций на основе оставшихся калорий и белка
      let searchTerms: string[] = [];
      
      if (remainingCalories > 800) {
        // Много калорий осталось - можно предложить сытные блюда
        searchTerms = ['chicken', 'pasta', 'rice', 'meat'];
      } else if (remainingCalories > 400) {
        // Средний остаток - сбалансированные блюда
        searchTerms = ['salad', 'soup', 'vegetable', 'fish'];
      } else {
        // Мало калорий - легкие блюда
        searchTerms = ['light', 'low calorie', 'vegetable', 'salad'];
      }

      // Если нужно больше белка
      if (remainingProtein > 30) {
        searchTerms = ['high protein', 'chicken', 'fish', 'meat', ...searchTerms];
      }

      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      const result = await apiService.searchRecipes(randomTerm, { number: 6 });
      return result.recipes;
    } catch (error) {
      console.error('Error loading goal-based recipes:', error);
      return [];
    }
  };

  const loadFridgeBasedRecipes = async (): Promise<Recipe[]> => {
    try {
      if (products.length === 0) return [];

      // Получаем основные ингредиенты из холодильника
      const mainIngredients = products
        .slice(0, 3)
        .map(product => product.name.toLowerCase())
        .filter(name => name.length > 2);

      if (mainIngredients.length === 0) return [];

      // Ищем рецепты с этими ингредиентами
      const searchTerm = mainIngredients[0];
      const result = await apiService.searchRecipes(searchTerm, { number: 6 });
      return result.recipes;
    } catch (error) {
      console.error('Error loading fridge-based recipes:', error);
      return [];
    }
  };

  const loadPreferenceBasedRecipes = async (): Promise<Recipe[]> => {
    try {
      // Анализируем избранные рецепты для понимания предпочтений
      if (favorites.length === 0) {
        // Если нет избранных, предлагаем популярные
        const result = await apiService.searchRecipes('popular', { number: 6 });
        return result.recipes;
      }

      // Здесь можно добавить более сложную логику анализа предпочтений
      const popularTerms = ['healthy', 'quick', 'vegetarian', 'dessert'];
      const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
      const result = await apiService.searchRecipes(randomTerm, { number: 6 });
      return result.recipes;
    } catch (error) {
      console.error('Error loading preference-based recipes:', error);
      return [];
    }
  };

  const renderRecipeCard = (recipe: Recipe) => {
    const displayTitle = translateRecipeToCyrillic(recipe.title);
    return (
      <Card key={recipe.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-2 border-transparent hover:border-primary/20">
        <div className="aspect-video bg-muted relative overflow-hidden">
          <img 
            src={recipe.image} 
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3 h-9 w-9 p-0 bg-background/80 hover:bg-background shadow-lg"
            onClick={() => onToggleFavorite(recipe.id)}
          >
            <Heart className={`w-4 h-4 ${favorites.includes(recipe.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </Button>
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Clock className="w-4 h-4" />
              {recipe.readyInMinutes} хв
              <span className="mx-1">•</span>
              <Users className="w-4 h-4" />
              {recipe.servings} порцій
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold mb-2 line-clamp-2 text-base group-hover:text-primary transition-colors">{displayTitle}</h3>
          <div className="space-y-3 mb-4 flex-1">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="font-medium">
                  {recipe.nutrition?.nutrients.find(n => n.name === "Calories")?.amount 
                    ? Math.round(recipe.nutrition.nutrients.find(n => n.name === "Calories")!.amount / recipe.servings)
                    : "~300"
                  } ккал
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Б: {recipe.nutrition?.nutrients.find(n => n.name === "Protein")?.amount 
                  ? Math.round(recipe.nutrition.nutrients.find(n => n.name === "Protein")!.amount / recipe.servings)
                  : "~15"
                }г</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-auto">
            <Button 
              size="sm" 
              onClick={() => onOpenRecipeDetails(recipe)}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              Деталі
            </Button>
            {recipe.sourceUrl && (
              <Button size="sm" variant="outline" asChild className="px-3 border-2 hover:bg-muted/50">
                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">Аналізуємо ваші уподобання...</p>
            <p className="text-sm text-muted-foreground mt-1">Підбираємо персональні рекомендації</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Рекомендации на основе целей */}
      {recommendations.goalBased.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Рекомендовано на основі ваших цілей</h3>
              <p className="text-sm text-muted-foreground">
                Залишилось {Math.round(remainingCalories)} ккал, {Math.round(remainingProtein)}г білків
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.goalBased.map(renderRecipeCard)}
          </div>
        </div>
      )}

      {/* Рекомендации на основе холодильника */}
      {recommendations.fridgeBased.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Refrigerator className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Приготуйте з того, що є</h3>
              <p className="text-sm text-muted-foreground">
                Рецепти з ваших продуктів ({products.length} в холодильнику)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.fridgeBased.map(renderRecipeCard)}
          </div>
        </div>
      )}

      {/* Рекомендации на основе предпочтений */}
      {recommendations.preferenceBased.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">На основі ваших уподобань</h3>
              <p className="text-sm text-muted-foreground">
                Схожі на ваші улюблені рецепти ({favorites.length} в улюблених)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.preferenceBased.map(renderRecipeCard)}
          </div>
        </div>
      )}

      {/* Если нет рекомендаций */}
      {recommendations.goalBased.length === 0 && 
       recommendations.fridgeBased.length === 0 && 
       recommendations.preferenceBased.length === 0 && (
        <Card className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-muted/30">
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Почнемо з рекомендацій!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Додайте продукти в холодильник або улюблені рецепти, щоб отримати персональні рекомендації
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
