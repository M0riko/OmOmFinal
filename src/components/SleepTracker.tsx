import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDaily } from "@/hooks/useDaily";
import { Moon, Plus } from "lucide-react";
import { toast } from "sonner";

export function SleepTracker() {
  const { totals, updateStats } = useDaily();
  const [hoursToAdd, setHoursToAdd] = useState("");
  const goal = 8;
  const currentSleep = totals.sleepHours || 0;
  const progress = Math.min((currentSleep / goal) * 100, 100);

  const handleAddSleep = () => {
    const num = parseFloat(hoursToAdd);
    if (!isNaN(num) && num > 0) {
      updateStats({ sleepHours: currentSleep + num });
      setHoursToAdd("");
      toast.success(`Додано ${num} год сну`);
    }
  };

  return (
    <Card className="p-5 bg-card border border-border shadow-card rounded-2xl hover:shadow-elevated transition-all duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Moon className="w-6 h-6 text-purple-500" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">Сон</h4>
            <p className="text-sm text-muted-foreground truncate">
              {currentSleep} / {goal} год
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs rounded-full px-2 flex-shrink-0 ml-2">
          {Math.round(progress)}%
        </Badge>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2.5 mb-4 mt-auto">
        <div 
          className="h-2.5 rounded-full bg-purple-500 transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Input 
          type="number" 
          step="0.5"
          placeholder="+ години" 
          value={hoursToAdd}
          onChange={(e) => setHoursToAdd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSleep()}
          className="h-8 text-xs bg-muted/50 border-border/50 focus-visible:ring-purple-500/50"
        />
        <Button 
          size="sm" 
          onClick={handleAddSleep} 
          className="h-8 px-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" /> Дод.
        </Button>
      </div>
    </Card>
  );
}
