import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon, Analytics02Icon, Target02Icon, BookOpen01Icon, Add01Icon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkoutTabsProps {
  activeTab: "calendar" | "analytics" | "goals" | "library" | "constructor";
  onTabChange: (tab: "calendar" | "analytics" | "goals" | "library" | "constructor") => void;
}

export function WorkoutTabs({ activeTab, onTabChange }: WorkoutTabsProps) {
  const tabs = [
    { key: "calendar" as const, label: "Календар", icon: Calendar03Icon },
    { key: "analytics" as const, label: "Аналітика", icon: Analytics02Icon },
    { key: "goals" as const, label: "Цілі", icon: Target02Icon },
    { key: "library" as const, label: "Бібліотека", icon: BookOpen01Icon },
    { key: "constructor" as const, label: "Конструктор", icon: Add01Icon },
  ];

  return (
    <div className="flex gap-1 p-1.5 bg-muted/50 rounded-2xl border border-border mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        
        return (
          <Button
            key={tab.key}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex-1 h-11 flex items-center justify-center gap-2 px-2 rounded-xl",
              "transition-all duration-200",
              isActive 
                ? "bg-card text-foreground shadow-sm border border-border" 
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
          >
            <HugeiconsIcon icon={tab.icon} size={18} strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-sm font-medium hidden lg:inline">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
