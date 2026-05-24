import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  Target,
  CheckCircle,
  Award,
  BarChart3,
  PieChart,
  ShoppingCart,
  Clock,
  Star
} from "lucide-react";
import { useShoppingList } from "@/hooks/useShoppingList";

export function ShoppingStatistics() {
  const { stats, categories } = useShoppingList();

  // Расчет статистики
  const completionRate = stats.totalItems > 0 ? (stats.completedItems / stats.totalItems) * 100 : 0;
  const averageWeeklySpending = stats.weeklySpending.reduce((sum, week) => sum + week, 0) / stats.weeklySpending.length;
  const spendingTrend = stats.weeklySpending.length > 1 
    ? stats.weeklySpending[stats.weeklySpending.length - 1] - stats.weeklySpending[stats.weeklySpending.length - 2]
    : 0;

  // Топ категории по количеству товаров
  const topCategories = Object.entries(stats.categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([categoryId, count]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category?.name || categoryId,
        count,
        percentage: (count / stats.totalItems) * 100
      };
    });

  // Расчет экономии (примерная логика)
  const estimatedSavings = stats.totalItems * 15; // Предполагаем экономию 15₴ на товар при планировании

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всього товарів</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Завершено</p>
              <p className="text-2xl font-bold">{stats.completedItems}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Орієнтовна вартість</p>
              <p className="text-2xl font-bold">{stats.totalEstimatedCost}₴</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Середні витрати/тиждень</p>
              <p className="text-2xl font-bold">{Math.round(averageWeeklySpending)}₴</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {spendingTrend > 0 ? (
              <TrendingUp className="w-3 h-3 text-red-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-green-500" />
            )}
            <span className={`text-xs ${spendingTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {Math.abs(Math.round(spendingTrend))}₴
            </span>
          </div>
        </Card>
      </div>

      {/* Топ категории */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <PieChart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Топ категорії</h3>
            <p className="text-sm text-muted-foreground">
              Найчастіше куповані категорії товарів
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {topCategories.map((category, index) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {category.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Топ товары */}
      {stats.topItems.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Найчастіші покупки</h3>
              <p className="text-sm text-muted-foreground">
                Товари, які ви купуєте найчастіше
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.topItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Останній раз: {new Date(item.lastBought).toLocaleDateString('uk-UA')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    {item.frequency} разів
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* График расходов */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Витрати по тижнях</h3>
            <p className="text-sm text-muted-foreground">
              Динаміка витрат на продукти за останні тижні
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between h-32 gap-2">
            {stats.weeklySpending.map((amount, index) => {
              const maxAmount = Math.max(...stats.weeklySpending);
              const height = (amount / maxAmount) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height: `${height}%` }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg" style={{ height: '100%' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {amount}₴
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Т{index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Достижения и советы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">Досягнення</h3>
          </div>
          
          <div className="space-y-3">
            {completionRate >= 100 && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">Список завершено!</span>
              </div>
            )}
            {stats.totalItems >= 10 && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">Великий список ({stats.totalItems} товарів)</span>
              </div>
            )}
            {averageWeeklySpending < 200 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium">Економний покупець</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">Поради</h3>
          </div>
          
          <div className="space-y-3">
            {completionRate < 50 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  💡 Використовуйте автоматичне додавання з плану харчування для швидшого заповнення списку
                </p>
              </div>
            )}
            {spendingTrend > 50 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Витрати зросли на {Math.round(spendingTrend)}₴. Перевірте, чи всі товари необхідні
                </p>
              </div>
            )}
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                Планування списку дозволяє економити в середньому {Math.round(estimatedSavings)}₴ на тиждень
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
