import { Store, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShoppingHeaderBarProps {
  onStoreMode: () => void;
}

export function ShoppingHeaderBar({ onStoreMode }: ShoppingHeaderBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          Список покупок
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Розумний помічник для ваших покупок
        </p>
      </div>
      
      <Button 
        onClick={onStoreMode}
        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
      >
        <Store className="w-4 h-4" />
        <span className="hidden sm:inline">Режим магазину</span>
        <span className="sm:hidden">Магазин</span>
      </Button>
    </div>
  );
}
