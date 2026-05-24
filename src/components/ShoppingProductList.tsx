import { CheckCircle, Circle, Trash2, Package, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  isAutoAdded: boolean;
  estimatedPrice?: number;
}

interface ShoppingProductListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export function ShoppingProductList({ items, onToggleItem, onRemoveItem }: ShoppingProductListProps) {
  const priorityColors = {
    low: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const priorityLabels = {
    low: "Низький",
    medium: "Середній",
    high: "Високий"
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {items.map((item, index) => (
        <motion.div key={item.id} variants={itemVariants}>
          <Card className={cn(
            "p-4 bg-card/30 backdrop-blur-sm border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]",
            item.isCompleted 
              ? "opacity-60 bg-muted/30 border-muted/30" 
              : "border-muted/30 hover:border-primary/20"
          )}>
            <div className="flex items-center gap-4">
              <Checkbox
                checked={item.isCompleted}
                onCheckedChange={() => onToggleItem(item.id)}
                className="w-5 h-5"
              />
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium text-base",
                  item.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {item.name}
                </div>
                
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Package className="w-3 h-3" />
                    <span>{item.quantity} {item.unit}</span>
                  </div>
                  
                  {item.estimatedPrice && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span className="font-medium">~{item.estimatedPrice}₴</span>
                    </div>
                  )}
                  
                  {item.isAutoAdded && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                      <Zap className="w-3 h-3 mr-1" />
                      Автоматично
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs border-2", priorityColors[item.priority])}
                >
                  {priorityLabels[item.priority]}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
