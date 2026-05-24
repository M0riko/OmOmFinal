import { Package, AlertTriangle, Clock, Archive } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FridgeStatCardsProps {
  totalProducts: number;
  expiredCount: number;
  expiringCount: number;
  pantryCount: number;
  onCardClick?: (type: "total" | "expired" | "expiring" | "pantry") => void;
}

export function FridgeStatCards({ 
  totalProducts, 
  expiredCount, 
  expiringCount, 
  pantryCount,
  onCardClick 
}: FridgeStatCardsProps) {
  const stats = [
    {
      type: "total" as const,
      label: "Продуктів",
      value: totalProducts,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/10 to-blue-600/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-500"
    },
    {
      type: "expired" as const,
      label: "Прострочено",
      value: expiredCount,
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      bgColor: "from-red-500/10 to-red-600/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-500"
    },
    {
      type: "expiring" as const,
      label: "Скоро",
      value: expiringCount,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-500/10 to-yellow-600/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-500"
    },
    {
      type: "pantry" as const,
      label: "У кладовці",
      value: pantryCount,
      icon: Archive,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-600/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        
        return (
          <Card 
            key={stat.type}
            className={cn(
              "p-4 bg-gradient-to-br cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg",
              stat.bgColor,
              stat.borderColor,
              "border-2"
            )}
            onClick={() => onCardClick?.(stat.type)}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg",
                stat.color
              )}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className={cn("text-2xl font-bold", stat.textColor)}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
