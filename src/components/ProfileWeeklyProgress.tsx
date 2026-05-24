import { Target, Dumbbell, Apple, Heart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ProfileWeeklyProgressProps {
  weeklyData: {
    workouts: { completed: number; goal: number };
    calories: { burned: number; goal: number };
    nutrition: { score: number; goal: number };
    recovery: { hours: number; goal: number };
  };
}

export function ProfileWeeklyProgress({ weeklyData }: ProfileWeeklyProgressProps) {
  const progressItems = [
    {
      id: "workouts",
      title: "Тренировки",
      icon: Dumbbell,
      completed: weeklyData.workouts.completed,
      goal: weeklyData.workouts.goal,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/10 to-blue-500/5",
      borderColor: "border-blue-500/30"
    },
    {
      id: "calories",
      title: "Калории",
      icon: Apple,
      completed: weeklyData.calories.burned,
      goal: weeklyData.calories.goal,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-500/10 to-orange-500/5",
      borderColor: "border-orange-500/30"
    },
    {
      id: "nutrition",
      title: "Питание",
      icon: Target,
      completed: weeklyData.nutrition.score,
      goal: weeklyData.nutrition.goal,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-500/5",
      borderColor: "border-green-500/30"
    },
    {
      id: "recovery",
      title: "Восстановление",
      icon: Heart,
      completed: weeklyData.recovery.hours,
      goal: weeklyData.recovery.goal,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-500/10 to-purple-500/5",
      borderColor: "border-purple-500/30"
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getProgressPercentage = (completed: number, goal: number) => {
    return Math.min((completed / goal) * 100, 100);
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 100) return { text: "Цель достигнута!", color: "text-green-400" };
    if (percentage >= 75) return { text: "Почти готово!", color: "text-orange-400" };
    if (percentage >= 50) return { text: "Хороший прогресс", color: "text-blue-400" };
    return { text: "Продолжайте!", color: "text-muted-foreground" };
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
            <h3 className="text-lg font-semibold text-foreground">Недельный прогресс</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressItems.map((item, index) => {
              const IconComponent = item.icon;
              const percentage = getProgressPercentage(item.completed, item.goal);
              const status = getProgressStatus(percentage);
              
              return (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-4 bg-gradient-to-br border-2 shadow-lg ${item.bgColor} ${item.borderColor}`}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center ${item.color}`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.completed} / {item.goal}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Прогресс</span>
                          <span className="font-medium">{Math.round(percentage)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div 
                            className={`bg-gradient-to-r ${item.color} h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                          />
                        </div>
                        <p className={`text-xs font-medium ${status.color}`}>
                          {status.text}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Overall Progress Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">Общий прогресс недели</h4>
                <p className="text-sm text-muted-foreground">
                  {progressItems.reduce((acc, item) => acc + getProgressPercentage(item.completed, item.goal), 0) / progressItems.length}% выполнено
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
