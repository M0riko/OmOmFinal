import { ArrowLeft, CheckCircle, Circle, Package, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  estimatedPrice?: number;
}

interface ShoppingStoreModeViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onExitStoreMode: () => void;
}

export function ShoppingStoreModeView({ items, onToggleItem, onExitStoreMode }: ShoppingStoreModeViewProps) {
  const completedItems = items.filter(item => item.isCompleted).length;
  const totalItems = items.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const priorityColors = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400"
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onExitStoreMode}
            className="gap-2 border-2 hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Вийти
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Режим магазину</h1>
            <p className="text-sm text-muted-foreground">Покупки в реальному часі</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{completedItems}/{totalItems}</div>
          <div className="text-xs text-muted-foreground">товарів куплено</div>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Прогрес покупок</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "p-4 bg-card/30 backdrop-blur-sm border-2 transition-all duration-300",
              item.isCompleted 
                ? "opacity-60 bg-muted/30 border-green-500/30" 
                : "border-muted/30 hover:border-primary/20 hover:shadow-lg"
            )}>
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={item.isCompleted}
                  onCheckedChange={() => onToggleItem(item.id)}
                  className="w-6 h-6"
                />
                
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-semibold text-lg",
                    item.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {item.name}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>{item.quantity} {item.unit}</span>
                    </div>
                    
                    {item.estimatedPrice && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" />
                        <span className="font-medium">~{item.estimatedPrice}₴</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={cn("text-xs border-2", priorityColors[item.priority])}
                >
                  {item.priority === "high" ? "Важливо" : 
                   item.priority === "medium" ? "Середньо" : "Не терміново"}
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Completion Message */}
      {completedItems === totalItems && totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 shadow-lg">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Вітаємо!</h3>
                <p className="text-muted-foreground">
                  Ви успішно завершили всі покупки!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
