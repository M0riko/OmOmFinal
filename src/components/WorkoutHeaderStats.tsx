import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Activity01Icon, Dumbbell03Icon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WorkoutHeaderStatsProps {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  weeklyGoal: number;
  onAddWorkout: () => void;
  isLiveMode?: boolean;
}

export function WorkoutHeaderStats({
  totalWorkouts,
  thisWeekWorkouts,
  weeklyGoal,
  onAddWorkout,
  isLiveMode = false
}: WorkoutHeaderStatsProps) {
  const weeklyProgress = weeklyGoal > 0 ? (thisWeekWorkouts / weeklyGoal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <HugeiconsIcon icon={Dumbbell03Icon} size={26} className="text-primary" />
            </div>
            Тренування
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Плануйте, виконуйте та аналізуйте свої тренування
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isLiveMode && (
            <Card className="p-3 bg-primary/5 border-primary/15 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live режим</span>
              </div>
            </Card>
          )}
          <Button 
            onClick={onAddWorkout}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm h-11"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} />
            <span className="hidden sm:inline">+ Додати тренування</span>
            <span className="sm:hidden">+ Додати</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-5 bg-card border border-border shadow-card rounded-2xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Activity01Icon} size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Прогрес цього тижня</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {thisWeekWorkouts} / {weeklyGoal} тренувань
            </span>
          </div>
          <Progress value={weeklyProgress} className="h-2.5" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span className="font-medium">{Math.round(weeklyProgress)}%</span>
            <span>{weeklyGoal}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
