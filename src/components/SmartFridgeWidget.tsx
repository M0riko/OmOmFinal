import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Refrigerator, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShoppingCart,
  ChefHat,
  ArrowRight
} from "lucide-react";
import { useSmartFridge } from "@/hooks/useSmartFridge";
import { useI18n } from "@/hooks/useI18n";
import { useState, useEffect } from "react";

interface SmartFridgeWidgetProps {
  onNavigateToFridge: () => void;
}

export function SmartFridgeWidget({ onNavigateToFridge }: SmartFridgeWidgetProps) {
  const { t } = useI18n();
  const { products } = useSmartFridge();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Анализируем продукты и создаем уведомления
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newNotifications = [];

    // Проверяем сроки годности
    const expiringSoon = products.filter(product => {
      if (!product.expiryDate) return false;
      const expiryDate = new Date(product.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 2 && daysUntilExpiry >= 0;
    });

    if (expiringSoon.length > 0) {
      newNotifications.push({
        type: 'expiry',
        title: 'Срок годности истекает',
        items: expiringSoon.slice(0, 3),
        icon: AlertTriangle,
        color: 'warning',
        action: t('viewRecipes')
      });
    }

    // Проверяем пустой холодильник
    if (products.length === 0) {
      newNotifications.push({
        type: 'empty',
        title: 'Холодильник пуст',
        subtitle: 'Добавьте продукты для начала',
        icon: Refrigerator,
        color: 'info',
        action: 'Добавить продукты'
      });
    }

    // Проверяем низкое количество продуктов
    const lowStock = products.filter(product => 
      product.quantity && product.quantity < 0.5
    );

    if (lowStock.length > 0 && products.length > 0) {
      newNotifications.push({
        type: 'low_stock',
        title: 'Заканчиваются продукты',
        items: lowStock.slice(0, 2),
        icon: ShoppingCart,
        color: 'info',
        action: 'В список покупок'
      });
    }

    // Если все хорошо
    if (newNotifications.length === 0 && products.length > 0) {
      newNotifications.push({
        type: 'all_good',
        title: 'Все свежее!',
        subtitle: 'Отличный повод приготовить что-то вкусное',
        icon: CheckCircle,
        color: 'success',
        action: t('viewRecipes')
      });
    }

    setNotifications(newNotifications);
  }, [products]);

  const getNotificationIcon = (notification: any) => {
    const IconComponent = notification.icon;
    return <IconComponent className="w-5 h-5" />;
  };

  const getNotificationColor = (color: string) => {
    switch (color) {
      case 'warning': return 'text-orange-500 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'success': return 'text-green-500 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'info': return 'text-blue-500 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Refrigerator className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">Умный холодильник</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {products.length} продуктов
        </Badge>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <div key={index} className="p-3 rounded-lg border bg-card">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getNotificationColor(notification.color)}`}>
                  {getNotificationIcon(notification)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                  {notification.subtitle && (
                    <p className="text-xs text-muted-foreground mb-2">{notification.subtitle}</p>
                  )}
                  {notification.items && (
                    <div className="space-y-1">
                      {notification.items.map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{item.name}</span>
                          {item.expiryDate && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>
                                {Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дн.
                              </span>
                            </div>
                          )}
                          {item.quantity && (
                            <Badge variant="outline" className="text-xs">
                              {item.quantity} {item.unit}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  {notification.action}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs gap-1"
                  onClick={onNavigateToFridge}
                >
                  <ArrowRight className="w-3 h-3" />
                  В холодильник
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Refrigerator className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Добавьте продукты в холодильник
          </p>
          <Button size="sm" onClick={onNavigateToFridge} className="gap-2">
            <Refrigerator className="w-4 h-4" />
            Открыть холодильник
          </Button>
        </div>
      )}
    </Card>
  );
}
