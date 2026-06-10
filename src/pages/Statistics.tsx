import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from '@hugeicons/react';
import { BodyWeightIcon, KitchenUtensilsIcon, Dumbbell03Icon, DropletIcon, Moon02Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDaily } from "@/hooks/useDaily";
import { useWater } from "@/hooks/useWater";
import { useWeight } from "@/hooks/useWeight";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

// Statistics components
import { WeightChart } from "@/components/WeightChart";
import { NutritionChart } from "@/components/NutritionChart";
import { WorkoutTrends } from "@/components/WorkoutTrends";
import { WaterChart } from "@/components/WaterChart";
import { SleepChart } from "@/components/SleepChart";
import { AIInsights } from "@/components/AIInsights";
import { AIAnalyticsPanel } from "@/components/AIAnalyticsPanel";

export default function Statistics() {
  const [activeTab, setActiveTab] = useState("weight");

  const tabs = [
    { id: "weight", label: "Вага", icon: BodyWeightIcon },
    { id: "nutrition", label: "Харчування", icon: KitchenUtensilsIcon },
    { id: "workouts", label: "Тренування", icon: Dumbbell03Icon },
    { id: "water", label: "Вода", icon: DropletIcon },
    { id: "sleep", label: "Сон", icon: Moon02Icon },
  ];

  const [statsData, setStatsData] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const { user } = useAuth();
  const { entries: weightEntries, currentWeight, getWeightTrend, addWeight } = useWeight();
  const { totals: dailyTotals } = useDaily();
  const { waterGoal, todayWater } = useWater();

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('omomo_auth_token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const statisticsData = useMemo(() => {
    // 1. Weight Data
    const currentW = currentWeight || user?.weight || 70.0;
    const targetW = user?.targetWeight || (currentW - 5.0);
    const bmi = parseFloat((currentW / (((user?.height || 170) / 100) ** 2)).toFixed(1));
    
    // Convert weightEntries to history sorted by date ascending
    const sortedWeightEntries = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
    const weightHistory = sortedWeightEntries.map(e => ({
      date: e.date,
      weight: e.weight
    }));
    
    // If no weight history, seed with current weight
    if (weightHistory.length === 0) {
      weightHistory.push({
        date: new Date().toISOString().split('T')[0],
        weight: currentW
      });
    }

    const rawTrend = getWeightTrend();
    const trend = rawTrend !== null ? rawTrend : 0;

    // 2. Nutrition Data
    const dailyCalories = dailyTotals.calories || 0;
    const targetCalories = user?.calculatedCalories || 2000;
    
    // Macros percentages
    const totalGrams = dailyTotals.protein + dailyTotals.carbs + dailyTotals.fats;
    const macros = totalGrams > 0 ? {
      protein: Math.round((dailyTotals.protein / totalGrams) * 100),
      carbs: Math.round((dailyTotals.carbs / totalGrams) * 100),
      fat: Math.round((dailyTotals.fats / totalGrams) * 100)
    } : { protein: 30, carbs: 45, fat: 25 };

    // Nutrition History
    let historyList = statsData?.history?.stats || [];
    
    // Filter out leading empty days to avoid "fake" zeroes before the user started
    let firstActiveIndex = historyList.findIndex((s: any) => 
      s.calories > 0 || s.steps > 0 || s.water > 0 || s.sleepHours > 0 || s.weight > 0
    );
    if (firstActiveIndex !== -1) {
      historyList = historyList.slice(firstActiveIndex);
    } else {
      historyList = [historyList[historyList.length - 1]].filter(Boolean); // Only today if exists
    }

    const nutritionHistory = historyList.slice(-8).map((s: any) => ({
      date: s.date,
      calories: s.calories || 0,
      protein: s.protein || 0,
      carbs: s.carbs || 0,
      fat: s.fat || 0
    }));

    // Seed history only if completely empty AND we don't have ANY stats from backend (for new users)
    if (nutritionHistory.length === 0 && (!historyList || historyList.length === 0)) {
      nutritionHistory.push({
        date: new Date().toISOString().split('T')[0],
        calories: dailyCalories,
        protein: dailyTotals.protein,
        carbs: dailyTotals.carbs,
        fat: dailyTotals.fats
      });
    }

    // 3. Workouts Data
    const workouts = statsData?.history?.workouts || [];
    let thisWeekWorkouts = 0;
    let lastWeekWorkouts = 0;
    let totalTime = 0;
    let workoutCaloriesBurned = 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const workoutHistoryMap = new Map<string, { duration: number; calories: number }>();
    
    // Fill workout history map only with the dates we have in historyList
    historyList.slice(-14).forEach((s: any) => {
      workoutHistoryMap.set(s.date, { duration: 0, calories: 0 });
    });

    workouts.forEach((w: any) => {
      const wDate = new Date(w.date);
      if (wDate >= sevenDaysAgo) {
        thisWeekWorkouts++;
        workoutCaloriesBurned += w.calories || w.caloriesBurned || 0;
      } else if (wDate >= fourteenDaysAgo) {
        lastWeekWorkouts++;
      }
      totalTime += w.duration || 0;

      if (workoutHistoryMap.has(w.date)) {
        const prev = workoutHistoryMap.get(w.date)!;
        workoutHistoryMap.set(w.date, {
          duration: prev.duration + (w.duration || 0),
          calories: prev.calories + (w.calories || w.caloriesBurned || 0)
        });
      }
    });

    const workoutHistory = Array.from(workoutHistoryMap.entries()).map(([date, val]) => ({
      date,
      duration: val.duration,
      calories: val.calories
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 4. Water Data
    const waterHistory = historyList.slice(-8).map((s: any) => ({
      date: s.date,
      amount: s.water || 0
    }));
    // Make sure today has the latest value
    const todayStr = new Date().toISOString().split('T')[0];
    const todayWaterIdx = waterHistory.findIndex((w: any) => w.date === todayStr);
    if (todayWaterIdx !== -1) {
      waterHistory[todayWaterIdx].amount = todayWater;
    } else {
      waterHistory.push({ date: todayStr, amount: todayWater });
    }

    // 5. Sleep Data
    const sleepHistory = historyList.slice(-8).map((s: any) => ({
      date: s.date,
      hours: s.sleepHours || 0
    }));
    const todaySleepIdx = sleepHistory.findIndex((s: any) => s.date === todayStr);
    if (todaySleepIdx !== -1) {
      sleepHistory[todaySleepIdx].hours = dailyTotals.sleepHours;
    } else {
      sleepHistory.push({ date: todayStr, hours: dailyTotals.sleepHours });
    }

    const sleepLastNight = dailyTotals.sleepHours || (sleepHistory[sleepHistory.length - 1]?.hours) || 0;
    const activeSleepHours = sleepHistory.filter((s: any) => s.hours > 0);
    const sleepAverage = activeSleepHours.length > 0
      ? activeSleepHours.reduce((acc: number, s: any) => acc + s.hours, 0) / activeSleepHours.length
      : 0;

    return {
      weight: {
        current: currentW,
        target: targetW,
        history: weightHistory,
        trend,
        bmi
      },
      nutrition: {
        dailyCalories,
        targetCalories,
        macros,
        history: nutritionHistory
      },
      workouts: {
        thisWeek: thisWeekWorkouts,
        lastWeek: lastWeekWorkouts,
        totalTime,
        caloriesBurned: workoutCaloriesBurned,
        history: workoutHistory
      },
      water: {
        today: todayWater,
        target: waterGoal,
        history: waterHistory
      },
      sleep: {
        lastNight: sleepLastNight,
        average: sleepAverage,
        target: 8.0,
        history: sleepHistory
      }
    };
  }, [statsData, weightEntries, currentWeight, dailyTotals, waterGoal, todayWater, user]);

  const handleExportPDF = () => {
    console.log("Експорт статистики в PDF...");
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "weight": return <WeightChart data={statisticsData.weight} />;
      case "nutrition": return <NutritionChart data={statisticsData.nutrition} />;
      case "workouts": return <WorkoutTrends data={statisticsData.workouts} />;
      case "water": return <WaterChart data={statisticsData.water} />;
      case "sleep": return <SleepChart data={statisticsData.sleep} />;
      default: return <WeightChart data={statisticsData.weight} />;
    }
  };

  if (isLoadingStats) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <MobileHeader />
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground animate-pulse font-medium">Завантаження статистики...</p>
            </div>
          </div>
          <MobileBottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-4 pb-20 md:pb-8 md:p-8 space-y-6 max-w-6xl mx-auto w-full min-w-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Статистика</h1>
                <p className="text-muted-foreground mt-1">Аналіз твого прогресу та досягнень</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setWeightModalOpen(true)} variant="outline" className="gap-2 rounded-xl h-10">
                  Оновити вагу
                </Button>
                <Button onClick={handleExportPDF} variant="outline" className="gap-2 rounded-xl h-10 hidden sm:flex">
                  <HugeiconsIcon icon={Download04Icon} size={18} />
                  Експорт PDF
                </Button>
              </div>
            </div>
          </motion.div>

          {/* AI Analytics Panel */}
          <AIAnalyticsPanel userData={statisticsData} timeRange="month" />

          {/* AI Insights */}
          <AIInsights data={statisticsData} />

          {/* Statistics Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 bg-card border border-border shadow-card rounded-2xl">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full overflow-auto mb-6 bg-muted/50 rounded-xl p-1">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg"
                    >
                      <HugeiconsIcon icon={tab.icon} size={18} strokeWidth={1.5} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {getTabContent()}
                </TabsContent>
              </Tabs>
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
                <Label htmlFor="weight-value-stats">Введіть поточну вагу (кг)</Label>
                <Input
                  id="weight-value-stats"
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder={(currentWeight || user?.weight || 0).toString()}
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


