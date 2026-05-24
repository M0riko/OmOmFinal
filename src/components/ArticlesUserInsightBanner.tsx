import { TrendingUp, BookOpen, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ArticlesUserInsightBannerProps {
  articlesRead: number;
  readingStreak: number;
  favoriteCategory: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

export function ArticlesUserInsightBanner({
  articlesRead,
  readingStreak,
  favoriteCategory,
  weeklyGoal,
  weeklyProgress
}: ArticlesUserInsightBannerProps) {
  const insights = [
    {
      icon: BookOpen,
      label: "Прочитано статей",
      value: articlesRead,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: TrendingUp,
      label: "Серія читання",
      value: `${readingStreak} днів`,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Target,
      label: "Улюблена категорія",
      value: favoriteCategory,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  const weeklyProgressPercentage = weeklyGoal > 0 ? (weeklyProgress / weeklyGoal) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Ви на правильному шляху!
              </h3>
              <p className="text-sm text-muted-foreground">
                Продовжуйте розвиватися з нашими статтями
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <motion.div
                  key={insight.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl ${insight.bgColor} border border-muted/20`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${insight.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{insight.label}</p>
                      <p className={`text-lg font-bold ${insight.color}`}>
                        {insight.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Тижнева мета читання</span>
              <span className="font-medium">{weeklyProgress}/{weeklyGoal} статей</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(weeklyProgressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="font-medium">{Math.round(weeklyProgressPercentage)}%</span>
              <span>{weeklyGoal}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
