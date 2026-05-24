import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Trophy, 
  Target, 
  Calendar, 
  Activity, 
  BookOpen, 
  ChefHat,
  Zap,
  TrendingUp,
  Star,
  Lock,
  CheckCircle,
  Clock,
  Users,
  Heart,
  Shield,
  Crown,
  Medal,
  Gem
} from "lucide-react";
import { useMemo } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: "training" | "nutrition" | "streak" | "social" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  points: number;
}

export function AchievementsSystem() {
  const achievements = useMemo((): Achievement[] => {
    return [
      // Тренировки
      {
        id: "first_workout",
        title: "Перше тренування",
        description: "Додайте своє перше тренування",
        icon: Activity,
        category: "training",
        rarity: "common",
        isUnlocked: true,
        unlockedAt: "2024-01-15",
        points: 10
      },
      {
        id: "workout_100_minutes",
        title: "100 хвилин тренувань",
        description: "Потрібно: 100 хв тренувань",
        icon: Clock,
        category: "training",
        rarity: "common",
        isUnlocked: false,
        progress: 75,
        maxProgress: 100,
        points: 25
      },
      {
        id: "workout_1000_minutes",
        title: "1000 хвилин тренувань",
        description: "Потрібно: 1000 хв тренувань",
        icon: Trophy,
        category: "training",
        rarity: "rare",
        isUnlocked: false,
        progress: 450,
        maxProgress: 1000,
        points: 100
      },
      {
        id: "personal_record",
        title: "Перший рекорд",
        description: "Встановіть особистий рекорд",
        icon: TrendingUp,
        category: "training",
        rarity: "rare",
        isUnlocked: true,
        unlockedAt: "2024-01-20",
        points: 50
      },
      {
        id: "workout_marathon",
        title: "Марафон тренувань",
        description: "Тренуйтесь 30 днів поспіль",
        icon: Calendar,
        category: "training",
        rarity: "epic",
        isUnlocked: false,
        progress: 7,
        maxProgress: 30,
        points: 200
      },

      // Питание
      {
        id: "first_meal",
        title: "Перший прийом їжі",
        description: "Запишіть свій перший прийом їжі",
        icon: ChefHat,
        category: "nutrition",
        rarity: "common",
        isUnlocked: true,
        unlockedAt: "2024-01-10",
        points: 10
      },
      {
        id: "meal_100",
        title: "100 прийомів їжі",
        description: "Потрібно: 100 записаних прийомів їжі",
        icon: Target,
        category: "nutrition",
        rarity: "common",
        isUnlocked: false,
        progress: 45,
        maxProgress: 100,
        points: 25
      },
      {
        id: "perfect_week",
        title: "Ідеальний тиждень",
        description: "7 днів без перевищення калорій",
        icon: Star,
        category: "nutrition",
        rarity: "rare",
        isUnlocked: false,
        progress: 3,
        maxProgress: 7,
        points: 75
      },
      {
        id: "macro_master",
        title: "Майстер макро",
        description: "Досягніть цілей по БЖУ 7 днів поспіль",
        icon: Award,
        category: "nutrition",
        rarity: "epic",
        isUnlocked: false,
        progress: 2,
        maxProgress: 7,
        points: 150
      },

      // Серии
      {
        id: "streak_7",
        title: "7 днів поспіль",
        description: "Тренуйтесь 7 днів поспіль",
        icon: Zap,
        category: "streak",
        rarity: "common",
        isUnlocked: true,
        unlockedAt: "2024-01-25",
        points: 30
      },
      {
        id: "streak_30",
        title: "30 днів поспіль",
        description: "Тренуйтесь 30 днів поспіль",
        icon: Calendar,
        category: "streak",
        rarity: "rare",
        isUnlocked: false,
        progress: 7,
        maxProgress: 30,
        points: 100
      },
      {
        id: "streak_100",
        title: "100 днів поспіль",
        description: "Тренуйтесь 100 днів поспіль",
        icon: Crown,
        category: "streak",
        rarity: "legendary",
        isUnlocked: false,
        progress: 7,
        maxProgress: 100,
        points: 500
      },

      // Статьи
      {
        id: "read_10_articles",
        title: "10 статей прочитано",
        description: "Потрібно: 10 статей",
        icon: BookOpen,
        category: "nutrition",
        rarity: "common",
        isUnlocked: true,
        unlockedAt: "2024-01-18",
        points: 20
      },
      {
        id: "read_50_articles",
        title: "50 статей прочитано",
        description: "Потрібно: 50 статей",
        icon: BookOpen,
        category: "nutrition",
        rarity: "rare",
        isUnlocked: false,
        progress: 23,
        maxProgress: 50,
        points: 75
      },

      // Специальные
      {
        id: "first_month",
        title: "Перші 30 днів з нами!",
        description: "Використовуйте додаток 30 днів",
        icon: Heart,
        category: "special",
        rarity: "epic",
        isUnlocked: true,
        unlockedAt: "2024-01-30",
        points: 100
      },
      {
        id: "early_bird",
        title: "Ранкова пташка",
        description: "Тренуйтесь до 7 ранку 5 разів",
        icon: Clock,
        category: "special",
        rarity: "rare",
        isUnlocked: false,
        progress: 2,
        maxProgress: 5,
        points: 50
      },
      {
        id: "night_owl",
        title: "Нічна сова",
        description: "Тренуйтесь після 10 вечора 5 разів",
        icon: Clock,
        category: "special",
        rarity: "rare",
        isUnlocked: false,
        progress: 0,
        maxProgress: 5,
        points: 50
      }
    ];
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-600 bg-gray-100";
      case "rare": return "text-blue-600 bg-blue-100";
      case "epic": return "text-purple-600 bg-purple-100";
      case "legendary": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common": return Medal;
      case "rare": return Star;
      case "epic": return Gem;
      case "legendary": return Crown;
      default: return Medal;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "training": return Activity;
      case "nutrition": return ChefHat;
      case "streak": return Zap;
      case "social": return Users;
      case "special": return Heart;
      default: return Award;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "training": return "text-blue-600 bg-blue-100";
      case "nutrition": return "text-green-600 bg-green-100";
      case "streak": return "text-orange-600 bg-orange-100";
      case "social": return "text-purple-600 bg-purple-100";
      case "special": return "text-pink-600 bg-pink-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      {/* Статистика достижений */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h4 className="font-semibold">Всього досягнень</h4>
          </div>
          <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
          <p className="text-sm text-muted-foreground">з {achievements.length}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">Очки</h4>
          </div>
          <p className="text-2xl font-bold">{totalPoints}</p>
          <p className="text-sm text-muted-foreground">набрано</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold">Рівень</h4>
          </div>
          <p className="text-2xl font-bold">{Math.floor(totalPoints / 100) + 1}</p>
          <p className="text-sm text-muted-foreground">до наступного: {100 - (totalPoints % 100)} очок</p>
        </Card>
      </div>

      {/* Разблокированные достижения */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Розблоковані досягнення</h3>
        {unlockedAchievements.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Поки що немає розблокованих досягнень. Почніть тренуватися!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => {
              const RarityIcon = getRarityIcon(achievement.rarity);
              const CategoryIcon = getCategoryIcon(achievement.category);
              
              return (
                <div key={achievement.id} className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <achievement.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                          <RarityIcon className="w-3 h-3 mr-1" />
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {achievement.category}
                        </Badge>
                        <Badge variant="secondary" className="ml-auto">
                          {achievement.points} очок
                        </Badge>
                      </div>
                      {achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Розблоковано: {new Date(achievement.unlockedAt).toLocaleDateString('uk-UA')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Заблокированные достижения */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Досягнення в прогресі</h3>
        {lockedAchievements.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Всі досягнення розблоковані! Ви неймовірні!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => {
              const RarityIcon = getRarityIcon(achievement.rarity);
              const CategoryIcon = getCategoryIcon(achievement.category);
              const progressPercentage = achievement.progress && achievement.maxProgress 
                ? (achievement.progress / achievement.maxProgress) * 100 
                : 0;
              
              return (
                <div key={achievement.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <achievement.icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-muted-foreground">{achievement.title}</h4>
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      
                      {achievement.progress !== undefined && achievement.maxProgress && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Прогрес</span>
                            <span>{achievement.progress} / {achievement.maxProgress}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                          <RarityIcon className="w-3 h-3 mr-1" />
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {achievement.category}
                        </Badge>
                        <Badge variant="secondary" className="ml-auto">
                          {achievement.points} очок
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
