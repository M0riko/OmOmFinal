import { Trophy, Target, TrendingUp, Zap, Star, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface WorkoutMotivationFeedProps {
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    type: "streak" | "goal" | "record" | "milestone";
    date: string;
  }>;
  currentStreak?: number;
  weeklyGoal?: number;
  weeklyProgress?: number;
}

export function WorkoutMotivationFeed({
  achievements = [],
  currentStreak = 0,
  weeklyGoal = 3,
  weeklyProgress = 0
}: WorkoutMotivationFeedProps) {
  const motivationMessages = [
    {
      type: "streak",
      icon: Zap,
      title: "Серія тренувань!",
      message: `Ви тренуєтеся ${currentStreak} днів поспіль!`,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/30",
      visible: currentStreak > 0
    },
    {
      type: "goal",
      icon: Target,
      title: "Майже досягли мети!",
      message: `${weeklyProgress}/${weeklyGoal} тренувань цього тижня`,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/30",
      visible: weeklyProgress > 0 && weeklyProgress < weeklyGoal
    },
    {
      type: "milestone",
      icon: Trophy,
      title: "Ціль досягнута!",
      message: `Ви виконали план на ${Math.round((weeklyProgress / weeklyGoal) * 100)}%!`,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/30",
      visible: weeklyProgress >= weeklyGoal
    }
  ];

  const recentAchievements = achievements.slice(0, 3);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-4">
      {/* Motivation Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motivationMessages.map((message, index) => {
          if (!message.visible) return null;
          
          const IconComponent = message.icon;
          
          return (
            <motion.div
              key={message.type}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`
                p-4 bg-gradient-to-br border-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105
                ${message.bgColor} ${message.borderColor}
              `}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg
                      ${message.color}
                    `}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-sm">
                        {message.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Останні досягнення</h3>
            </div>
            
            <div className="space-y-3">
              {recentAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-muted/20"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    {achievement.type === "streak" ? "Серія" :
                     achievement.type === "goal" ? "Ціль" :
                     achievement.type === "record" ? "Рекорд" : "Міленіум"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Default Motivation */}
      {motivationMessages.every(m => !m.visible) && recentAchievements.length === 0 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="p-6 text-center bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Готові до нових досягнень?
                </h3>
                <p className="text-muted-foreground">
                  Почніть тренування і створюйте власні рекорди!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
