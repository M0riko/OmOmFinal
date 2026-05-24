import { CheckCircle, ShoppingCart, Trash2, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getExpiryStatus } from "@/lib/smart-fridge";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  quantity: { amount: number; unit: string };
  expiryDate?: string;
  isInPantry: boolean;
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

interface FridgeProductGridProps {
  products: Product[];
  onProductUsed: (productId: string) => void;
  onAddToShoppingList: (product: Product) => void;
  onRemoveProduct: (productId: string) => void;
}

export function FridgeProductGrid({ 
  products, 
  onProductUsed, 
  onAddToShoppingList, 
  onRemoveProduct 
}: FridgeProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => {
        const expiryStatus = getExpiryStatus(product.expiryDate);
        
        return (
          <Card 
            key={product.id} 
            className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
          >
            <div className="space-y-3">
              {/* Header with name and status */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h4>
                  {product.brand && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {product.brand}
                    </Badge>
                  )}
                </div>
                {expiryStatus && (
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    expiryStatus.status === "expired" ? "bg-red-500" :
                    expiryStatus.status === "expiring" ? "bg-yellow-500" :
                    "bg-green-500"
                  )} />
                )}
              </div>

              {/* Category and quantity */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                <span>{product.category}</span>
                <span>•</span>
                <span>{product.quantity.amount} {product.quantity.unit}</span>
              </div>

              {/* Expiry date */}
              {product.expiryDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Термін: {new Date(product.expiryDate).toLocaleDateString()}
                  </span>
                  {expiryStatus && (
                    <Badge 
                      variant={expiryStatus.status === "expired" ? "destructive" : 
                              expiryStatus.status === "expiring" ? "warning" : "secondary"}
                      className="text-xs"
                    >
                      {expiryStatus.text}
                    </Badge>
                  )}
                </div>
              )}

              {/* Nutrition info */}
              {product.nutrition && product.nutrition.calories > 0 && (
                <div className="flex gap-4 text-xs text-muted-foreground bg-card/50 backdrop-blur-sm rounded-lg p-2 border border-muted/30">
                  <span>{Math.round(product.nutrition.calories)} ккал</span>
                  <span>Б: {Math.round(product.nutrition.protein)}г</span>
                  <span>Ж: {Math.round(product.nutrition.fat)}г</span>
                  <span>В: {Math.round(product.nutrition.carbs)}г</span>
                </div>
              )}

              {/* Location badge */}
              {product.isInPantry && (
                <Badge variant="secondary" className="text-xs w-fit">
                  Кладовка
                </Badge>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!product.isInPantry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProductUsed(product.id)}
                    className="flex-1 border-2 hover:bg-muted/50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Використано
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddToShoppingList(product)}
                  className="border-2 hover:bg-muted/50"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveProduct(product.id)}
                  className="border-2 hover:bg-muted/50 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
