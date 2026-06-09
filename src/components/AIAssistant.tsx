import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  ChefHat, 
  Calendar, 
  Search, 
  Brain,
  Star,
  Heart,
  Copy,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { AIRecipeGenerator } from "./AIRecipeGenerator";
import { AIMealPlanner } from "./AIMealPlanner";
import { AIProductAnalyzer } from "./AIProductAnalyzer";
import { AINutritionAdvisor } from "./AINutritionAdvisor";
import { GeneratedRecipe, GeneratedMealPlan, ProductAnalysis, NutritionAdvice } from "@/lib/openai-ai";

interface AIAssistantProps {
  onRecipeGenerated?: (recipe: GeneratedRecipe) => void;
  onMealPlanGenerated?: (mealPlan: GeneratedMealPlan[]) => void;
  onProductAnalyzed?: (analysis: ProductAnalysis) => void;
  onAdviceGenerated?: (advice: NutritionAdvice) => void;
}

export function AIAssistant({ 
  onRecipeGenerated, 
  onMealPlanGenerated, 
  onProductAnalyzed, 
  onAdviceGenerated 
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState("recipes");
  const [favorites, setFavorites] = useState<{
    recipes: GeneratedRecipe[];
    mealPlans: GeneratedMealPlan[];
    products: ProductAnalysis[];
    advice: NutritionAdvice[];
  }>({
    recipes: [],
    mealPlans: [],
    products: [],
    advice: []
  });

  const handleAddToFavorites = (type: 'recipes' | 'mealPlans' | 'products' | 'advice', item: any) => {
    setFavorites(prev => ({
      ...prev,
      [type]: [...prev[type], item]
    }));
    toast.success("Добавлено в избранное!");
  };

  const handleRemoveFromFavorites = (type: 'recipes' | 'mealPlans' | 'products' | 'advice', index: number) => {
    setFavorites(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
    toast.success("Удалено из избранного!");
  };

  const getTotalFavorites = () => {
    return favorites.recipes.length + favorites.mealPlans.length + favorites.products.length + favorites.advice.length;
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Помощник по Питанию
              </h2>
              <p className="text-sm text-muted-foreground">
                Умные рекомендации, рецепты и советы с использованием OpenAI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Star className="w-3 h-3 mr-1" />
              {getTotalFavorites()} в избранном
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              OpenAI
            </Badge>
          </div>
        </div>
      </Card>

      {/* AI Features Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/30 p-1 rounded-xl">
          <TabsTrigger 
            value="recipes" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
          >
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">Рецепты</span>
          </TabsTrigger>
          <TabsTrigger 
            value="meal-plan" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Планы</span>
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Продукты</span>
          </TabsTrigger>
          <TabsTrigger 
            value="advice" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Советы</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="mt-6">
          <AIRecipeGenerator
            onRecipeGenerated={onRecipeGenerated}
            onAddToFavorites={(recipe) => handleAddToFavorites('recipes', recipe)}
          />
        </TabsContent>

        <TabsContent value="meal-plan" className="mt-6">
          <AIMealPlanner
            onMealPlanGenerated={onMealPlanGenerated}
            onAddToFavorites={(recipe) => handleAddToFavorites('recipes', recipe)}
          />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <AIProductAnalyzer
            onProductAnalyzed={onProductAnalyzed}
            onAddToFavorites={(product) => handleAddToFavorites('products', product)}
          />
        </TabsContent>

        <TabsContent value="advice" className="mt-6">
          <AINutritionAdvisor
            onAdviceGenerated={onAdviceGenerated}
          />
        </TabsContent>
      </Tabs>

      {/* Favorites Section */}
      {getTotalFavorites() > 0 && (
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-yellow-900">Избранное</h3>
              <p className="text-sm text-yellow-700">
                Ваши сохраненные рецепты, планы и советы
              </p>
            </div>
          </div>

          <Tabs defaultValue="recipes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recipes" className="text-xs">
                Рецепты ({favorites.recipes.length})
              </TabsTrigger>
              <TabsTrigger value="meal-plans" className="text-xs">
                Планы ({favorites.mealPlans.length})
              </TabsTrigger>
              <TabsTrigger value="products" className="text-xs">
                Продукты ({favorites.products.length})
              </TabsTrigger>
              <TabsTrigger value="advice" className="text-xs">
                Советы ({favorites.advice.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="mt-4">
              {favorites.recipes.length > 0 ? (
                <div className="space-y-3">
                  {favorites.recipes.map((recipe, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <h4 className="font-medium">{recipe.title}</h4>
                        <p className="text-sm text-muted-foreground">{recipe.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{recipe.cookingTime} мин</span>
                          <span>{recipe.servings} порций</span>
                          <span>{recipe.nutrition.calories} ккал</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromFavorites('recipes', index)}
                      >
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет сохраненных рецептов</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="meal-plans" className="mt-4">
              {favorites.mealPlans.length > 0 ? (
                <div className="space-y-3">
                  {favorites.mealPlans.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <h4 className="font-medium">План питания</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.meals.length} приемов пищи
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {plan.totalNutrition.calories} ккал в день
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromFavorites('mealPlans', index)}
                      >
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет сохраненных планов питания</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="mt-4">
              {favorites.products.length > 0 ? (
                <div className="space-y-3">
                  {favorites.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromFavorites('products', index)}
                      >
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет сохраненных анализов продуктов</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advice" className="mt-4">
              {favorites.advice.length > 0 ? (
                <div className="space-y-3">
                  {favorites.advice.map((advice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <h4 className="font-medium">Совет по питанию</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {advice.summary}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {advice.recommendations.length} рекомендаций
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromFavorites('advice', index)}
                      >
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет сохраненных советов</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}

