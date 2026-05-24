import { Utensils, TrendingUp, Target, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MealPlanRecommendationsProps {
  hasPlan: boolean;
  completionPercentage: number;
  onViewRecipes: () => void;
  onGeneratePlan: () => void;
}

export function MealPlanRecommendations({
  hasPlan,
  completionPercentage,
  onViewRecipes,
  onGeneratePlan
}: MealPlanRecommendationsProps) {
  const recommendations = [
    {
      type: "recipes",
      title: "На основі ваших цілей",
      description: "Персоналізовані рецепти для досягнення ваших цілей",
      icon: Utensils,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/30",
      action: onViewRecipes,
      visible: true
    },
    {
      type: "progress",
      title: "Покращте свій план",
      description: "Додайте більше страв для повного виконання плану",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/30",
      action: onGeneratePlan,
      visible: hasPlan && completionPercentage < 80
    },
    {
      type: "goals",
      title: "Досягніть своїх цілей",
      description: "Створіть план, який допоможе досягти ваших цілей",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/30",
      action: onGeneratePlan,
      visible: !hasPlan
    }
  ];

  const visibleRecommendations = recommendations.filter(rec => rec.visible);

  if (visibleRecommendations.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Рекомендації</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleRecommendations.map((rec) => {
            const IconComponent = rec.icon;
            
            return (
              <Card 
                key={rec.type}
                className={cn(
                  "p-4 bg-gradient-to-br cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg",
                  rec.bgColor,
                  rec.borderColor,
                  "border-2"
                )}
                onClick={rec.action}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg",
                      rec.color
                    )}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full border-2 hover:bg-muted/50 group"
                  >
                    <span>Переглянути рецепти</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
