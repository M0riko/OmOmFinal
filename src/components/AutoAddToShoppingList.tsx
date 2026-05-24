import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Package,
  ChefHat,
  Refrigerator
} from "lucide-react";
import { useState } from "react";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { useSmartFridge } from "@/hooks/useSmartFridge";

interface AutoAddToShoppingListProps {
  onItemsAdded?: (count: number) => void;
}

export function AutoAddToShoppingList({ onItemsAdded }: AutoAddToShoppingListProps) {
  const { addFromMealPlan, addFromFridge, getSuggestions } = useShoppingList();
  const { weeklyPlan } = useMealPlanner();
  const { products } = useSmartFridge();
  const [isLoading, setIsLoading] = useState(false);
  const [lastAddedCount, setLastAddedCount] = useState(0);

  const suggestions = getSuggestions();

  const handleAddFromMealPlan = async () => {
    setIsLoading(true);
    try {
      const count = addFromMealPlan();
      setLastAddedCount(count);
      onItemsAdded?.(count);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = (itemName: string) => {
    addFromFridge(itemName);
    onItemsAdded?.(1);
  };

  const hasMealPlan = weeklyPlan && Object.keys(weeklyPlan).length > 0;
  const hasLowStock = products.some(product => 
    product.quantity < 2 // Предполагаем, что меньше 2 единиц = низкий запас
  );

  return (
    <div className="space-y-4">
      {/* Автоматическое добавление из плана питания */}
      {hasMealPlan && (
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">План харчування</h3>
                <p className="text-sm text-muted-foreground">
                  Додати відсутні інгредієнти з вашого плану
                </p>
              </div>
            </div>
            <Button 
              onClick={handleAddFromMealPlan}
              disabled={isLoading}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Додати автоматично
            </Button>
          </div>
          {lastAddedCount > 0 && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Додано {lastAddedCount} товарів з плану харчування
                </span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Предложения на основе истории */}
      {suggestions.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Купити знову?</h3>
              <p className="text-sm text-muted-foreground">
                Товари, які ви купуєте регулярно
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleAddSuggestion(suggestion.name)}
                className="justify-start gap-2 h-auto p-3 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30"
              >
                <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div className="text-left">
                  <div className="font-medium text-sm">{suggestion.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Куплено {suggestion.frequency} разів
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Уведомление о низком запасе */}
      {hasLowStock && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Низький запас</h3>
              <p className="text-sm text-muted-foreground">
                Деякі продукти в холодильнику закінчуються
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Быстрые действия */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Швидкі дії</h3>
            <p className="text-sm text-muted-foreground">
              Додати товари з інших розділів
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="gap-2 justify-start h-auto p-3"
            onClick={() => {
              // Здесь можно добавить логику для перехода к рецептам
              console.log('Navigate to recipes');
            }}
          >
            <ChefHat className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium text-sm">З рецептів</div>
              <div className="text-xs text-muted-foreground">Додати інгредієнти</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="gap-2 justify-start h-auto p-3"
            onClick={() => {
              // Здесь можно добавить логику для перехода к холодильнику
              console.log('Navigate to fridge');
            }}
          >
            <Refrigerator className="w-4 h-4" />
            <div className="text-left">
              <div className="font-medium text-sm">З холодильника</div>
              <div className="text-xs text-muted-foreground">Закінчуються продукти</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}
