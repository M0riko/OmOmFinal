import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ShoppingCart, 
  CheckCircle, 
  Circle,
  Trash2,
  Eye,
  EyeOff,
  Share2,
  Store,
  Smartphone,
  Package,
  Apple,
  Milk,
  Carrot,
  Croissant,
  Coffee,
  Cookie,
  Home,
  MoreHorizontal,
  Snowflake
} from "lucide-react";
import { useState, useCallback } from "react";
import { useShoppingList, ShoppingItem } from "@/hooks/useShoppingList";
import { toast } from "sonner";

interface StoreModeShoppingListProps {
  onExitStoreMode: () => void;
}

const categoryIcons = {
  vegetables: Apple,
  dairy: Milk,
  meat: Carrot,
  bakery: Croissant,
  pantry: Package,
  frozen: Snowflake,
  beverages: Coffee,
  snacks: Cookie,
  household: Home,
  other: MoreHorizontal
};

export function StoreModeShoppingList({ onExitStoreMode }: StoreModeShoppingListProps) {
  const { 
    items, 
    categories, 
    stats, 
    toggleItem, 
    removeItem, 
    getItemsByCategory, 
    exportList 
  } = useShoppingList();
  
  const [showCompleted, setShowCompleted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const groupedItems = getItemsByCategory();
  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggleItem = useCallback((itemId: string) => {
    toggleItem(itemId);
    // Вибрация для мобильных устройств
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [toggleItem]);

  const handleRemoveItem = useCallback((itemId: string) => {
    removeItem(itemId);
    toast.success("Товар видалено зі списку");
  }, [removeItem]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const listText = exportList();
      
      if (navigator.share) {
        await navigator.share({
          title: 'Список покупок',
          text: listText
        });
      } else {
        // Fallback для браузеров без поддержки Web Share API
        await navigator.clipboard.writeText(listText);
        toast.success("Список скопійовано в буфер обміну");
      }
    } catch (error) {
      console.error('Error sharing list:', error);
      toast.error("Помилка при поділі списком");
    } finally {
      setIsSharing(false);
    }
  }, [exportList]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const renderItem = (item: ShoppingItem) => {
    const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || Package;
    
    return (
      <div
        key={item.id}
        className={`flex items-center gap-4 p-4 rounded-lg border-l-4 transition-all duration-200 ${
          item.isCompleted 
            ? 'opacity-60 bg-gray-50 dark:bg-gray-900/20' 
            : getPriorityColor(item.priority)
        }`}
      >
        {/* Чекбокс */}
        <div className="flex-shrink-0">
          <Checkbox
            checked={item.isCompleted}
            onCheckedChange={() => handleToggleItem(item.id)}
            className="w-6 h-6 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        {/* Иконка категории */}
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-lg ${
            item.isCompleted 
              ? 'bg-gray-200 dark:bg-gray-700' 
              : 'bg-primary/10'
          }`}>
            <IconComponent className={`w-5 h-5 ${
              item.isCompleted 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-primary'
            }`} />
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-lg ${
            item.isCompleted 
              ? 'line-through text-gray-500 dark:text-gray-400' 
              : 'text-foreground'
          }`}>
            {item.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {item.quantity} {item.unit}
            {item.estimatedPrice && (
              <span className="ml-2 font-medium">
                ~{item.estimatedPrice}₴
              </span>
            )}
          </div>
          {item.isAutoAdded && (
            <Badge variant="secondary" className="mt-1 text-xs">
              Автоматично додано
            </Badge>
          )}
        </div>

        {/* Кнопка удаления */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveItem(item.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Заголовок режима магазина */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Режим магазину</h2>
              <p className="text-sm text-muted-foreground">
                Зручний інтерфейс для покупок
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onExitStoreMode}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Звичайний режим
          </Button>
        </div>
      </Card>

      {/* Прогресс */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span className="font-semibold">Прогрес покупок</span>
          </div>
          <Badge variant="outline" className="text-sm">
            {completedCount} / {totalCount}
          </Badge>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {Math.round(progress)}% завершено
        </div>
      </Card>

      {/* Действия */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => setShowCompleted(!showCompleted)}
          className="gap-2"
        >
          {showCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showCompleted ? 'Приховати куплені' : 'Показати куплені'}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleShare}
          disabled={isSharing}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Поділитися
        </Button>
      </div>

      {/* Список товаров по категориям */}
      <div className="space-y-6">
        {groupedItems.map(({ category, items: categoryItems }) => {
          const visibleItems = showCompleted 
            ? categoryItems 
            : categoryItems.filter(item => !item.isCompleted);
          
          if (visibleItems.length === 0) return null;

          const completedInCategory = categoryItems.filter(item => item.isCompleted).length;
          const totalInCategory = categoryItems.length;

          return (
            <Card key={category.id} className="overflow-hidden">
              <div className="p-4 bg-muted/50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <category.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {completedInCategory} / {totalInCategory} товарів
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={completedInCategory === totalInCategory ? "default" : "secondary"}
                    className={completedInCategory === totalInCategory ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                  >
                    {completedInCategory === totalInCategory ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : null}
                    {Math.round((completedInCategory / totalInCategory) * 100)}%
                  </Badge>
                </div>
              </div>
              
              <div className="divide-y divide-border">
                {visibleItems.map(renderItem)}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Пустое состояние */}
      {groupedItems.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Список покупок порожній</h3>
              <p className="text-muted-foreground">
                Додайте товари або використайте автоматичне додавання
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
