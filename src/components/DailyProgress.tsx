import { ProgressRing } from "@/components/ProgressRing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDaily } from "@/hooks/useDaily";
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkBadge01Icon } from '@hugeicons/core-free-icons';

export function DailyProgress() {
  const { user } = useAuth();
  const { totals } = useDaily();
  
  const targetCalories = user?.targets?.calories || 2000;
  const progress = targetCalories ? (totals.calories / targetCalories) * 100 : 0;
  
  const macros = {
    protein: { current: totals.protein, target: user?.targets?.protein || 120 },
    fats: { current: totals.fats, target: user?.targets?.fats || 65 },
    carbs: { current: totals.carbs, target: user?.targets?.carbs || 250 },
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "success";
    if (progress >= 80) return "primary";
    return "warning";
  };
  
  const getRemainingCalories = () => {
    const remaining = targetCalories - totals.calories;
    return remaining > 0 ? remaining : 0;
  };
  
  return (
    <Card className="p-6 md:p-8 bg-card border border-border shadow-card rounded-2xl">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Круговой индикатор калорий */}
        <div className="flex-shrink-0">
          <ProgressRing 
            progress={Math.min(progress, 100)} 
            size="lg" 
            color={getProgressColor(progress)}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground tracking-tight">
                {Math.round(Math.min(progress, 100))}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">виконано</div>
            </div>
          </ProgressRing>
        </div>
        
        {/* Информация о калориях */}
        <div className="flex-1 text-center md:text-left">
          <div className="mb-5">
            <div className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-1">
              {totals.calories}
              <span className="text-lg text-muted-foreground font-normal ml-2">/ {targetCalories}</span>
            </div>
            <p className="text-muted-foreground text-sm">ккал сьогодні</p>
          </div>
          
          {/* Оставшиеся калории */}
          <div className="mb-5">
            {getRemainingCalories() > 0 ? (
              <Badge variant="outline" className="text-sm px-4 py-1.5 rounded-full">
                Залишилось: {getRemainingCalories()} ккал
              </Badge>
            ) : (
              <Badge className="bg-success/10 text-success border border-success/20 text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 w-fit mx-auto md:mx-0">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} />
                Мета досягнута!
              </Badge>
            )}
          </div>
          
          {/* БЖУ в одной строке */}
          <div className="flex flex-wrap justify-center md:justify-start gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-muted-foreground">Б:</span>
              <span className="font-semibold">{macros.protein.current}г</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-muted-foreground">Ж:</span>
              <span className="font-semibold">{macros.fats.current}г</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-muted-foreground">В:</span>
              <span className="font-semibold">{macros.carbs.current}г</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
