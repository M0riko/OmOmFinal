import { Plus, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FridgeHeaderBarProps {
  expiredCount: number;
  expiringCount: number;
  onAddProduct: () => void;
}

export function FridgeHeaderBar({ expiredCount, expiringCount, onAddProduct }: FridgeHeaderBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3">
          <Snowflake className="w-8 h-8 text-primary" />
          Умний Холодильник
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Керуйте продуктами та знаходьте рецепти
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {expiredCount > 0 && (
          <Badge variant="destructive" className="gap-1 px-3 py-1">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            {expiredCount} прострочено
          </Badge>
        )}
        {expiringCount > 0 && (
          <Badge variant="warning" className="gap-1 px-3 py-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
            {expiringCount} скоро
          </Badge>
        )}
        <Button 
          onClick={onAddProduct} 
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Додати продукт</span>
          <span className="sm:hidden">Додати</span>
        </Button>
      </div>
    </div>
  );
}
