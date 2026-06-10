import { HugeiconsIcon } from '@hugeicons/react';
import { BodyWeightIcon, Target02Icon } from '@hugeicons/core-free-icons';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWeight } from "@/hooks/useWeight";
import { useAuth } from "@/hooks/useAuth";

interface WeightTrackerWidgetProps {
  onAddWeight: () => void;
}

export function WeightTrackerWidget({ onAddWeight }: WeightTrackerWidgetProps) {
  const { currentWeight: trackedWeight, getWeightTrend } = useWeight();
  const { user } = useAuth();
  
  const currentWeight = trackedWeight || user?.weight || 0;
  const targetWeight = user?.targetWeight || currentWeight;
  const trend = getWeightTrend() || 0;
  
  const diff = Math.abs(currentWeight - targetWeight).toFixed(1);
  const isGoalReached = currentWeight === targetWeight;

  return (
    <Card className="p-5 bg-card border border-border shadow-card rounded-2xl hover:shadow-elevated transition-all duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={BodyWeightIcon} size={24} className="text-blue-500" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">Вага</h4>
            <p className="text-sm text-muted-foreground truncate">
              {currentWeight} кг / {targetWeight} кг
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs rounded-full px-2 flex-shrink-0 ml-2">
          {isGoalReached ? "Ціль!" : `${diff} кг до цілі`}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate max-w-full">
            {trend < 0 ? `Зниження: ${trend.toFixed(1)} кг` : trend > 0 ? `Набір: +${trend.toFixed(1)} кг` : "Без змін"}
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-8 px-2 rounded-full flex-shrink-0"
          onClick={onAddWeight}
        >
          <HugeiconsIcon icon={Target02Icon} size={14} className="mr-1" />
          Оновити
        </Button>
      </div>
    </Card>
  );
}
