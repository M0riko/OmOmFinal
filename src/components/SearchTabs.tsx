import { Search, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchTabsProps {
  activeTab: "search" | "quick" | "custom";
  onTabChange: (tab: "search" | "quick" | "custom") => void;
}

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  const tabs = [
    {
      key: "search" as const,
      label: "Пошук продукту",
      icon: Search,
      description: "FatSecret API",
      color: "text-blue-500"
    },
    {
      key: "quick" as const,
      label: "Швидке додавання",
      icon: Zap,
      description: "Популярні продукти",
      color: "text-orange-500"
    },
    {
      key: "custom" as const,
      label: "Мої продукти",
      icon: Package,
      description: "Власні продукти",
      color: "text-green-500"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-muted/20 rounded-2xl">
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
                "flex-1 h-12 flex flex-col items-center justify-center gap-1 px-3 rounded-xl",
                "transition-all duration-300 hover:scale-105",
                isActive 
                  ? "bg-background text-foreground shadow-lg border border-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <IconComponent className={cn("w-4 h-4", isActive ? tab.color : "")} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Tab Description */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {tabs.find(tab => tab.key === activeTab)?.description}
        </p>
      </div>
    </div>
  );
}
