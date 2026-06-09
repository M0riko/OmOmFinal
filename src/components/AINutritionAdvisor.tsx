import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Sparkles, 
  Loader2, 
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Heart,
  Copy,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { getOpenAIService, NutritionAdviceRequest, NutritionAdvice } from "@/lib/openai-ai";
import { useDaily } from "@/hooks/useDaily";
import { useAuth } from "@/hooks/useAuth";

interface AINutritionAdvisorProps {
  onAdviceGenerated?: (advice: NutritionAdvice) => void;
}

export function AINutritionAdvisor({ onAdviceGenerated }: AINutritionAdvisorProps) {
  const { entries, totals } = useDaily();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [advice, setAdvice] = useState<NutritionAdvice | null>(null);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  const goalOptions = [
    "Похудение",
    "Набор мышечной массы",
    "Поддержание веса",
    "Улучшение здоровья",
    "Повышение энергии",
    "Улучшение спортивных результатов",
    "Снижение холестерина",
    "Контроль сахара в крови"
  ];

  const restrictionOptions = [
    "Без глютена",
    "Без лактозы",
    "Вегетарианство",
    "Веганство",
    "Кето диета",
    "Палео диета",
    "Низкоуглеводная диета",
    "Высокобелковая диета",
    "Средиземноморская диета"
  ];

  const targetCalories = user?.targets?.calories || 2000;
  const targetProtein = user?.targets?.protein || 150;
  const targetFat = user?.targets?.fats || 65;
  const targetCarbs = user?.targets?.carbs || 250;

  const handleGoalToggle = (goal: string) => {
    setUserGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleRestrictionToggle = (restriction: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const generateAdvice = async () => {
    if (userGoals.length === 0) {
      toast.error("Выберите хотя бы одну цель");
      return;
    }

    setIsGenerating(true);
    try {
      const openaiService = getOpenAIService();
      
      // Get recent meals (last 3 meals)
      const recentMeals = entries.slice(-3).map(entry => ({
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        fat: entry.fats,
        carbs: entry.carbs,
        mealType: entry.mealType || 'snack'
      }));

      const request: NutritionAdviceRequest = {
        dailyNutrition: {
          calories: totals.calories,
          protein: totals.protein,
          fat: totals.fats,
          carbs: totals.carbs
        },
        targetNutrition: {
          calories: targetCalories,
          protein: targetProtein,
          fat: targetFat,
          carbs: targetCarbs
        },
        recentMeals,
        userGoals,
        dietaryRestrictions
      };

      const nutritionAdvice = await openaiService.getNutritionAdvice(request);
      setAdvice(nutritionAdvice);
      onAdviceGenerated?.(nutritionAdvice);
      toast.success("Персональные советы готовы!");
    } catch (error) {
      console.error("Error generating nutrition advice:", error);
      toast.error("Ошибка при генерации советов. Попробуйте еще раз.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAdvice = () => {
    if (!advice) return;
    
    const adviceText = `
Персональные советы по питанию

Резюме дня: ${advice.summary}

Рекомендации:
${advice.recommendations.map(rec => `• ${rec}`).join('\n')}

${advice.warnings.length > 0 ? `Предупреждения:\n${advice.warnings.map(warn => `• ${warn}`).join('\n')}\n` : ''}

Мотивационное сообщение: ${advice.motivationalMessage}

Предложения на следующий прием пищи:
${advice.nextMealSuggestions.map(suggestion => `• ${suggestion}`).join('\n')}

Оптимизация макронутриентов:
• Белки: ${advice.macroOptimization.protein}
• Углеводы: ${advice.macroOptimization.carbs}
• Жиры: ${advice.macroOptimization.fats}
`;

    navigator.clipboard.writeText(adviceText);
    toast.success("Советы скопированы в буфер обмена!");
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-blue-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressIcon = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (percentage >= 80) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    if (percentage >= 60) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* AI Nutrition Advisor Card */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-orange-900">AI Консультант по Питанию</h3>
            <p className="text-sm text-orange-700">
              Получайте персональные советы на основе вашего рациона
            </p>
          </div>
        </div>

        {/* Current Nutrition Status */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Текущее состояние питания
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Калории</span>
                {getProgressIcon(totals.calories, targetCalories)}
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{totals.calories}</div>
                <div className="text-xs text-muted-foreground">/ {targetCalories}</div>
              </div>
              <Progress 
                value={(totals.calories / targetCalories) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Белки</span>
                {getProgressIcon(totals.protein, targetProtein)}
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{totals.protein}г</div>
                <div className="text-xs text-muted-foreground">/ {targetProtein}г</div>
              </div>
              <Progress 
                value={(totals.protein / targetProtein) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Жиры</span>
                {getProgressIcon(totals.fats, targetFat)}
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{totals.fats}г</div>
                <div className="text-xs text-muted-foreground">/ {targetFat}г</div>
              </div>
              <Progress 
                value={(totals.fats / targetFat) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Углеводы</span>
                {getProgressIcon(totals.carbs, targetCarbs)}
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{totals.carbs}г</div>
                <div className="text-xs text-muted-foreground">/ {targetCarbs}г</div>
              </div>
              <Progress 
                value={(totals.carbs / targetCarbs) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Goals Selection */}
        <div className="mb-4">
          <h4 className="font-semibold mb-3">Ваши цели</h4>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map(goal => (
              <Badge
                key={goal}
                variant={userGoals.includes(goal) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleGoalToggle(goal)}
              >
                {goal}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Диетические ограничения</h4>
          <div className="flex flex-wrap gap-2">
            {restrictionOptions.map(restriction => (
              <Badge
                key={restriction}
                variant={dietaryRestrictions.includes(restriction) ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => handleRestrictionToggle(restriction)}
              >
                {restriction}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={generateAdvice}
          disabled={isGenerating || userGoals.length === 0}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Анализируем ваш рацион...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Получить персональные советы
            </>
          )}
        </Button>
      </Card>

      {/* Advice Results */}
      {advice && (
        <Card className="p-6 border-2 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-900">Персональные советы</h3>
                <p className="text-sm text-orange-700">На основе вашего рациона и целей</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={copyAdvice}>
              <Copy className="w-4 h-4 mr-2" />
              Копировать
            </Button>
          </div>

          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Резюме дня
              </h4>
              <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg">
                {advice.summary}
              </p>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Рекомендации
              </h4>
              <div className="space-y-2">
                {advice.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {advice.warnings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Предупреждения
                </h4>
                <div className="space-y-2">
                  {advice.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-700">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Motivational Message */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Мотивационное сообщение
              </h4>
              <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-900">{advice.motivationalMessage}</p>
              </div>
            </div>

            {/* Next Meal Suggestions */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Предложения на следующий прием пищи
              </h4>
              <div className="space-y-2">
                {advice.nextMealSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Optimization */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Оптимизация макронутриентов
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <h5 className="font-medium text-sm mb-1 text-blue-600">Белки</h5>
                  <p className="text-xs text-muted-foreground">{advice.macroOptimization.protein}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <h5 className="font-medium text-sm mb-1 text-green-600">Углеводы</h5>
                  <p className="text-xs text-muted-foreground">{advice.macroOptimization.carbs}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <h5 className="font-medium text-sm mb-1 text-yellow-600">Жиры</h5>
                  <p className="text-xs text-muted-foreground">{advice.macroOptimization.fats}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

