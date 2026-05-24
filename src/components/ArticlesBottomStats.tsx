import { BookOpen, TrendingUp, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ArticlesBottomStatsProps {
  totalArticlesRead: number;
  weeklyGoal: number;
  weeklyProgress: number;
  readingStreak: number;
  onViewAnalytics: () => void;
}

export function ArticlesBottomStats({
  totalArticlesRead,
  weeklyGoal,
  weeklyProgress,
  readingStreak,
  onViewAnalytics
}: ArticlesBottomStatsProps) {
  const weeklyProgressPercentage = weeklyGoal > 0 ? (weeklyProgress / weeklyGoal) * 100 : 0;

  const stats = [
    {
      icon: BookOpen,
      label: "Всього прочитано",
      value: totalArticlesRead,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: TrendingUp,
      label: "Цього тижня",
      value: `${weeklyProgress}/${weeklyGoal}`,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Clock,
      label: "Серія читання",
      value: `${readingStreak} днів`,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Ваш прогрес читання</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewAnalytics}
              className="text-primary hover:bg-primary/10"
            >
              Детальна статистика
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl ${stat.bgColor} border border-muted/20`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Weekly Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Тижнева мета читання</span>
              <span className="font-medium">{Math.round(weeklyProgressPercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(weeklyProgressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="font-medium">{weeklyProgress} / {weeklyGoal}</span>
              <span>{weeklyGoal}</span>
            </div>
          </div>

          {/* Motivation Message */}
          {weeklyProgressPercentage >= 100 ? (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400 font-medium">
                Вітаємо! Ви досягли тижневої мети читання!
              </p>
            </div>
          ) : weeklyProgressPercentage >= 75 ? (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-400 font-medium">
                Майже досягли мети! Залишилось {weeklyGoal - weeklyProgress} статей.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400 font-medium">
                Продовжуйте читати! Кожна стаття наближає вас до мети.
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
