import { TrendingUp, Calendar, Target, Zap, Award, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface LifetimeStats {
  totalDays: number;
  totalWorkouts: number;
  totalHours: number;
  totalCalories: number;
  averageWorkoutTime: number;
  longestStreak: number;
  currentStreak: number;
  goalsCompleted: number;
  totalGoals: number;
  achievementsUnlocked: number;
  totalAchievements: number;
}

interface ProfileLifetimeProgressProps {
  stats: LifetimeStats;
}

export function ProfileLifetimeProgress({ stats }: ProfileLifetimeProgressProps) {
  const lifetimeMetrics = [
    {
      id: "days",
      title: "Дней в приложении",
      value: stats.totalDays,
      unit: "дней",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/10 to-blue-500/5",
      borderColor: "border-blue-500/30",
      description: "Общее время использования"
    },
    {
      id: "workouts",
      title: "Тренировок",
      value: stats.totalWorkouts,
      unit: "сессий",
      icon: Target,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-500/5",
      borderColor: "border-green-500/30",
      description: "Всего выполнено тренировок"
    },
    {
      id: "hours",
      title: "Часов тренировок",
      value: stats.totalHours,
      unit: "часов",
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-500/10 to-purple-500/5",
      borderColor: "border-purple-500/30",
      description: "Общее время тренировок"
    },
    {
      id: "calories",
      title: "Калорий сожжено",
      value: stats.totalCalories,
      unit: "ккал",
      icon: Zap,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-500/10 to-orange-500/5",
      borderColor: "border-orange-500/30",
      description: "Общее количество сожженных калорий"
    }
  ];

  const progressMetrics = [
    {
      id: "goals",
      title: "Цели",
      completed: stats.goalsCompleted,
      total: stats.totalGoals,
      icon: Target,
      color: "from-green-500 to-green-600"
    },
    {
      id: "achievements",
      title: "Достижения",
      completed: stats.achievementsUnlocked,
      total: stats.totalAchievements,
      icon: Award,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Общий прогресс</h3>
          </div>

          {/* Lifetime Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lifetimeMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              
              return (
                <motion.div
                  key={metric.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-4 bg-gradient-to-br border-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${metric.bgColor} ${metric.borderColor}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg ${metric.color}`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-foreground">{metric.value.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{metric.unit}</p>
                        <p className="text-xs font-medium text-foreground">{metric.title}</p>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Прогресс по категориям</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progressMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                const percentage = getProgressPercentage(metric.completed, metric.total);
                
                return (
                  <motion.div
                    key={metric.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="p-4 bg-muted/20 border border-muted/30">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center ${metric.color}`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground">{metric.title}</h5>
                            <p className="text-sm text-muted-foreground">
                              {metric.completed} из {metric.total}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div 
                            className={`bg-gradient-to-r ${metric.color} h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Streak Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-muted/20"
          >
            <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">Текущая серия</h5>
                  <p className="text-2xl font-bold text-orange-400">{stats.currentStreak} дней</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">Лучшая серия</h5>
                  <p className="text-2xl font-bold text-blue-400">{stats.longestStreak} дней</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
