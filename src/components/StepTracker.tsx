import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDaily } from "@/hooks/useDaily";
import { Footprints, Plus } from "lucide-react";
import { toast } from "sonner";

export function StepTracker() {
  const { totals, updateStats } = useDaily();
  const [stepsToAdd, setStepsToAdd] = useState("");
  const goal = 10000;
  const currentSteps = totals.steps || 0;
  const progress = Math.min((currentSteps / goal) * 100, 100);

  const handleAddSteps = () => {
    const num = parseInt(stepsToAdd);
    if (!isNaN(num) && num > 0) {
      updateStats({ steps: currentSteps + num });
      setStepsToAdd("");
      toast.success(`Додано ${num} кроків`);
    }
  };

  return (
    <Card className="p-5 bg-card border border-border shadow-card rounded-2xl hover:shadow-elevated transition-all duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Footprints className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">Кроки</h4>
            <p className="text-sm text-muted-foreground truncate">
              {currentSteps.toLocaleString()} / {goal.toLocaleString()}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs rounded-full px-2 flex-shrink-0 ml-2">
          {Math.round(progress)}%
        </Badge>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2.5 mb-4 mt-auto">
        <div 
          className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Input 
          type="number" 
          placeholder="+ кроки" 
          value={stepsToAdd}
          onChange={(e) => setStepsToAdd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSteps()}
          className="h-8 text-xs bg-muted/50 border-border/50 focus-visible:ring-emerald-500/50"
        />
        <Button 
          size="sm" 
          onClick={handleAddSteps} 
          className="h-8 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" /> Дод.
        </Button>
      </div>
    </Card>
  );
}
