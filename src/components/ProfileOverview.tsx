import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Target, 
  Activity, 
  TrendingUp, 
  BarChart3,
  ChefHat,
  BookOpen,
  Calendar,
  Award,
  Trophy,
  Zap,
  Droplets,
  Moon,
  Utensils
} from "lucide-react";
import { useMemo } from "react";

interface ProfileOverviewProps {
  user: any;
  activityLevel: string;
  activityLevels: any;
}

export function ProfileOverview({ user, activityLevel, activityLevels }: ProfileOverviewProps) {
  const stats = useMemo(() => {
    // Mock data - в реальном приложении это будет приходить из API
    const totalRecipesCooked = 12; // Приготовлено блюд по плану
    const totalWorkouts = 8;
    const weightChange = -1.5; // Изменение веса с начала
    const streakDays = 7;
    
    // Комплексный недельный прогресс
    const weeklyProgress = {
      workouts: { current: 3, goal: 4, label: "Тренування" },
      nutrition: { current: 5, goal: 7, label: "Харчування" },
      water: { current: 6, goal: 7, label: "Вода" },
      sleep: { current: 6, goal: 7, label: "Сон" }
    };
    
    // Личные рекорды
    const personalRecords = [
      { exercise: "Жим лежа", value: "100 кг", date: "2 дні тому" },
      { exercise: "Присідання", value: "120 кг", date: "1 тиждень тому" },
      { exercise: "Станова тяга", value: "140 кг", date: "3 дні тому" }
    ];
    
    // Главные достижения
    const mainAchievements = [
      { title: "Перші 30 днів з нами!", icon: Calendar, color: "text-green-600", bgColor: "bg-green-100" },
      { title: "Серія 7 днів", icon: Zap, color: "text-orange-600", bgColor: "bg-orange-100" },
      { title: "Перший рекорд", icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-100" }
    ];
    
    return {
      totalRecipesCooked,
      totalWorkouts,
      weightChange,
      streakDays,
      weeklyProgress,
      personalRecords,
      mainAchievements
    };
  }, []);

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Профиль пользователя */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.name || "Користувач"}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
          <Badge variant="outline" className="mt-1">
            {activityLevels[activityLevel]?.label}
          </Badge>
        </div>
      </div>

      {/* Улучшенные виджеты статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Рецепти</h4>
          </div>
          <p className="text-2xl font-bold">{stats.totalRecipesCooked}</p>
          <p className="text-sm text-muted-foreground">приготовано за планом</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">Тренування</h4>
          </div>
          <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
          <p className="text-sm text-muted-foreground">цього місяця (vs. 6 минулого)</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold">Вага</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.weightChange > 0 ? '+' : ''}{stats.weightChange} кг</p>
          <p className="text-sm text-muted-foreground">з початку</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h4 className="font-semibold">Серія</h4>
          </div>
          <p className="text-2xl font-bold">{stats.streakDays}</p>
          <p className="text-sm text-muted-foreground">днів</p>
        </Card>
      </div>

      {/* Комплексный недельный прогресс */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Тижневий прогрес</h3>
        <div className="space-y-4">
          {Object.entries(stats.weeklyProgress).map(([key, progress]: [string, any]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  {key === 'workouts' && <Activity className="w-4 h-4" />}
                  {key === 'nutrition' && <Utensils className="w-4 h-4" />}
                  {key === 'water' && <Droplets className="w-4 h-4" />}
                  {key === 'sleep' && <Moon className="w-4 h-4" />}
                  {progress.label}
                </span>
                <span>{progress.current} / {progress.goal}</span>
              </div>
              <Progress 
                value={(progress.current / progress.goal) * 100} 
                className="h-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((progress.current / progress.goal) * 100)}% від цілі
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Календарь активности */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Календар активності</h3>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {Array.from({ length: 28 }, (_, i) => {
            const day = i + 1;
            const isActive = Math.random() > 0.3; // Mock data
            const isWorkout = Math.random() > 0.7; // Mock data
            
            return (
              <div
                key={day}
                className={`w-8 h-8 rounded text-xs flex items-center justify-center ${
                  isActive 
                    ? isWorkout 
                      ? 'bg-green-600 text-white' 
                      : 'bg-green-300 text-green-800'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span>Немає даних</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <span>Досягнуто ціль</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Тренування + ціль</span>
          </div>
        </div>
      </Card>

      {/* Личные рекорды и достижения */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Личные рекорды */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Особисті рекорди</h3>
          <div className="space-y-3">
            {stats.personalRecords.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{record.exercise}</p>
                  <p className="text-sm text-muted-foreground">{record.date}</p>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {record.value}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Главные достижения */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Головні досягнення</h3>
          <div className="space-y-3">
            {stats.mainAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`w-10 h-10 rounded-full ${achievement.bgColor} flex items-center justify-center`}>
                  <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                </div>
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground">Відкрито нещодавно</p>
                </div>
                <Badge variant="success" className="ml-auto">✓</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
