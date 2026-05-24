import { User, Mail, Star, Zap, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

interface User {
  name?: string;
  email?: string;
  avatar?: string;
}

interface ProfileHeaderProps {
  user: User | null;
  level: number;
  xp: number;
  xpToNextLevel: number;
  activityStatus: string;
  streakDays: number;
}

export function ProfileHeader({
  user,
  level,
  xp,
  xpToNextLevel,
  activityStatus,
  streakDays
}: ProfileHeaderProps) {
  const { t } = useI18n();
  const getLevelColor = (level: number) => {
    if (level >= 50) return "from-purple-500 to-purple-600";
    if (level >= 25) return "from-blue-500 to-blue-600";
    if (level >= 10) return "from-green-500 to-green-600";
    return "from-orange-500 to-orange-600";
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return "Мастер";
    if (level >= 25) return "Эксперт";
    if (level >= 10) return "Продвинутый";
    return "Новичок";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "very_active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "active": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "moderate": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "very_active": return "Очень активный";
      case "active": return "Активный";
      case "moderate": return "Умеренный";
      default: return "Малоподвижный";
    }
  };

  const xpProgress = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-primary/80 p-1">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || "User"} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {user?.name || t("user")}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user?.email || "email@example.com"}</span>
              </div>
            </div>

            {/* Level and XP */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`text-sm font-semibold bg-gradient-to-r ${getLevelColor(level)} text-white border-0`}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {t("levelTitle")} {level} • {getLevelTitle(level)}
                </Badge>
                <Badge variant="outline" className={getStatusColor(activityStatus)}>
                  {getStatusLabel(activityStatus)}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Опыт</span>
                  <span className="font-medium">{xp} / {xpToNextLevel} XP</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${getLevelColor(level)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(xpProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Streak Badge */}
          {streakDays > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-400">{streakDays}</p>
                    <p className="text-xs text-muted-foreground">{t("daysInRow")}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
