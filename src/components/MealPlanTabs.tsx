import { Calendar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MealPlanTabsProps {
  activeTab: "weekly" | "daily";
  onTabChange: (tab: "weekly" | "daily") => void;
}

export function MealPlanTabs({ activeTab, onTabChange }: MealPlanTabsProps) {
  const tabs = [
    {
      key: "weekly" as const,
      label: "Тижневий план",
      icon: Calendar,
      color: "text-blue-500"
    },
    {
      key: "daily" as const,
      label: "Денний план",
      icon: Sun,
      color: "text-orange-500"
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
              "flex-1 h-10 md:h-12 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-3 rounded-xl",
              "transition-all duration-300 hover:scale-105",
              isActive 
                ? "bg-card/80 text-foreground shadow-lg border border-primary/30 backdrop-blur-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
          >
            <IconComponent className={cn("w-4 h-4", isActive ? tab.color : "")} />
            <span className="text-xs md:text-sm font-medium hidden sm:inline">{tab.label}</span>
            <span className="text-xs font-medium sm:hidden">{tab.label.split(' ')[0]}</span>
          </Button>
        );
      })}
    </div>
  );
}
