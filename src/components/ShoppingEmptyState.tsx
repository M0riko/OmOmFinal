import { ShoppingCart, Plus, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ShoppingEmptyStateProps {
  onAddProduct: () => void;
  onAutoAdd: () => void;
}

export function ShoppingEmptyState({ onAddProduct, onAutoAdd }: ShoppingEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-2 border-muted/30 shadow-lg">
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Список покупок порожній
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Почніть додавати товари до свого списку покупок або використайте розумне автододавання
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={onAddProduct}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Додати товар
            </Button>
            
            <Button 
              onClick={onAutoAdd}
              variant="outline"
              className="gap-2 border-2 hover:bg-muted/50"
            >
              <Sparkles className="w-4 h-4" />
              Автододавання
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Розумні пропозиції</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Автоматично</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
