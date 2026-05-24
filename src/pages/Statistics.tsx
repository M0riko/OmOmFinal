import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HugeiconsIcon } from '@hugeicons/react';
import { BodyWeightIcon, KitchenUtensilsIcon, Dumbbell03Icon, DropletIcon, Moon02Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { motion } from "framer-motion";

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

  // Mock data for statistics
  const statisticsData = useMemo(() => ({
    weight: {
      current: 70.5,
      target: 65,
      history: generateWeightHistory(),
      trend: -0.3,
      bmi: 22.1
    },
    nutrition: {
      dailyCalories: 1850,
      targetCalories: 2000,
      macros: { protein: 45, carbs: 35, fat: 20 },
      history: generateNutritionHistory()
    },
    workouts: {
      thisWeek: 4,
      lastWeek: 3,
      totalTime: 180,
      caloriesBurned: 1200,
      history: generateWorkoutHistory()
    },
    water: {
      today: 2.1,
      target: 2.5,
      history: generateWaterHistory()
    },
    sleep: {
      lastNight: 7.5,
      average: 7.2,
      target: 8,
      history: generateSleepHistory()
    }
  }), []);

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
              <Button onClick={handleExportPDF} variant="outline" className="gap-2 rounded-xl h-10">
                <HugeiconsIcon icon={Download04Icon} size={18} />
                Експорт PDF
              </Button>
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
      </div>
    </div>
  );
}

// Mock data generators
function generateWeightHistory() {
  const data = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({ date: date.toISOString().split('T')[0], weight: 72 - (i * 0.05) + (Math.random() - 0.5) * 0.5 });
  }
  return data;
}

function generateNutritionHistory() {
  const data = [];
  const today = new Date();
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({ date: date.toISOString().split('T')[0], calories: 1800 + Math.random() * 400, protein: 40 + Math.random() * 20, carbs: 35 + Math.random() * 15, fat: 20 + Math.random() * 10 });
  }
  return data;
}

function generateWorkoutHistory() {
  const data = [];
  const today = new Date();
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({ date: date.toISOString().split('T')[0], duration: Math.random() > 0.3 ? 30 + Math.random() * 60 : 0, calories: Math.random() > 0.3 ? 200 + Math.random() * 400 : 0 });
  }
  return data;
}

function generateWaterHistory() {
  const data = [];
  const today = new Date();
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({ date: date.toISOString().split('T')[0], amount: 1.5 + Math.random() * 1.5 });
  }
  return data;
}

function generateSleepHistory() {
  const data = [];
  const today = new Date();
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({ date: date.toISOString().split('T')[0], hours: 6 + Math.random() * 3 });
  }
  return data;
}
