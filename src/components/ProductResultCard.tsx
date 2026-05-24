import { Flame, Package, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductResultCardProps {
  product: any;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCustom?: boolean;
  translatedName?: string;
}

export function ProductResultCard({ 
  product, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  isCustom = false,
  translatedName 
}: ProductResultCardProps) {
  const displayName = translatedName || product.food_name;
  const calories = product.calories || 0;
  const protein = product.protein || 0;
  const fats = product.fat || 0;
  const carbs = product.carbohydrate || 0;

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all duration-300 hover:shadow-lg group",
        "border-2 hover:border-primary/30",
        isSelected 
          ? "bg-primary/5 border-primary/50 shadow-lg" 
          : "bg-card/50 border-muted/30 hover:bg-card/80"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-base text-foreground">
              {displayName}
            </h4>
            {isCustom ? (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Package className="w-3 h-3 mr-1" />
                Мої
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Search className="w-3 h-3 mr-1" />
                FatSecret
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="font-medium">{calories} ккал</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Б: {protein}г
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Ж: {fats}г
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                В: {carbs}г
              </span>
            </div>
          </div>
          
          {translatedName && translatedName !== product.food_name && (
            <p className="text-xs text-muted-foreground italic">
              ({product.food_name})
            </p>
          )}
        </div>
        
        {/* Action buttons for custom products */}
        {isCustom && onEdit && onDelete && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
