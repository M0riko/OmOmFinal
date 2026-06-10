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
import { LiveWorkoutMode } from "@/components/LiveWorkoutMode";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, Trophy, Target } from "lucide-react";
import { useState, useEffect } from "react";
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
    currentWorkout,
    startWorkout,
    completeWorkout,
    cancelWorkout,
    planWorkout
  } = useWorkouts();
  
  const [activeTab, setActiveTab] = useState<"calendar" | "analytics" | "goals" | "library" | "constructor">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);

  useEffect(() => {
    if (isResting && restTime > 0) {
      const timer = setTimeout(() => setRestTime(restTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTime === 0) {
      setIsResting(false);
      toast.success(locale === "uk" ? "Час відпочинку закінчився!" : "Rest time is over!");
    }
  }, [isResting, restTime]);

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

  const handleSaveConstructorWorkout = (workoutDay: any) => {
    const plannedWorkout = {
      name: workoutDay.nameUk || workoutDay.name,
      exercises: workoutDay.exercises.map((ex: any) => ({
        ...ex,
        sets: ex.sets.map((set: any) => ({ ...set, isCompleted: false }))
      })),
      scheduledDate: currentDate.toISOString(),
      isCompleted: false
    };
    planWorkout(plannedWorkout);
    setActiveTab("calendar");
  };

  const handleStartWorkout = () => {
    if (todayWorkout) {
      startWorkout(todayWorkout.id);
    } else {
      toast.info("На сьогодні немає запланованих тренувань");
    }
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
    setRestTime(60);
    setIsResting(true);
  };

  const handleWorkoutClick = (workout: any) => {
    setSelectedWorkout(workout);
  };

  const handleViewWorkout = (workout: any) => {
    setSelectedWorkout(workout);
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
            <WorkoutConstructor onSaveWorkout={handleSaveConstructorWorkout} />
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

        {/* Live режим */}
        {isLiveMode && currentWorkout && (
          <Dialog open={isLiveMode} onOpenChange={(open) => !open && cancelWorkout()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sr-only">
                <DialogTitle>Тренування: {currentWorkout.name}</DialogTitle>
              </DialogHeader>
              <LiveWorkoutMode
                workout={currentWorkout}
                onComplete={completeWorkout}
                onCancel={cancelWorkout}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Деталі тренування */}
        {selectedWorkout && (
          <Dialog open={!!selectedWorkout} onOpenChange={(open) => !open && setSelectedWorkout(null)}>
            <DialogContent className="max-w-md rounded-2xl bg-card border border-border/40">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedWorkout.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-xl border border-border/20">
                  <span className="text-muted-foreground font-medium">{t("workoutType") || "Тип"}</span>
                  <span className="font-bold capitalize">{selectedWorkout.type === 'strength' ? (t("strengthTraining") || 'Силове') : (t("cardioTraining") || 'Кардіо')}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-xl border border-border/20">
                  <span className="text-muted-foreground font-medium">{t("duration") || "Тривалість"}</span>
                  <span className="font-bold">{selectedWorkout.duration} {t("min") || "хв"}</span>
                </div>
                
                {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                      {t("exercises") || "Вправи"}
                    </h4>
                    <ul className="space-y-2">
                      {selectedWorkout.exercises.map((ex: any, i: number) => (
                        <li key={i} className="flex justify-between items-center p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-muted/30 transition-colors">
                          <span className="font-semibold text-sm">{ex.name}</span>
                          <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">
                            {ex.sets.length} {t("sets") || "підходів"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm">Ця програма тренування ще не має вправ.</p>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" className="rounded-xl flex-1" onClick={() => setSelectedWorkout(null)}>
                    {t("cancel") || "Закрити"}
                  </Button>
                  <Button 
                    className="rounded-xl flex-1 shadow-md shadow-primary/20" 
                    onClick={() => {
                       startWorkout(selectedWorkout.id);
                       setSelectedWorkout(null);
                    }}
                  >
                    {t("startWorkout") || "Почати"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Таймер відпочинку */}
        <Dialog open={isResting} onOpenChange={setIsResting}>
          <DialogContent className="max-w-xs text-center rounded-3xl border border-border/50 bg-card p-8">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">{t("restTime") || "Час відпочинку"}</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <div className="text-7xl font-black text-primary mb-6 tabular-nums tracking-tighter">
                {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}
              </div>
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all font-bold" 
                onClick={() => setIsResting(false)}
              >
                Завершити відпочинок
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}