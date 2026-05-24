import { Package, CheckCircle, Target, Star, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ShoppingSummaryCardsProps {
  totalItems: number;
  completedItems: number;
  remainingItems: number;
  estimatedCost: number;
  onCardClick?: (type: "total" | "completed" | "remaining" | "cost") => void;
}

export function ShoppingSummaryCards({
  totalItems,
  completedItems,
  remainingItems,
  estimatedCost,
  onCardClick
}: ShoppingSummaryCardsProps) {
  const cards = [
    {
      type: "total" as const,
      title: "Всього товарів",
      value: totalItems,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    },
    {
      type: "completed" as const,
      title: "Завершено",
      value: completedItems,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      type: "remaining" as const,
      title: "Залишилось",
      value: remainingItems,
      icon: Target,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      type: "cost" as const,
      title: "Орієнтовна вартість",
      value: `${estimatedCost}₴`,
      icon: Star,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        
        return (
          <Card
            key={card.type}
            className={cn(
              "p-4 bg-card/30 backdrop-blur-sm border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg",
              card.borderColor
            )}
            onClick={() => onCardClick?.(card.type)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className={cn("text-2xl font-bold", card.color)}>
                  {card.value}
                </p>
              </div>
              <div className={cn("p-3 rounded-xl", card.bgColor)}>
                <IconComponent className={cn("w-5 h-5", card.color)} />
              </div>
            </div>
            
            {/* Progress indicator for completion */}
            {card.type === "completed" && totalItems > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Прогрес</span>
                  <span>{Math.round((completedItems / totalItems) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(completedItems / totalItems) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
