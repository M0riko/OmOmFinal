import { Calendar, Target, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DayPlan {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  progress: number;
  mealCount: number;
}

interface MealPlanGridProps {
  weeklyPlan: DayPlan[];
  onDayClick: (date: string) => void;
  onViewDetails: (date: string) => void;
}

export function MealPlanGrid({ weeklyPlan, onDayClick, onViewDetails }: MealPlanGridProps) {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 80) return "bg-blue-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getProgressIntensity = (progress: number) => {
    if (progress >= 100) return "opacity-100";
    if (progress >= 80) return "opacity-90";
    if (progress >= 60) return "opacity-70";
    if (progress >= 40) return "opacity-50";
    return "opacity-30";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground">План на тиждень</h3>
      </div>

      {/* Mobile: Horizontal scroll, Desktop: Grid */}
      <div className="md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 md:gap-4">
        {/* Mobile scroll container */}
        <div className="flex md:contents gap-3 md:gap-0 overflow-x-auto pb-2 md:pb-0 scrollbar-hide snap-x snap-mandatory md:snap-none">
          {weeklyPlan.map((day, index) => {
            const dayName = days[index];
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <Card 
                key={day.date}
                className={cn(
                  "p-3 sm:p-4 bg-card/30 backdrop-blur-sm border border-muted/30 hover:shadow-lg transition-all duration-300 md:hover:scale-105 cursor-pointer group",
                  "min-w-[140px] sm:min-w-[160px] md:min-w-0 snap-start flex-shrink-0 md:flex-shrink",
                  isToday && "ring-2 ring-primary/50 bg-primary/5 border-primary/30"
                )}
                onClick={() => onDayClick(day.date)}
              >
                <div className="space-y-2 sm:space-y-3">
                  {/* Day Header */}
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{dayName}</div>
                    <div className={cn(
                      "text-base sm:text-lg font-bold",
                      isToday ? "text-primary" : "text-foreground"
                    )}>
                      {new Date(day.date).getDate()}
                    </div>
                  </div>

                  {/* Calories */}
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-orange-500 mb-0.5 sm:mb-1">
                      {day.calories}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">ккал</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          getProgressColor(day.progress),
                          getProgressIntensity(day.progress)
                        )}
                        style={{ width: `${Math.min(day.progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-center text-muted-foreground">
                      {day.progress}%
                    </div>
                  </div>

                  {/* Meal Count */}
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">
                      {day.mealCount} страв
                    </Badge>
                  </div>

                  {/* Details Button - visible on mobile, hover on desktop */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs sm:text-sm h-8 sm:h-9 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 border-2 hover:bg-muted/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(day.date);
                    }}
                  >
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                    Деталі
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Weekly Summary */}
      <Card className="p-3 sm:p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h4 className="text-sm sm:text-base font-semibold text-foreground">Підсумок тижня</h4>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-500">
              {Math.round(weeklyPlan.reduce((sum, day) => sum + day.calories, 0) / 7)}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Середні ккал/день</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-500">
              {Math.round(weeklyPlan.reduce((sum, day) => sum + day.protein, 0) / 7)}г
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Середні білки/день</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-500">
              {Math.round(weeklyPlan.reduce((sum, day) => sum + day.progress, 0) / 7)}%
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Середній прогрес</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-500">
              {weeklyPlan.reduce((sum, day) => sum + day.mealCount, 0)}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Всього страв</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
