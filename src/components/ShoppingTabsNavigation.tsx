import { List, Sparkles, Package, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShoppingTabsNavigationProps {
  activeTab: "list" | "auto" | "categories" | "statistics";
  onTabChange: (tab: "list" | "auto" | "categories" | "statistics") => void;
}

export function ShoppingTabsNavigation({ activeTab, onTabChange }: ShoppingTabsNavigationProps) {
  const tabs = [
    {
      key: "list" as const,
      label: "Список",
      icon: List,
      color: "text-blue-500"
    },
    {
      key: "auto" as const,
      label: "Автододавання",
      icon: Sparkles,
      color: "text-purple-500"
    },
    {
      key: "categories" as const,
      label: "Категорії",
      icon: Package,
      color: "text-green-500"
    },
    {
      key: "statistics" as const,
      label: "Статистика",
      icon: BarChart3,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="flex gap-1 p-1 bg-card/30 backdrop-blur-sm rounded-2xl border border-muted/30 mb-6">
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
            <span className="text-sm font-medium hidden sm:inline">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
