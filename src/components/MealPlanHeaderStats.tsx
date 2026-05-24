import { Target, Settings, Sparkles, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MealPlanHeaderStatsProps {
  completionPercentage: number;
  targetCalories: number;
  currentCalories: number;
  targetProtein: number;
  currentProtein: number;
  targetFat: number;
  currentFat: number;
  targetCarbs: number;
  currentCarbs: number;
  onGeneratePlan: () => void;
  onOpenSettings: () => void;
}

export function MealPlanHeaderStats({
  completionPercentage,
  targetCalories,
  currentCalories,
  targetProtein,
  currentProtein,
  targetFat,
  currentFat,
  targetCarbs,
  currentCarbs,
  onGeneratePlan,
  onOpenSettings
}: MealPlanHeaderStatsProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Title Section */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <Utensils className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary flex-shrink-0" />
            <span>План Харчування</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Створюйте персоналізовані плани харчування
          </p>
        </div>
        
        {/* Buttons Section */}
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
          <Button 
            onClick={onOpenSettings}
            variant="outline"
            size="sm"
            className="flex-1 xs:flex-none gap-2 border-2 hover:bg-muted/50 h-10 text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Налаштування</span>
          </Button>
          <Button 
            onClick={onGeneratePlan}
            size="sm"
            className="flex-1 xs:flex-none gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg h-10 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Згенерувати план</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {/* Completion Percentage */}
        <Card className="p-2.5 sm:p-3 md:p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Виконання</span>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-primary">
                {completionPercentage}%
              </div>
              <Progress value={completionPercentage} className="h-1 sm:h-1.5 md:h-2" />
            </div>
          </div>
        </Card>

        {/* Calories */}
        <Card className="p-2.5 sm:p-3 md:p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Калорії</span>
            </div>
            <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-orange-500">
                {currentCalories}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                з {targetCalories}
              </div>
            </div>
          </div>
        </Card>

        {/* Protein */}
        <Card className="p-2.5 sm:p-3 md:p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Білки</span>
            </div>
            <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-blue-500">
                {currentProtein}г
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                з {targetProtein}г
              </div>
            </div>
          </div>
        </Card>

        {/* Fats */}
        <Card className="p-2.5 sm:p-3 md:p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Жири</span>
            </div>
            <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
              <div className="text-base sm:text-lg md:text-2xl font-bold text-yellow-500">
                {currentFat}г
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                з {targetFat}г
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
