import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Refrigerator, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  ExternalLink,
  Loader2,
  Heart,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiService, Recipe } from "@/lib/api";
import { useSmartFridge } from "@/hooks/useSmartFridge";

interface FridgeBasedRecipesProps {
  favorites: number[];
  onToggleFavorite: (recipeId: number) => void;
  onOpenRecipeDetails: (recipe: Recipe) => void;
  translateRecipeToCyrillic: (name: string) => string;
}

interface RecipeWithMatch extends Recipe {
  availableIngredients: number;
  totalIngredients: number;
  missingIngredients: string[];
}

export function FridgeBasedRecipes({ 
  favorites, 
  onToggleFavorite, 
  onOpenRecipeDetails,
  translateRecipeToCyrillic 
}: FridgeBasedRecipesProps) {
  const { products } = useSmartFridge();
  const [recipes, setRecipes] = useState<RecipeWithMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'perfect' | 'almost'>('all');

  useEffect(() => {
    if (products.length > 0) {
      loadFridgeRecipes();
    }
  }, [products]);

  const loadFridgeRecipes = async () => {
    setLoading(true);
    try {
      // Получаем основные ингредиенты из холодильника
      const fridgeIngredients = products.map(product => 
        product.name.toLowerCase().trim()
      );

      // Ищем рецепты с разными ингредиентами
      const searchTerms = fridgeIngredients.slice(0, 5); // Берем первые 5 ингредиентов
      const allRecipes: RecipeWithMatch[] = [];

      for (const term of searchTerms) {
        try {
          const result = await apiService.searchRecipes(term, { number: 10 });
          const recipesWithMatch = result.recipes.map(recipe => 
            calculateIngredientMatch(recipe, fridgeIngredients)
          );
          allRecipes.push(...recipesWithMatch);
        } catch (error) {
          console.error(`Error searching for ${term}:`, error);
        }
      }

      // Убираем дубликаты и сортируем по совпадению
      const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
        index === self.findIndex(r => r.id === recipe.id)
      );

      // Сортируем по проценту совпадения ингредиентов
      uniqueRecipes.sort((a, b) => {
        const aMatch = a.availableIngredients / a.totalIngredients;
        const bMatch = b.availableIngredients / b.totalIngredients;
        return bMatch - aMatch;
      });

      setRecipes(uniqueRecipes.slice(0, 20)); // Берем топ 20
    } catch (error) {
      console.error('Error loading fridge recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateIngredientMatch = (recipe: Recipe, fridgeIngredients: string[]): RecipeWithMatch => {
    if (!recipe.extendedIngredients || recipe.extendedIngredients.length === 0) {
      return {
        ...recipe,
        availableIngredients: 0,
        totalIngredients: 1,
        missingIngredients: []
      };
    }

    let availableCount = 0;
    const missingIngredients: string[] = [];

    recipe.extendedIngredients.forEach(ingredient => {
      const ingredientName = ingredient.name.toLowerCase().trim();
      
      // Проверяем, есть ли этот ингредиент в холодильнике
      const isAvailable = fridgeIngredients.some(fridgeIngredient => 
        ingredientName.includes(fridgeIngredient) || 
        fridgeIngredient.includes(ingredientName) ||
        // Проверяем части слов
        ingredientName.split(' ').some(word => 
          fridgeIngredient.includes(word) && word.length > 2
        )
      );

      if (isAvailable) {
        availableCount++;
      } else {
        missingIngredients.push(ingredient.name);
      }
    });

    return {
      ...recipe,
      availableIngredients: availableCount,
      totalIngredients: recipe.extendedIngredients.length,
      missingIngredients: missingIngredients.slice(0, 3) // Показываем только первые 3 недостающих
    };
  };

  const getFilteredRecipes = () => {
    switch (filterMode) {
      case 'perfect':
        return recipes.filter(recipe => recipe.availableIngredients === recipe.totalIngredients);
      case 'almost':
        return recipes.filter(recipe => {
          const matchRatio = recipe.availableIngredients / recipe.totalIngredients;
          return matchRatio >= 0.7 && matchRatio < 1;
        });
      default:
        return recipes;
    }
  };

  const getMatchColor = (recipe: RecipeWithMatch) => {
    const matchRatio = recipe.availableIngredients / recipe.totalIngredients;
    if (matchRatio === 1) return 'text-green-600 dark:text-green-400';
    if (matchRatio >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getMatchIcon = (recipe: RecipeWithMatch) => {
    const matchRatio = recipe.availableIngredients / recipe.totalIngredients;
    if (matchRatio === 1) return CheckCircle;
    if (matchRatio >= 0.7) return AlertCircle;
    return AlertCircle;
  };

  const renderRecipeCard = (recipe: RecipeWithMatch) => {
    const displayTitle = translateRecipeToCyrillic(recipe.title);
    const MatchIcon = getMatchIcon(recipe);
    const matchColor = getMatchColor(recipe);

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
          
          {/* Индикатор совпадения ингредиентов */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className={`bg-background/90 text-foreground border-0 ${matchColor}`}
            >
              <MatchIcon className="w-3 h-3 mr-1" />
              {recipe.availableIngredients}/{recipe.totalIngredients}
            </Badge>
          </div>

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
          
          {/* Информация о совпадении ингредиентов */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Refrigerator className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {recipe.availableIngredients === recipe.totalIngredients ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Всі інгредієнти є!
                  </span>
                ) : (
                  <span>
                    Є {recipe.availableIngredients} з {recipe.totalIngredients} інгредієнтів
                  </span>
                )}
              </span>
            </div>
            
            {/* Недостающие ингредиенты */}
            {recipe.missingIngredients.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">Не вистачає:</span> {recipe.missingIngredients.join(', ')}
                {recipe.missingIngredients.length === 3 && recipe.totalIngredients > recipe.availableIngredients + 3 && 
                  ` +${recipe.totalIngredients - recipe.availableIngredients - 3} ще`
                }
              </div>
            )}
          </div>

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

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-muted/30">
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Refrigerator className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">Холодильник порожній</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Додайте продукти в холодильник, щоб знайти рецепти з ваших інгредієнтів
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={filterMode === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('all')}
          className="gap-2"
        >
          <Refrigerator className="w-4 h-4" />
          Всі рецепти ({recipes.length})
        </Button>
        <Button
          variant={filterMode === 'perfect' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('perfect')}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Точна відповідність ({recipes.filter(r => r.availableIngredients === r.totalIngredients).length})
        </Button>
        <Button
          variant={filterMode === 'almost' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterMode('almost')}
          className="gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Майже підходить ({recipes.filter(r => {
            const ratio = r.availableIngredients / r.totalIngredients;
            return ratio >= 0.7 && ratio < 1;
          }).length})
        </Button>
      </div>

      {/* Загрузка */}
      {loading && (
        <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">Аналізуємо ваші продукти...</p>
              <p className="text-sm text-muted-foreground mt-1">Шукаємо рецепти з ваших інгредієнтів</p>
            </div>
          </div>
        </Card>
      )}

      {/* Рецепты */}
      {!loading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(renderRecipeCard)}
        </div>
      )}

      {/* Нет результатов */}
      {!loading && filteredRecipes.length === 0 && (
        <Card className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-muted/30">
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Refrigerator className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">
                {filterMode === 'perfect' ? 'Немає рецептів з усіма інгредієнтами' :
                 filterMode === 'almost' ? 'Немає рецептів майже з усіма інгредієнтами' :
                 'Не знайдено рецептів'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Спробуйте додати більше різноманітних продуктів в холодильник
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterMode('all')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Показати всі рецепти
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
