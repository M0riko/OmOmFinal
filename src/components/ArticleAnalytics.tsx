import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Heart, 
  Bookmark,
  Calendar,
  Target,
  Zap,
  Award,
  Activity,
  Brain,
  Apple,
  Dumbbell,
  Moon,
  ChefHat,
  Flame
} from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { useMemo } from "react";

export function ArticleAnalytics() {
  const { readingStats, readingHistory, allCategories } = useArticles();

  // Анализ категорий
  const categoryAnalysis = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const categoryTime: Record<string, number> = {};
    
    readingHistory.forEach(article => {
      const categoryId = article.category.id;
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      categoryTime[categoryId] = (categoryTime[categoryId] || 0) + article.readingTime;
    });

    return Object.entries(categoryCounts).map(([categoryId, count]) => {
      const category = allCategories.find(c => c.id === categoryId);
      const time = categoryTime[categoryId] || 0;
      const percentage = readingStats.totalArticlesRead > 0 ? 
        (count / readingStats.totalArticlesRead) * 100 : 0;
      
      return {
        categoryId,
        categoryName: category?.nameUk || categoryId,
        count,
        time,
        percentage
      };
    }).sort((a, b) => b.count - a.count);
  }, [readingHistory, readingStats.totalArticlesRead, allCategories]);

  // Анализ тегов
  const tagAnalysis = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    readingHistory.forEach(article => {
      article.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [readingHistory]);

  // Анализ активности по времени
  const activityAnalysis = useMemo(() => {
    const monthlyActivity: Record<string, number> = {};
    
    readingHistory.forEach(article => {
      const month = new Date(article.publishedAt).toLocaleDateString('uk-UA', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
    });

    return Object.entries(monthlyActivity)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-6); // Последние 6 месяцев
  }, [readingHistory]);

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'nutrition': return <Apple className="w-4 h-4" />;
      case 'training': return <Dumbbell className="w-4 h-4" />;
      case 'recovery': return <Moon className="w-4 h-4" />;
      case 'motivation': return <Zap className="w-4 h-4" />;
      case 'recipes': return <ChefHat className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return Flame;
    if (streak >= 14) return Zap;
    if (streak >= 7) return Target;
    if (streak >= 3) return BookOpen;
    return BookOpen;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Аналітика читання</h2>
          <p className="text-muted-foreground">
            Ваші інтереси та звички читання
          </p>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Прочитано статей</p>
              <p className="text-2xl font-bold">{readingStats.totalArticlesRead}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Час читання</p>
              <p className="text-2xl font-bold">{readingStats.totalReadingTime}</p>
              <p className="text-xs text-muted-foreground">хвилин</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Серія читання</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                {(() => {
                  const Icon = getStreakIcon(readingStats.readingStreak);
                  return <Icon className="w-5 h-5" />;
                })()}
                {readingStats.readingStreak}
              </p>
              <p className="text-xs text-muted-foreground">днів поспіль</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Середній час</p>
              <p className="text-2xl font-bold">{Math.round(readingStats.averageReadingTime)}</p>
              <p className="text-xs text-muted-foreground">хв на статтю</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Категорії</TabsTrigger>
          <TabsTrigger value="tags">Теги</TabsTrigger>
          <TabsTrigger value="activity">Активність</TabsTrigger>
        </TabsList>

        {/* Анализ по категориям */}
        <TabsContent value="categories" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Улюблені категорії</h3>
                <p className="text-sm text-muted-foreground">
                  Розподіл прочитаних статей за категоріями
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {categoryAnalysis.map((category, index) => (
                <div key={category.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category.categoryId)}
                        <span className="font-medium">{category.categoryName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{category.count} статей</div>
                      <div className="text-sm text-muted-foreground">
                        {category.time} хв
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(category.percentage)}% від загального читання
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Анализ по тегам */}
        <TabsContent value="tags" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Найпопулярніші теги</h3>
                <p className="text-sm text-muted-foreground">
                  Теми, які вас найбільше цікавлять
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {tagAnalysis.map((tag, index) => (
                <div key={tag.tag} className="flex items-center gap-2">
                  <Badge 
                    variant={index < 3 ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {index < 3 && <Award className="w-3 h-3" />}
                    {tag.tag}
                    <span className="text-xs opacity-75">({tag.count})</span>
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Анализ активности */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Активність по місяцях</h3>
                <p className="text-sm text-muted-foreground">
                  Динаміка читання за останні місяці
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between h-32 gap-2">
                {activityAnalysis.map(([month, count]) => {
                  const maxCount = Math.max(...activityAnalysis.map(([, c]) => c));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={month} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height: `${height}%` }}>
                        <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg" style={{ height: '100%' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {count}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Мотивационные сообщения */}
      {readingStats.readingStreak > 0 && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Відмінна серія читання!</h4>
              <p className="text-sm text-muted-foreground">
                Ви читаєте статті {readingStats.readingStreak} днів поспіль. Продовжуйте в тому ж дусі!
              </p>
            </div>
          </div>
        </Card>
      )}

      {categoryAnalysis.length > 0 && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold">Ваші інтереси</h4>
              <p className="text-sm text-muted-foreground">
                Найбільше вас цікавить: {categoryAnalysis[0]?.categoryName}
                {categoryAnalysis[1] && ` та ${categoryAnalysis[1].categoryName}`}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
