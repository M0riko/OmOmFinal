import { TrendingUp, TrendingDown, Target, Calendar, Dumbbell, Apple, Heart, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ProfileQuickStatsProps {
  stats: {
    totalWorkouts: number;
    totalCalories: number;
    averageWorkoutTime: number;
    weeklyGoal: number;
    weeklyProgress: number;
    weightChange: number;
    muscleGain: number;
    bodyFatChange: number;
  };
}

export function ProfileQuickStats({ stats }: ProfileQuickStatsProps) {
  const quickStats = [
    {
      id: "workouts",
      title: "Тренировки",
      value: stats.totalWorkouts,
      unit: "сессий",
      icon: Dumbbell,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/10 to-blue-500/5",
      borderColor: "border-blue-500/30",
      trend: stats.totalWorkouts > 50 ? "up" : "stable",
      trendValue: "+12%"
    },
    {
      id: "calories",
      title: "Калории",
      value: stats.totalCalories,
      unit: "сожжено",
      icon: Apple,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-500/5",
      borderColor: "border-green-500/30",
      trend: "up",
      trendValue: "+8%"
    },
    {
      id: "time",
      title: "Время",
      value: stats.averageWorkoutTime,
      unit: "мин/сессия",
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-500/10 to-purple-500/5",
      borderColor: "border-purple-500/30",
      trend: "up",
      trendValue: "+5%"
    },
    {
      id: "progress",
      title: "Прогресс",
      value: Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100),
      unit: "% цели",
      icon: Target,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-500/10 to-orange-500/5",
      borderColor: "border-orange-500/30",
      trend: stats.weeklyProgress >= stats.weeklyGoal ? "up" : "down",
      trendValue: stats.weeklyProgress >= stats.weeklyGoal ? "Цель!" : "В процессе"
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickStats.map((stat, index) => {
        const IconComponent = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        
        return (
          <motion.div
            key={stat.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 bg-gradient-to-br border-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${stat.bgColor} ${stat.borderColor}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg ${stat.color}`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.trend === "up" ? "text-green-400" : "text-orange-400"}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span className="font-medium">{stat.trendValue}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.unit}</p>
                  <p className="text-xs font-medium text-foreground">{stat.title}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
