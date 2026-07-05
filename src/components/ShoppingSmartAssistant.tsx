import { Lightbulb, Refrigerator, Utensils, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ShoppingSmartAssistantProps {
  fridgeItems?: number;
  expiringItems?: number;
  recipeSuggestions?: number;
  onViewFridge: () => void;
  onViewRecipes: () => void;
  onAutoAdd: () => void;
}

export function ShoppingSmartAssistant({
  fridgeItems = 0,
  expiringItems = 0,
  recipeSuggestions = 0,
  onViewFridge,
  onViewRecipes,
  onAutoAdd
}: ShoppingSmartAssistantProps) {
  const recommendations = [
    {
      type: "fridge",
      title: "На основі холодильника",
      description: `У вас ${fridgeItems} продуктів, ${expiringItems} скоро зіпсуються`,
      icon: Refrigerator,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/30",
      action: onViewFridge,
      visible: fridgeItems > 0
    },
    {
      type: "recipes",
      title: "Рецепти та плани",
      description: `${recipeSuggestions} рецептів доступні з вашими продуктами`,
      icon: Utensils,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/30",
      action: onViewRecipes,
      visible: recipeSuggestions > 0
    },
    {
      type: "auto",
      title: "Розумне автододавання",
      description: "Дозвольте AmAm автоматично додавати товари на основі ваших звичок",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/30",
      action: onAutoAdd,
      visible: true
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
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Розумний помічник</h3>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            AI
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleRecommendations.map((rec) => {
            const IconComponent = rec.icon;
            
            return (
              <motion.div
                key={rec.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
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
                        <h4 className="font-semibold text-foreground text-sm">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full border-2 hover:bg-muted/50 group"
                    >
                      <span className="text-xs">Переглянути</span>
                      <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
