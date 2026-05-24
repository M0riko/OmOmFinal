import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionSummaryProps {
  targetCalories: number;
  currentCalories: number;
  targetProtein: number;
  currentProtein: number;
  targetFat: number;
  currentFat: number;
  targetCarbs: number;
  currentCarbs: number;
}

export function NutritionSummary({
  targetCalories,
  currentCalories,
  targetProtein,
  currentProtein,
  targetFat,
  currentFat,
  targetCarbs,
  currentCarbs
}: NutritionSummaryProps) {
  const caloriesProgress = Math.min((currentCalories / targetCalories) * 100, 100);
  const proteinProgress = Math.min((currentProtein / targetProtein) * 100, 100);
  const fatProgress = Math.min((currentFat / targetFat) * 100, 100);
  const carbsProgress = Math.min((currentCarbs / targetCarbs) * 100, 100);

  const remainingCalories = Math.max(0, targetCalories - currentCalories);
  const remainingProtein = Math.max(0, targetProtein - currentProtein);
  const remainingFat = Math.max(0, targetFat - currentFat);
  const remainingCarbs = Math.max(0, targetCarbs - currentCarbs);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 80) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Підсумок дня</h3>
      </div>

      <div className="space-y-4">
        {/* Calories */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm sm:text-base font-medium text-foreground">Калорії</span>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-bold text-orange-400">
                {currentCalories} / {targetCalories}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                ({Math.round(caloriesProgress)}%)
              </span>
            </div>
          </div>
          <Progress 
            value={caloriesProgress} 
            className={cn("h-2 sm:h-2.5", getProgressColor(caloriesProgress))}
          />
          {remainingCalories > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Залишилось: {remainingCalories} ккал до цілі</p>
          )}
          {remainingCalories <= 0 && (
            <p className="text-xs text-green-400 mt-1">Ціль досягнута!</p>
          )}
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Protein */}
          <div className="text-center p-2 sm:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-lg sm:text-2xl font-bold text-blue-400 mb-1">
              {currentProtein}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Білки</div>
            <Progress 
              value={proteinProgress} 
              className="h-1 sm:h-1.5 bg-blue-500/20"
            />
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {remainingProtein > 0 ? `-${remainingProtein}г` : `${Math.round(proteinProgress)}%`}
            </div>
          </div>

          {/* Fat */}
          <div className="text-center p-2 sm:p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="text-lg sm:text-2xl font-bold text-yellow-400 mb-1">
              {currentFat}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Жири</div>
            <Progress 
              value={fatProgress} 
              className="h-1 sm:h-1.5 bg-yellow-500/20"
            />
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {remainingFat > 0 ? `-${remainingFat}г` : `${Math.round(fatProgress)}%`}
            </div>
          </div>

          {/* Carbs */}
          <div className="text-center p-2 sm:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-lg sm:text-2xl font-bold text-green-400 mb-1">
              {currentCarbs}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Вуглеводи</div>
            <Progress 
              value={carbsProgress} 
              className="h-1 sm:h-1.5 bg-green-500/20"
            />
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {remainingCarbs > 0 ? `-${remainingCarbs}г` : `${Math.round(carbsProgress)}%`}
            </div>
          </div>
        </div>

        {/* Balance Info */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>
              Баланс: Білки {Math.round((currentProtein / targetProtein) * 100)}% / 
              Жири {Math.round((currentFat / targetFat) * 100)}% / 
              Вуглеводи {Math.round((currentCarbs / targetCarbs) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

