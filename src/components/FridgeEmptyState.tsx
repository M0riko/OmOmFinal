import { Snowflake, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FridgeEmptyStateProps {
  isPantry?: boolean;
  onAddProduct: () => void;
}

export function FridgeEmptyState({ isPantry = false, onAddProduct }: FridgeEmptyStateProps) {
  return (
    <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-2 border-muted/30 shadow-lg">
      <div className="space-y-6">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Snowflake className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">
            {isPantry ? "Кладовка порожня" : "Холодильник порожній"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isPantry 
              ? "Додайте продукти до кладовки для довготривалого зберігання"
              : "Додайте продукти до холодильника, щоб почати керувати ними"
            }
          </p>
        </div>
        <Button 
          onClick={onAddProduct}
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Додати перший продукт
        </Button>
      </div>
    </Card>
  );
}
