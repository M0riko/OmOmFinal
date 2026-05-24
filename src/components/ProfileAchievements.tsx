import { Trophy, Medal, Star, Target, Zap, Heart, Calendar, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "strength" | "endurance" | "consistency" | "milestone" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  icon: any;
}

interface ProfileAchievementsProps {
  achievements: Achievement[];
}

export function ProfileAchievements({ achievements }: ProfileAchievementsProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "from-yellow-500 to-orange-500";
      case "epic": return "from-purple-500 to-purple-600";
      case "rare": return "from-blue-500 to-blue-600";
      case "common": return "from-green-500 to-green-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "from-yellow-500/10 to-orange-500/5";
      case "epic": return "from-purple-500/10 to-purple-500/5";
      case "rare": return "from-blue-500/10 to-blue-500/5";
      case "common": return "from-green-500/10 to-green-500/5";
      default: return "from-gray-500/10 to-gray-500/5";
    }
  };

  const getRarityBorderColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "border-yellow-500/30";
      case "epic": return "border-purple-500/30";
      case "rare": return "border-blue-500/30";
      case "common": return "border-green-500/30";
      default: return "border-gray-500/30";
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "Легендарный";
      case "epic": return "Эпический";
      case "rare": return "Редкий";
      case "common": return "Обычный";
      default: return "Неизвестный";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength": return Target;
      case "endurance": return Heart;
      case "consistency": return Calendar;
      case "milestone": return Trophy;
      case "special": return Star;
      default: return Medal;
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-foreground">Достижения</h3>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              {unlockedAchievements.length} / {achievements.length}
            </Badge>
          </div>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Разблокированные</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`p-4 bg-gradient-to-br border-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${getRarityBgColor(achievement.rarity)} ${getRarityBorderColor(achievement.rarity)}`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg ${getRarityColor(achievement.rarity)}`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs bg-muted/50">
                                {getRarityLabel(achievement.rarity)}
                              </Badge>
                              {achievement.unlockedAt && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(achievement.unlockedAt).toLocaleDateString('uk-UA')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">В процессе</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  const progress = achievement.progress && achievement.maxProgress 
                    ? (achievement.progress / achievement.maxProgress) * 100 
                    : 0;
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: (unlockedAchievements.length + index) * 0.1 }}
                    >
                      <Card className="p-4 bg-muted/20 border border-muted/30 shadow-lg opacity-60">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shadow-lg">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-semibold text-muted-foreground">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            
                            {achievement.progress !== undefined && achievement.maxProgress && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Прогресс</span>
                                  <span className="text-muted-foreground">{achievement.progress} / {achievement.maxProgress}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1">
                                  <div 
                                    className="bg-gradient-to-r from-primary to-primary/80 h-1 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            <Badge variant="outline" className="text-xs bg-muted/50">
                              {getRarityLabel(achievement.rarity)}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Achievement Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-muted/20"
          >
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{unlockedAchievements.length}</div>
              <div className="text-xs text-muted-foreground">Разблокировано</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{lockedAchievements.length}</div>
              <div className="text-xs text-muted-foreground">В процессе</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {unlockedAchievements.filter(a => a.rarity === "legendary").length}
              </div>
              <div className="text-xs text-muted-foreground">Легендарных</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Завершено</div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
