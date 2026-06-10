import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  Edit3, 
  Target, 
  Activity, 
  Moon, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Zap, 
  Heart,
  Brain,
  ChevronRight,
  Award,
  Flame,
  Clock,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { useAI } from "@/hooks/useAI";
import { useDaily } from "@/hooks/useDaily";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useWeight } from "@/hooks/useWeight";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Profile() {
  const { user, updateUser, logout, toggleDevRole } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { analyzeUserDataDeep } = useAI();
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const { totals, streakDays } = useDaily();
  const { completedWorkouts } = useWorkouts();
  const { currentWeight: trackedWeight, addWeight, getWeightTrend } = useWeight();

  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [weightValue, setWeightValue] = useState("");

  const handleWeightSubmit = () => {
    const weight = parseFloat(weightValue);
    if (isNaN(weight) || weight <= 0 || weight > 500) {
      toast.error("Введіть правильну вагу (1-500 кг)");
      return;
    }
    addWeight(weight);
    toast.success(`Додано вагу: ${weight} кг`);
    setWeightModalOpen(false);
    setWeightValue("");
  };

  // Real data for profile
  const profileData = useMemo(() => {
    const caloriesTarget = user?.calculatedCalories || user?.targets?.calories || 2000;
    const currentWeight = trackedWeight || user?.weight || 0;
    const targetWeight = user?.targetWeight || currentWeight;
    const weightTrend = getWeightTrend() || 0;
    
    // Dynamic level based on real streak days
    const level = Math.max(1, Math.floor(streakDays / 7) + 1);
    const xp = (streakDays % 7) * 150 + Math.floor(totals.calories / 100);
    const xpToNextLevel = 1000;

    return {
      level,
      xp,
      xpToNextLevel,
      streakDays: streakDays || 0,
      currentWeight,
      targetWeight,
      weightTrend,
      dailyCalories: caloriesTarget,
      weeklyProgress: {
        calories: { 
          current: totals.calories, 
          goal: caloriesTarget, 
          percentage: caloriesTarget ? Math.min(100, Math.round((totals.calories / caloriesTarget) * 100)) : 0 
        },
        workouts: { 
          completed: completedWorkouts.length, 
          goal: 3, 
          percentage: Math.min(100, Math.round((completedWorkouts.length / 3) * 100)) || 0 
        },
        sleep: { 
          average: totals.sleepHours || 0, 
          goal: 8, 
          percentage: Math.min(100, Math.round(((totals.sleepHours || 0) / 8) * 100)) || 0 
        }
      },
      achievements: [
        { id: "1", title: "Перше тренування", icon: Trophy, unlocked: streakDays > 0, rarity: "common" },
        { id: "2", title: "Тиждень підряд", icon: Calendar, unlocked: streakDays >= 7, rarity: "rare" },
        { id: "3", title: "Силач", icon: Award, unlocked: streakDays >= 30, rarity: "epic" },
        { id: "4", title: "Марафонець", icon: Flame, unlocked: streakDays >= 100, rarity: "legendary" }
      ],
      activityHeatmap: generateActivityHeatmap()
    };
  }, [user, totals, streakDays]);

  // Generate AI insight on component mount
  useEffect(() => {
    const generateInsight = async () => {
      setIsLoadingInsight(true);
      try {
        const insight = await analyzeUserDataDeep({
          user: {
            name: user?.name || 'Користувач',
            age: (user as any)?.age,
            gender: (user as any)?.gender,
            weight: (user as any)?.weight,
            height: (user as any)?.height,
            goals: (user as any)?.goals || [],
            targets: user?.targets || {}
          },
          daily: {
            calories: profileData.dailyCalories,
            water: 2.5,
            protein: 120,
            carbs: 180,
            fats: 65,
            sleep: 7.2
          }
        });
        if (insight) {
          setAiInsight(insight);
        }
      } catch (error) {
        console.error('Error generating AI insight:', error);
      } finally {
        setIsLoadingInsight(false);
      }
    };

    generateInsight();
  }, [user, analyzeUserDataDeep, profileData.dailyCalories]);

  // Handlers
  const handleRefreshInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const insight = await analyzeUserDataDeep({
        user: {
          name: user?.name || 'Користувач',
          age: (user as any)?.age,
          gender: (user as any)?.gender,
          weight: (user as any)?.weight,
          height: (user as any)?.height,
          goals: (user as any)?.goals || [],
          targets: user?.targets || {}
        },
        daily: {
          calories: profileData.dailyCalories,
          water: 2.5,
          protein: 120,
          carbs: 180,
          fats: 65,
          sleep: 7.2
        }
      });
      if (insight) {
        setAiInsight(insight);
      }
    } catch (error) {
      console.error('Error refreshing AI insight:', error);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleOpenSettings = () => {
    navigate("/settings");
  };

  const handleViewStatistics = () => {
    navigate("/statistics");
  };

  const handleViewAchievements = () => {
    navigate("/achievements");
  };

  // Generate activity heatmap data
  function generateActivityHeatmap() {
    const data = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let intensity = 0;
      if (i < streakDays) {
        if (i === 0) {
          intensity = totals.calories > 0 ? Math.min(4, Math.ceil(totals.calories / 500)) : 1;
        } else {
          intensity = 2;
        }
      }
      
      data.push({
        date: dateStr,
        intensity,
        hasActivity: intensity > 0
      });
    }
    
    return data;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-4 pb-24 md:pb-8 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* 1. Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-0.5">
                      <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      {(user as any)?.avatar ? (
                        <img 
                          src={(user as any).avatar} 
                          alt={user?.name || "User"} 
                            className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">
                            {user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">15</span>
                    </div>
                </div>

                {/* User Info */}
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {user?.name || "Користувач"}
                  </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Рівень {profileData.level} • {profileData.streakDays} днів підряд! <Flame className="w-4 h-4" />
                    </p>
                    <p className="text-xs text-primary font-medium flex items-center gap-1">
                      Твій шлях до балансу триває <Zap className="w-3 h-3" />
                    </p>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenSettings}
                    className="w-10 h-10 rounded-xl hover:bg-muted/50"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-xl hover:bg-muted/50"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Level Progress */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Прогрес до рівня {profileData.level + 1}</span>
                  <span className="text-primary font-medium">{profileData.xp}/{profileData.xpToNextLevel} XP</span>
                </div>
                <Progress 
                  value={(profileData.xp / profileData.xpToNextLevel) * 100} 
                  className="h-2 bg-muted/30"
                />
              </div>
            </Card>
          </motion.div>

          {/* 2. Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {/* Weight */}
            <Card 
              className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setWeightModalOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Вага</p>
                  <p className="text-lg font-bold">{profileData.currentWeight} кг</p>
                  {profileData.weightTrend !== 0 && (
                    <p className={`text-xs ${profileData.weightTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {profileData.weightTrend > 0 ? '+' : ''}{profileData.weightTrend.toFixed(1)} кг/нед
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Target */}
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ціль</p>
                  <p className="text-lg font-bold">{profileData.targetWeight} кг</p>
                  <p className="text-xs text-muted-foreground">{Math.abs(profileData.currentWeight - profileData.targetWeight).toFixed(1)} кг до цілі</p>
                </div>
              </div>
            </Card>

            {/* Calories */}
            <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Калорії</p>
                  <p className="text-lg font-bold">{profileData.dailyCalories}</p>
                  <p className={`text-xs ${totals.calories > profileData.dailyCalories ? 'text-red-500' : 'text-green-500'}`}>
                    {totals.calories - profileData.dailyCalories > 0 ? '+' : ''}{Math.round(totals.calories - profileData.dailyCalories)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 3. Weekly Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Прогрес тижня</h2>
                <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                  +12% покращення
                </Badge>
              </div>
              
              <div className="space-y-4">
                {/* Calories Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Калорії</span>
                    <span className="font-medium">{profileData.weeklyProgress.calories.current}/{profileData.weeklyProgress.calories.goal}</span>
                  </div>
                  <Progress value={profileData.weeklyProgress.calories.percentage} className="h-2" />
                </div>

                {/* Workouts Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Тренування</span>
                    <span className="font-medium">{profileData.weeklyProgress.workouts.completed}/{profileData.weeklyProgress.workouts.goal}</span>
                  </div>
                  <Progress value={profileData.weeklyProgress.workouts.percentage} className="h-2" />
                </div>

                {/* Sleep Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Сон</span>
                    <span className="font-medium">{profileData.weeklyProgress.sleep.average}h/8h</span>
                  </div>
                  <Progress value={profileData.weeklyProgress.sleep.percentage} className="h-2" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 4. Activity Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Nutrition */}
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-500" />
                </div>
                <span className="font-medium">Харчування</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-500">{profileData.weeklyProgress.calories.percentage}%</div>
                <div className="text-xs text-muted-foreground">від плану</div>
              </div>
            </Card>

            {/* Activity */}
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <span className="font-medium">Активність</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-500">{profileData.weeklyProgress.workouts.percentage}%</div>
                <div className="text-xs text-muted-foreground">тренувань</div>
              </div>
            </Card>

            {/* Recovery */}
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:shadow-lg transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-purple-500" />
                </div>
                <span className="font-medium">Відновлення</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-500">{profileData.weeklyProgress.sleep.percentage}%</div>
                <div className="text-xs text-muted-foreground">сон</div>
              </div>
            </Card>
          </motion.div>

          {/* 5. AI Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-indigo-600/5 border border-violet-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Insight</h3>
                    <p className="text-xs text-muted-foreground">Персональні рекомендації</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshInsight}
                  disabled={isLoadingInsight}
                  className="text-violet-500 hover:text-violet-600"
                >
                  {isLoadingInsight ? (
                    <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  ) : (
                    "Оновити"
                  )}
                </Button>
              </div>
              
              <div className="space-y-3">
                {isLoadingInsight ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    Аналізую твої дані...
                  </div>
                ) : aiInsight ? (
                  <div className="text-sm whitespace-pre-line">
                    {aiInsight.split('\n').map((line, index) => {
                      if (line.startsWith('🔹') || line.startsWith('🔍') || line.startsWith('💡') || line.startsWith('📈')) {
                        return (
                          <div key={index} className="mb-2">
                            <span className="font-semibold text-violet-500">{line}</span>
                          </div>
                        );
                      }
                      return <div key={index} className="mb-1">{line}</div>;
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Натисни "Оновити" для отримання персональних рекомендацій
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* 6. Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Досягнення</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAchievements}
                  className="text-primary hover:text-primary/80"
                >
                  Всі досягнення
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
          </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {profileData.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex-shrink-0"
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 border border-yellow-400/30 shadow-lg' 
                        : 'bg-muted/30 border border-muted/50'
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.unlocked ? 'text-yellow-500' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <p className="text-xs text-center mt-2 max-w-16 truncate">
                      {achievement.title}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* 7. Activity Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Активність</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewStatistics}
                  className="text-primary hover:text-primary/80"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Статистика
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {profileData.activityHeatmap.slice(-28).map((day, index) => (
                  <div
                    key={day.date}
                    className={`aspect-square rounded-lg transition-all duration-200 hover:scale-110 ${
                      day.intensity === 0 ? 'bg-muted/20' :
                      day.intensity === 1 ? 'bg-green-400/30' :
                      day.intensity === 2 ? 'bg-green-400/50' :
                      day.intensity === 3 ? 'bg-green-500/60' :
                      day.intensity === 4 ? 'bg-green-500/80' :
                      'bg-green-600'
                    }`}
                    title={`${day.date}: ${day.intensity}/4 активність`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Останні 28 днів активності
              </p>
            </Card>
          </motion.div>

          {/* 8. Motivation Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold text-primary">
                  Ти на правильному шляху — продовжуй у тому ж дусі! 💜
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ще 250 XP до рівня {profileData.level + 1} — не здавайся!
                </p>
                <Button
                  onClick={handleViewStatistics}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Побачити мій тижневий звіт
                </Button>
              </div>
            </Card>
          </motion.div>

        </main>
        <MobileBottomNav />

        {/* Модальне вікно для додавання ваги */}
        <Dialog open={weightModalOpen} onOpenChange={setWeightModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Трекер ваги</DialogTitle>
              <DialogDescription className="sr-only">
                Введіть вашу поточну вагу для відстеження змін.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight-value">Введіть поточну вагу (кг)</Label>
                <Input
                  id="weight-value"
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder={profileData.currentWeight.toString()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleWeightSubmit} className="flex-1">Зберегти</Button>
                <Button variant="outline" onClick={() => setWeightModalOpen(false)}>Скасувати</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
