import { Bell, Brain, CheckCircle, AlertTriangle, Info, X, Settings, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";

interface Notification {
  id: string;
  type: "reminder" | "achievement" | "warning" | "tip" | "motivation";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "high" | "medium" | "low";
  action?: string;
  icon: any;
  color: string;
}

interface AINotificationsProps {
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

export function AINotifications({ 
  onNotificationClick, 
  onMarkAsRead, 
  onClearAll 
}: AINotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    // Simulate loading notifications
    const timer = setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "reminder",
          title: "Время пить воду",
          message: "Вы не пили воду уже 2 часа. Рекомендую выпить стакан воды сейчас.",
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          priority: "medium",
          action: "Добавить воду",
          icon: Bell,
          color: "from-blue-500 to-blue-600"
        },
        {
          id: "2",
          type: "achievement",
          title: "Цель достигнута!",
          message: t("congratulations"),
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          priority: "high",
          action: t("viewStatistics"),
          icon: CheckCircle,
          color: "from-green-500 to-green-600"
        },
        {
          id: "3",
          type: "tip",
          title: "Совет дня",
          message: "Добавьте больше белка в завтрак для лучшего насыщения на весь день.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          priority: "low",
          action: t("viewRecipes"),
          icon: Info,
          color: "from-yellow-500 to-orange-500"
        },
        {
          id: "4",
          type: "warning",
          title: "Низкое потребление калорий",
          message: "Сегодня вы употребили только 1200 ккал. Это может замедлить метаболизм.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: true,
          priority: "high",
          action: "Добавить еду",
          icon: AlertTriangle,
          color: "from-red-500 to-red-600"
        },
        {
          id: "5",
          type: "motivation",
          title: "Мотивация",
          message: "Отличная работа! Вы на правильном пути к достижению цели.",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true,
          priority: "low",
          icon: Brain,
          color: "from-purple-500 to-purple-600"
        }
      ];
      
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    onMarkAsRead?.(id);
  };

  const handleClearAll = () => {
    setNotifications([]);
    onClearAll?.();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center animate-pulse">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{t("aiNotifications")}</h3>
                <p className="text-sm text-muted-foreground">Загружаю уведомления...</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/30 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t("aiNotifications")}</h3>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} непрочитанных` : "Все уведомления прочитаны"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-medium">{t("aiActive")}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((notification, index) => {
            const IconComponent = notification.icon;
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    notification.read 
                      ? "bg-muted/20 border-muted/30" 
                      : "bg-primary/5 border-primary/20 shadow-md"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center ${notification.color}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                        
                        {notification.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            {notification.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 text-center bg-muted/20 border border-muted/30">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Нет уведомлений</h4>
            <p className="text-sm text-muted-foreground">
              {t("aiWillSendPersonalTips")}
            </p>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Очистить все
            </Button>
            <Button
              variant="outline"
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
