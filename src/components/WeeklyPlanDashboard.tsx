import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Utensils,
  Sunrise,
  Sun,
  Moon,
  Apple
} from "lucide-react";
import { WeeklyPlan, getStatusColor, getStatusText } from "@/lib/meal-planner";

interface WeeklyPlanDashboardProps {
  weeklyPlan: WeeklyPlan;
  onDayClick: (date: string) => void;
}

export function WeeklyPlanDashboard({ weeklyPlan, onDayClick }: WeeklyPlanDashboardProps) {
  const { days, totalNutrition, averageProgress, adherence } = weeklyPlan;

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
  };

  const getDayNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on_track":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "under":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "over":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90 && progress <= 110) return "bg-green-500";
    if (progress >= 70 && progress < 90) return "bg-yellow-500";
    if (progress > 110) return "bg-red-500";
    return "bg-gray-500";
  };

  const getMealIcons = (day: any) => {
    const iconComponents = {
      breakfast: Sunrise,
      lunch: Sun,
      dinner: Moon,
      snack: Apple
    };
    
    return day.meals.map((meal: any) => {
      const IconComponent = iconComponents[meal.mealType as keyof typeof iconComponents] || Utensils;
      return (
        <IconComponent 
          key={meal.id}
          className={`w-4 h-4 ${meal.isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}
          title={`${meal.mealType} - ${meal.recipe.title}`}
        />
      );
    });
  };

  const completedMeals = days.reduce((total, day) => 
    total + day.meals.filter((meal: any) => meal.isCompleted).length, 0
  );
  const totalMeals = days.reduce((total, day) => total + day.meals.length, 0);

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            План на тиждень
          </h2>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="w-3 h-3" />
            {adherence}% виконання
          </Badge>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {Math.round(totalNutrition.planned.calories / 7)}
            </div>
            <div className="text-xs text-muted-foreground">Калорій/день</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {Math.round(totalNutrition.planned.protein / 7)}г
            </div>
            <div className="text-xs text-muted-foreground">Білків/день</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {completedMeals}/{totalMeals}
            </div>
            <div className="text-xs text-muted-foreground">Прийомів їжі</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {averageProgress.caloriesProgress}%
            </div>
            <div className="text-xs text-muted-foreground">Середній прогрес</div>
          </div>
        </div>

        {/* Weekly Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Калорії</span>
              <span>{averageProgress.caloriesProgress}%</span>
            </div>
            <Progress 
              value={averageProgress.caloriesProgress} 
              className="h-2"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Білки</span>
              <span>{averageProgress.proteinProgress}%</span>
            </div>
            <Progress 
              value={averageProgress.proteinProgress} 
              className="h-2"
            />
          </div>
        </div>
      </Card>

      {/* Daily Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {days.map((day) => (
          <Card 
            key={day.date}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onDayClick(day.date)}
          >
            <div className="text-center mb-3">
              <div className="text-sm font-medium text-muted-foreground">
                {getDayName(day.date)}
              </div>
              <div className="text-2xl font-bold">
                {getDayNumber(day.date)}
              </div>
            </div>

            {/* Day Status */}
            <div className="flex items-center justify-center mb-3">
              {getStatusIcon(day.status)}
              <span className={`ml-1 text-xs font-medium ${getStatusColor(day.status)}`}>
                {getStatusText(day.status)}
              </span>
            </div>

            {/* Meal Icons */}
            <div className="flex justify-center gap-1 mb-3">
              {getMealIcons(day)}
            </div>

            {/* Daily Nutrition */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>План:</span>
                <span className="font-medium">{day.totalNutrition.planned.calories} ккал</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Факт:</span>
                <span className="font-medium">{day.totalNutrition.actual.calories} ккал</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full">
                <Progress 
                  value={day.progress.caloriesProgress} 
                  className={`h-1 ${getProgressColor(day.progress.caloriesProgress)}`}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-3 gap-1 text-xs text-center">
                <div>
                  <div className="font-medium text-red-500">{day.totalNutrition.planned.protein}г</div>
                  <div className="text-muted-foreground">Б</div>
                </div>
                <div>
                  <div className="font-medium text-yellow-500">{day.totalNutrition.planned.fat}г</div>
                  <div className="text-muted-foreground">Ж</div>
                </div>
                <div>
                  <div className="font-medium text-green-500">{day.totalNutrition.planned.carbs}г</div>
                  <div className="text-muted-foreground">В</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Weekly Summary */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Підсумок тижня
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-500">
              {totalNutrition.planned.calories}
            </div>
            <div className="text-xs text-muted-foreground">Заплановано ккал</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-500">
              {totalNutrition.actual.calories}
            </div>
            <div className="text-xs text-muted-foreground">Спожито ккал</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">
              {Math.round(totalNutrition.planned.protein)}г
            </div>
            <div className="text-xs text-muted-foreground">Білків</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {completedMeals}
            </div>
            <div className="text-xs text-muted-foreground">Завершених прийомів</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
