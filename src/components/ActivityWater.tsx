import { HugeiconsIcon } from '@hugeicons/react';
import { DropletIcon, Activity01Icon, Target02Icon, ChartIncreaseIcon } from '@hugeicons/core-free-icons';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { useWater } from "@/hooks/useWater";
import { useWorkouts } from "@/hooks/useWorkouts";
import { toast } from "sonner";

interface ActivityWaterProps {
  waterGoal?: number;
  waterConsumed?: number;
  steps?: number;
  stepsGoal?: number;
  caloriesBurned?: number;
}

export function ActivityWater({ 
  waterGoal: propWaterGoal, 
  waterConsumed: propWaterConsumed,
  steps = 0,
  stepsGoal = 10000,
  caloriesBurned: propCaloriesBurned
}: ActivityWaterProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { todayWater, waterGoal: contextWaterGoal, addWater } = useWater();
  const { completedWorkouts } = useWorkouts();
  
  const waterGoal = propWaterGoal ?? contextWaterGoal;
  const waterConsumed = propWaterConsumed ?? todayWater;
  
  const caloriesBurned = propCaloriesBurned ?? completedWorkouts.reduce((sum, workout) => {
    return sum + ((workout.duration || 0) * 5); // Estimation: ~5 kcal per minute
  }, 0);
  
  const waterProgress = (waterConsumed / waterGoal) * 100;
  const stepsProgress = (steps / stepsGoal) * 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Вода */}
      <Card className="p-5 bg-card border border-border shadow-card rounded-2xl hover:shadow-elevated transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <HugeiconsIcon icon={DropletIcon} size={24} className="text-secondary" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{t("water")}</h4>
              <p className="text-sm text-muted-foreground">
                {waterConsumed}л / {waterGoal}л
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs rounded-full px-3">
            {Math.round(waterProgress)}%
          </Badge>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
          <div 
            className="h-2.5 rounded-full bg-secondary transition-all duration-500"
            style={{ width: `${Math.min(waterProgress, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {waterProgress >= 100 ? t("achieved") : waterProgress >= 50 ? "Добре йде!" : "Потрібно більше"}
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-8 px-3 rounded-full"
            onClick={() => {
              addWater(0.25);
              toast.success("Додано 250мл води");
            }}
          >
            +250мл
          </Button>
        </div>
      </Card>
      
      {/* Активність */}
      <Card className="p-5 bg-card border border-border shadow-card rounded-2xl hover:shadow-elevated transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <HugeiconsIcon icon={Activity01Icon} size={24} className="text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{t("activity")}</h4>
              <p className="text-sm text-muted-foreground">
                {steps.toLocaleString()} / {stepsGoal.toLocaleString()} {t("steps")}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs rounded-full px-3">
            {Math.round(stepsProgress)}%
          </Badge>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
          <div 
            className="h-2.5 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(stepsProgress, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {stepsProgress >= 100 ? "Відмінно!" : stepsProgress >= 50 ? "Добре йде!" : "Потрібно рухатись"}
            </p>
            {caloriesBurned > 0 && (
              <Badge variant="outline" className="text-xs rounded-full">
                <HugeiconsIcon icon={Target02Icon} size={12} className="mr-1" />
                {caloriesBurned} ккал
              </Badge>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-8 px-3 rounded-full"
            onClick={() => navigate("/training")}
          >
            <HugeiconsIcon icon={ChartIncreaseIcon} size={14} className="mr-1" />
            Тренування
          </Button>
        </div>
      </Card>
    </div>
  );
}
