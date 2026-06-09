import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  Clock, 
  Utensils, 
  RefreshCw, 
  Eye,
  Target,
  TrendingUp,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Sunrise,
  Sun,
  Moon,
  Apple
} from "lucide-react";
import { DailyPlan, PlannedMeal, getMealTypeName, getMealTypeIcon, getStatusColor, getStatusText } from "@/lib/meal-planner";
import { MealSwapOptions } from "@/lib/meal-planner";
import { RecipeDetailsModal } from "@/components/RecipeDetailsModal";

interface DailyPlanInterfaceProps {
  dailyPlan: DailyPlan;
  onMealCompleted: (mealId: string) => void;
  onMealSwap: (mealId: string, newRecipe: PlannedMeal["recipe"]) => void;
  onRegenerateDay: () => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  hasPreviousDay: boolean;
  hasNextDay: boolean;
}

export function DailyPlanInterface({
  dailyPlan,
  onMealCompleted,
  onMealSwap,
  onRegenerateDay,
  onPreviousDay,
  onNextDay,
  hasPreviousDay,
  hasNextDay
}: DailyPlanInterfaceProps) {
  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const [swapOptions, setSwapOptions] = useState<MealSwapOptions | null>(null);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<any>(null);

  const handleViewRecipe = (recipe: any) => {
    setSelectedRecipeForModal(recipe);
    setRecipeModalOpen(true);
  };

  const { date, meals, totalNutrition, progress, status } = dailyPlan;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('uk-UA', options);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on_track":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "under":
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case "over":
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90 && progress <= 110) return "bg-green-500";
    if (progress >= 70 && progress < 90) return "bg-yellow-500";
    if (progress > 110) return "bg-red-500";
    return "bg-gray-500";
  };

  const handleMealSwap = async (meal: PlannedMeal) => {
    setSelectedMeal(meal);
    // In a real app, this would fetch swap options from the API
    const mockSwapOptions: MealSwapOptions = {
      originalMeal: meal,
      alternatives: [
        {
          recipe: {
            id: "swap-1",
            title: "Альтернативний рецепт 1",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
            readyInMinutes: 25,
            servings: 1,
            nutrition: {
              calories: meal.recipe.nutrition.calories + 50,
              protein: meal.recipe.nutrition.protein + 5,
              fat: meal.recipe.nutrition.fat + 2,
              carbs: meal.recipe.nutrition.carbs + 8
            },
            ingredients: meal.recipe.ingredients,
            instructions: ["Alternative recipe instructions"]
          },
          similarity: 85,
          reason: "Схожа калорійність та білок"
        },
        {
          recipe: {
            id: "swap-2",
            title: "Альтернативний рецепт 2",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
            readyInMinutes: 20,
            servings: 1,
            nutrition: {
              calories: meal.recipe.nutrition.calories - 30,
              protein: meal.recipe.nutrition.protein - 3,
              fat: meal.recipe.nutrition.fat - 1,
              carbs: meal.recipe.nutrition.carbs - 5
            },
            ingredients: meal.recipe.ingredients,
            instructions: ["Alternative recipe instructions 2"]
          },
          similarity: 78,
          reason: "Аналогічний час приготування"
        }
      ]
    };
    setSwapOptions(mockSwapOptions);
    setShowSwapDialog(true);
  };

  const handleSwapSelect = (newRecipe: PlannedMeal["recipe"]) => {
    if (selectedMeal) {
      onMealSwap(selectedMeal.id, newRecipe);
      setShowSwapDialog(false);
      setSelectedMeal(null);
      setSwapOptions(null);
    }
  };

  const completedMeals = meals.filter(meal => meal.isCompleted).length;
  const totalMeals = meals.length;

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousDay}
              disabled={!hasPreviousDay}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(date)}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(status)}
                <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNextDay}
              disabled={!hasNextDay}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={onRegenerateDay} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Перегенерувати день
          </Button>
        </div>

        {/* Daily Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {totalNutrition.planned.calories}
            </div>
            <div className="text-xs text-muted-foreground">Заплановано ккал</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {totalNutrition.actual.calories}
            </div>
            <div className="text-xs text-muted-foreground">Спожито ккал</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {completedMeals}/{totalMeals}
            </div>
            <div className="text-xs text-muted-foreground">Прийомів їжі</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {progress.caloriesProgress}%
            </div>
            <div className="text-xs text-muted-foreground">Прогрес</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Калорії</span>
              <span>{progress.caloriesProgress}%</span>
            </div>
            <Progress 
              value={progress.caloriesProgress} 
              className={`h-2 ${getProgressColor(progress.caloriesProgress)}`}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Білки</span>
                <span>{progress.proteinProgress}%</span>
              </div>
              <Progress value={progress.proteinProgress} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Жири</span>
                <span>{progress.fatProgress}%</span>
              </div>
              <Progress value={progress.fatProgress} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Вуглеводи</span>
                <span>{progress.carbsProgress}%</span>
              </div>
              <Progress value={progress.carbsProgress} className="h-1" />
            </div>
          </div>
        </div>
      </Card>

      {/* Meals */}
      <div className="space-y-4">
        {meals.map((meal) => (
          <Card key={meal.id} className="p-4">
            <div className="flex items-start gap-4">
              {/* Meal Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={meal.recipe.image}
                  alt={meal.recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Meal Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                  <div className="flex items-center gap-2 mb-1">
                    {meal.mealType === "breakfast" && <Sunrise className="w-5 h-5 text-orange-500" />}
                    {meal.mealType === "lunch" && <Sun className="w-5 h-5 text-yellow-500" />}
                    {meal.mealType === "dinner" && <Moon className="w-5 h-5 text-blue-500" />}
                    {meal.mealType === "snack" && <Apple className="w-5 h-5 text-green-500" />}
                    <h3 className="font-semibold">{meal.recipe.title}</h3>
                      {meal.scheduledTime && (
                        <Badge variant="outline" className="text-xs">
                          {meal.scheduledTime}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meal.recipe.readyInMinutes} хв
                      </span>
                      <span className="flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        {meal.recipe.servings} порцій
                      </span>
                    </div>
                  </div>
                  
                  {meal.isCompleted && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Завершено
                    </Badge>
                  )}
                </div>

                {/* Nutrition Info */}
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="font-semibold text-orange-500">
                      {meal.recipe.nutrition.calories}
                    </div>
                    <div className="text-xs text-muted-foreground">ккал</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-500">
                      {meal.recipe.nutrition.protein}г
                    </div>
                    <div className="text-xs text-muted-foreground">білки</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-500">
                      {meal.recipe.nutrition.fat}г
                    </div>
                    <div className="text-xs text-muted-foreground">жири</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-500">
                      {meal.recipe.nutrition.carbs}г
                    </div>
                    <div className="text-xs text-muted-foreground">вуглеводи</div>
                  </div>
                </div>

                {/* Ingredients Status */}
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Інгредієнти:</div>
                  <div className="flex flex-wrap gap-1">
                    {meal.recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                      <Badge
                        key={index}
                        variant={ingredient.isAvailable ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {ingredient.name}
                      </Badge>
                    ))}
                    {meal.recipe.ingredients.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{meal.recipe.ingredients.length - 3} ще
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!meal.isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => onMealCompleted(meal.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Позначити як з'їдене
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMealSwap(meal)}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Замінити
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleViewRecipe(meal.recipe)}
                  >
                    <Eye className="w-4 h-4" />
                    Рецепт
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Meal Swap Dialog */}
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Замінити страву</DialogTitle>
          </DialogHeader>
          
          {swapOptions && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Поточна страва:</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={swapOptions.originalMeal.recipe.image}
                    alt={swapOptions.originalMeal.recipe.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <div className="font-medium">{swapOptions.originalMeal.recipe.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {swapOptions.originalMeal.recipe.nutrition.calories} ккал
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Альтернативи:</h4>
                <div className="space-y-3">
                  {swapOptions.alternatives.map((alternative, index) => (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSwapSelect(alternative.recipe)}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={alternative.recipe.image}
                          alt={alternative.recipe.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{alternative.recipe.title}</h5>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{alternative.recipe.nutrition.calories} ккал</span>
                            <span>{alternative.recipe.readyInMinutes} хв</span>
                            <span>{alternative.similarity}% схожість</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alternative.reason}
                          </p>
                        </div>
                        <Button size="sm">Обрати</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RecipeDetailsModal 
        isOpen={recipeModalOpen} 
        onClose={() => setRecipeModalOpen(false)} 
        recipe={selectedRecipeForModal} 
      />
    </div>
  );
}
