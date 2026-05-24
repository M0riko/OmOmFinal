import { Target, Zap, Star, ArrowRight, Trophy, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

interface ProfileMotivationFooterProps {
  nextGoal?: string;
  nextMilestone?: string;
  motivationalMessage?: string;
  onStartWorkout?: () => void;
  onViewGoals?: () => void;
  onViewAchievements?: () => void;
}

export function ProfileMotivationFooter({
  nextGoal,
  nextMilestone,
  motivationalMessage,
  onStartWorkout,
  onViewGoals,
  onViewAchievements
}: ProfileMotivationFooterProps) {
  const { t } = useI18n();
  const motivationalMessages = [
    "Продолжайте в том же духе!",
    "Вы на правильном пути!",
    "Каждый день - это новая возможность!",
    "Ваш прогресс впечатляет!",
    "Не останавливайтесь на достигнутом!",
    "Вы вдохновляете других!"
  ];

  const quickActions = [
    {
      id: "workout",
      title: t("startWorkout"),
      description: "Продолжить прогресс",
      icon: Zap,
      color: "from-primary to-primary/80",
      bgColor: "from-primary/10 to-primary/5",
      borderColor: "border-primary/30",
      action: onStartWorkout
    },
    {
      id: "goals",
      title: "Мои цели",
      description: "Просмотреть цели",
      icon: Target,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-500/5",
      borderColor: "border-green-500/30",
      action: onViewGoals
    },
    {
      id: "achievements",
      title: "Достижения",
      description: "Разблокировать новые",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-500/10 to-yellow-500/5",
      borderColor: "border-yellow-500/30",
      action: onViewAchievements
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const message = motivationalMessage || motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
        <div className="space-y-6">
          {/* Motivational Message */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-foreground">Мотивация</h3>
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-lg text-foreground font-medium">{message}</p>
          </div>

          {/* Next Goals/Milestones */}
          {(nextGoal || nextMilestone) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nextGoal && (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Следующая цель</h4>
                        <p className="text-sm text-muted-foreground">{nextGoal}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
              
              {nextMilestone && (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Следующий рубеж</h4>
                        <p className="text-sm text-muted-foreground">{nextMilestone}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground text-center">Быстрые действия</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                
                return (
                  <motion.div
                    key={action.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full h-auto p-4 bg-gradient-to-br border-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${action.bgColor} ${action.borderColor}`}
                      onClick={action.action}
                    >
                      <div className="space-y-3 w-full">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg mx-auto ${action.color}`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-center">
                          <h5 className="font-semibold text-foreground">{action.title}</h5>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl"
          >
            <p className="text-sm text-foreground font-medium mb-3">
              Готовы продолжить свой фитнес-путь?
            </p>
            <Button 
              onClick={onStartWorkout}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              <Zap className="w-4 h-4" />
              {t("startWorkout")}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
