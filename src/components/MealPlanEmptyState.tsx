import { Sparkles, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MealPlanEmptyStateProps {
  onGeneratePlan: () => void;
  onCreatePlan: () => void;
  loading?: boolean;
}

export function MealPlanEmptyState({ 
  onGeneratePlan, 
  onCreatePlan, 
  loading = false 
}: MealPlanEmptyStateProps) {
  return (
    <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-2 border-muted/30 shadow-lg">
      <div className="space-y-6">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-16 h-16 text-primary" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">
            Створіть свій план харчування
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Персоналізований план допоможе вам досягти ваших цілей здоров'я та фітнесу
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onGeneratePlan}
            disabled={loading}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Генерація..." : "Згенерувати план"}
          </Button>
          
          <Button 
            onClick={onCreatePlan}
            variant="outline"
            className="gap-2 border-2 hover:bg-muted/50"
          >
            <Plus className="w-4 h-4" />
            Створити вручну
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Персоналізовано</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Автоматично</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
