import { Flame, Package, Heart, Target, Refrigerator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecipeTabsProps {
  activeTab: "recommended" | "fridge" | "favorites";
  onTabChange: (tab: "recommended" | "fridge" | "favorites") => void;
}

export function RecipeTabs({ activeTab, onTabChange }: RecipeTabsProps) {
  const tabs = [
    {
      key: "recommended" as const,
      label: "Для вас",
      icon: Target,
      color: "text-orange-500"
    },
    {
      key: "fridge" as const,
      label: "З моїх продуктів",
      icon: Refrigerator,
      color: "text-green-500"
    },
    {
      key: "favorites" as const,
      label: "Улюблені",
      icon: Heart,
      color: "text-red-500"
    }
  ];

  return (
    <div className="flex gap-1 p-1 bg-card/30 backdrop-blur-sm rounded-2xl border border-muted/30">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.key;
        
        return (
          <Button
            key={tab.key}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex-1 h-12 flex items-center justify-center gap-2 px-3 rounded-xl",
              "transition-all duration-300 hover:scale-105",
              isActive 
                ? "bg-card/80 text-foreground shadow-lg border border-primary/30 backdrop-blur-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
          >
            <IconComponent className={cn("w-4 h-4", isActive ? tab.color : "")} />
            <span className="text-sm font-medium">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
