import { AlertTriangle, Clock, Utensils, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FridgeRecommendationsProps {
  expiredProducts: any[];
  expiringProducts: any[];
  availableRecipes: any[];
  onViewExpired: () => void;
  onViewExpiring: () => void;
  onViewRecipes: () => void;
}

export function FridgeRecommendations({
  expiredProducts,
  expiringProducts,
  availableRecipes,
  onViewExpired,
  onViewExpiring,
  onViewRecipes
}: FridgeRecommendationsProps) {
  const recommendations = [
    {
      type: "expired",
      title: "Прострочені продукти",
      description: `${expiredProducts.length} продуктів потребують уваги`,
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      bgColor: "from-red-500/10 to-red-600/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-500",
      action: onViewExpired,
      visible: expiredProducts.length > 0
    },
    {
      type: "expiring",
      title: "Скоро зіпсуються",
      description: `${expiringProducts.length} продуктів скоро прострочаться`,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-500/10 to-yellow-600/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-500",
      action: onViewExpiring,
      visible: expiringProducts.length > 0
    },
    {
      type: "recipes",
      title: "Доступні рецепти",
      description: `${availableRecipes.length} рецептів можна приготувати`,
      icon: Utensils,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-600/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-500",
      action: onViewRecipes,
      visible: availableRecipes.length > 0
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className="w-full border-2 hover:bg-muted/50"
                  >
                    Переглянути
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
