import { HugeiconsIcon } from '@hugeicons/react';
import { KitchenUtensilsIcon, DropletIcon, BodyWeightIcon, Add01Icon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";

interface QuickActionsProps {
  onAddFood: () => void;
  onAddWater: () => void;
  onAddWeight: () => void;
}

export function QuickActions({ onAddFood, onAddWater, onAddWeight }: QuickActionsProps) {
  const { t } = useI18n();
  
  const actions = [
    { icon: KitchenUtensilsIcon, label: t("addFood"), onClick: onAddFood, accent: "bg-primary/8 hover:bg-primary/12 text-primary border-primary/15" },
    { icon: DropletIcon, label: t("addWater"), onClick: onAddWater, accent: "bg-secondary/8 hover:bg-secondary/12 text-secondary border-secondary/15" },
    { icon: BodyWeightIcon, label: t("addWeight"), onClick: onAddWeight, accent: "bg-success/8 hover:bg-success/12 text-success border-success/15" },
  ];

  return (
    <Card className="p-5 bg-card border border-border shadow-card rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground">{t("quickActions")}</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className={`h-20 flex flex-col items-center justify-center gap-2.5 rounded-2xl border transition-all duration-200 active:scale-95 ${action.accent}`}
          >
            <HugeiconsIcon icon={action.icon} size={26} strokeWidth={1.5} />
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
      
      {/* Дополнительная кнопка "Добавить" */}
      <Button
        onClick={onAddFood}
        className="w-full mt-4 h-12 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-xl shadow-sm transition-all duration-200"
      >
        <HugeiconsIcon icon={Add01Icon} size={18} className="mr-2" />
        Додати їжу
      </Button>
    </Card>
  );
}
