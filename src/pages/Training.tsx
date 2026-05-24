import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WorkoutHeaderStats } from "@/components/WorkoutHeaderStats";
import { WorkoutTabs } from "@/components/WorkoutTabs";
import { WorkoutCalendarView } from "@/components/WorkoutCalendarView";
import { WorkoutCurrentDay } from "@/components/WorkoutCurrentDay";
import { WorkoutQuickActions } from "@/components/WorkoutQuickActions";
import { WorkoutMotivationFeed } from "@/components/WorkoutMotivationFeed";
import { WorkoutAnalytics } from "@/components/WorkoutAnalytics";
import { WorkoutGoalsTracker } from "@/components/WorkoutGoalsTracker";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { WorkoutConstructor } from "@/components/WorkoutConstructor";
import { AIWorkoutGenerator } from "@/components/AIWorkoutGenerator";
import { Card } from "@/components/ui/card";
import { Activity, Calendar, Trophy, Target } from "lucide-react";
import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useI18n } from "@/hooks/useI18n";
import { toast } from "sonner";

export default function Training() {
  const { t } = useI18n();
  const { 
    plannedWorkouts, 
    completedWorkouts, 
    workoutStats, 
    personalRecords,
    workoutGoals,
    isLiveMode,
    currentWorkout
  } = useWorkouts();
  
  const [activeTab, setActiveTab] = useState<"calendar" | "analytics" | "goals" | "library" | "constructor">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  // {t("dashboardStats")}
  const dashboardStats = {
    totalWorkouts: workoutStats.totalWorkouts,
    thisWeekWorkouts: plannedWorkouts.filter(w => {
      const workoutDate = new Date(w.scheduledDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length,
    personalRecords: personalRecords.length,
    activeGoals: workoutGoals.filter(g => !g.isCompleted).length,
    completedGoals: workoutGoals.filter(g => g.isCompleted).length
  };

  // Обработчики для новых компонентов
  const handleAddWorkout = () => {
    setActiveTab("constructor");
    toast.info("Перехід до конструктора тренувань");
  };

  const handleStartWorkout = () => {
    toast.info("Початок тренування");
  };

  const handleSetGoal = () => {
    setActiveTab("goals");
    toast.info("Перехід до цілей");
  };

  const handleOpenLibrary = () => {
    setActiveTab("library");
    toast.info("Перехід до бібліотеки вправ");
  };

  const handleTakeRest = () => {
    toast.info("Час відпочинку!");
  };

  const handleWorkoutClick = (workout: any) => {
    toast.info(`Перегляд тренування: ${workout.name}`);
  };

  const handleViewWorkout = (workout: any) => {
    toast.info(`Деталі тренування: ${workout.name}`);
  };

  const handleAIWorkoutStart = (workout: any) => {
    toast.success(t("aiWorkoutStarted"));
    // {t("aiWorkoutLogic")}
  };

  // Получение тренировки на сегодня
  const todayWorkout = plannedWorkouts.find(w => {
    const workoutDate = new Date(w.scheduledDate);
    const today = new Date();
    return workoutDate.toDateString() === today.toDateString();
  });

  // Преобразование данных для календаря
  const calendarWorkouts = [...plannedWorkouts, ...completedWorkouts].map(workout => ({
    id: workout.id,
    date: new Date((workout as any).scheduledDate || (workout as any).completedAt).toISOString().split('T')[0],
    type: (workout as any).type || "strength",
    name: workout.name,
    duration: (workout as any).duration || 60,
    isCompleted: completedWorkouts.some(cw => cw.id === workout.id)
  }));

  const getTabContent = () => {
    switch (activeTab) {
      case "calendar":
        return (
          <div className="space-y-6">
            {/* Current Day Workout */}
            <WorkoutCurrentDay
              todayWorkout={todayWorkout ? {
                id: todayWorkout.id,
                name: todayWorkout.name,
                type: (todayWorkout as any).type || "strength",
                duration: (todayWorkout as any).duration || 60,
                exercises: (todayWorkout as any).exercises?.length || 0,
                isCompleted: completedWorkouts.some(cw => cw.id === todayWorkout.id),
                progress: completedWorkouts.some(cw => cw.id === todayWorkout.id) ? 100 : 0
              } : undefined}
              onStartWorkout={handleStartWorkout}
              onAddWorkout={handleAddWorkout}
              onViewWorkout={handleViewWorkout}
            />

            {/* Calendar */}
            <WorkoutCalendarView
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              workouts={calendarWorkouts}
              onWorkoutClick={handleWorkoutClick}
            />

            {/* Quick Actions */}
            <WorkoutQuickActions
              onStartWorkout={handleStartWorkout}
              onSetGoal={handleSetGoal}
              onOpenLibrary={handleOpenLibrary}
              onTakeRest={handleTakeRest}
              onAddWorkout={handleAddWorkout}
            />

            {/* Motivation Feed */}
            <WorkoutMotivationFeed
              currentStreak={3} // TODO: Get from stats
              weeklyGoal={3}
              weeklyProgress={dashboardStats.thisWeekWorkouts}
              achievements={[
                {
                  id: "1",
                  title: "Перше тренування",
                  description: "Ви почали свій фітнес-шлях",
                  type: "milestone",
                  date: "2024-01-01"
                }
              ]}
            />
          </div>
        );

      case "analytics":
        return <WorkoutAnalytics />;

      case "goals":
        return <WorkoutGoalsTracker />;

      case "library":
        return <ExerciseLibrary />;

      case "constructor":
        return (
          <div className="space-y-6">
            <AIWorkoutGenerator
              userGoals={["Похудение", "Сила"]}
              userLevel="intermediate"
              availableTime={45}
              onStartWorkout={handleAIWorkoutStart}
            />
            <WorkoutConstructor />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-4 pb-20 md:pb-8 md:p-8 max-w-6xl mx-auto w-full">
          {/* Header Stats */}
          <WorkoutHeaderStats
            totalWorkouts={dashboardStats.totalWorkouts}
            thisWeekWorkouts={dashboardStats.thisWeekWorkouts}
            weeklyGoal={3}
            onAddWorkout={handleAddWorkout}
            isLiveMode={isLiveMode}
          />

          {/* Tabs Navigation */}
          <WorkoutTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          {getTabContent()}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}