import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Clock, 
  Flame, 
  Play, 
  Plus,
  Target,
  Calendar,
  Dumbbell,
  Zap,
  Wind,
  CheckCircle
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useDaily } from "@/hooks/useDaily";
import { useWorkouts } from "@/hooks/useWorkouts";
import { PlannedWorkout, CompletedWorkout } from "@/lib/workout-types";

interface ActivityWidgetProps {
  onStartWorkout: () => void;
  onAddWorkout: () => void;
}

export function ActivityWidget({ onStartWorkout, onAddWorkout }: ActivityWidgetProps) {
  const { totals } = useDaily();
  const { getWorkoutsByDate, startWorkout } = useWorkouts();
  
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayWorkoutsData = useMemo(() => getWorkoutsByDate(today), [getWorkoutsByDate, today]);
  
  const todayWorkouts = useMemo(() => {
    return [
      ...todayWorkoutsData.planned,
      ...todayWorkoutsData.completed
    ];
  }, [todayWorkoutsData]);

  const completedWorkouts = useMemo(() => {
    return new Set(todayWorkoutsData.completed.map(w => w.id));
  }, [todayWorkoutsData.completed]);

  const dailyStats = useMemo(() => {
    const totalMinutes = todayWorkoutsData.completed.reduce((sum, w) => sum + (w.duration || 0), 0);
    return {
      totalMinutes,
      caloriesBurned: totals.calories, // This is combined food/exercise in some apps, but here we'll use it as sync target
      steps: totals.steps
    };
  }, [todayWorkoutsData.completed, totals.calories, totals.steps]);


  const getWorkoutType = (workout: PlannedWorkout | CompletedWorkout): string => {
    // Try to get type from first exercise
    if (workout.exercises && workout.exercises.length > 0) {
      return workout.exercises[0].exercise.exerciseType;
    }
    return 'mixed';
  };

  const getWorkoutDuration = (workout: PlannedWorkout | CompletedWorkout): number => {
    if ('duration' in workout) return workout.duration;
    if ('actualDuration' in workout && workout.actualDuration) return workout.actualDuration;
    return 0;
  };

  const getWorkoutScheduledTime = (workout: PlannedWorkout | CompletedWorkout): string | undefined => {
    if ('scheduledDate' in workout) {
      const date = new Date(workout.scheduledDate);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if ('startTime' in workout) {
      const date = new Date(workout.startTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return undefined;
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return Dumbbell;
      case 'cardio': return Zap;
      case 'flexibility': return Wind;
      default: return Activity;
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'cardio': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'flexibility': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleStartWorkout = (workoutId: string) => {
    startWorkout(workoutId);
    onStartWorkout();
  };

  const getNextWorkout = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    return todayWorkouts.find(workout => {
      if (completedWorkouts.has(workout.id)) return false;
      const scheduledTime = getWorkoutScheduledTime(workout);
      if (!scheduledTime) return false;
      const [hours] = scheduledTime.split(':').map(Number);
      return hours > currentHour;
    });
  };

  const getCurrentWorkout = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    return todayWorkouts.find(workout => {
      if (completedWorkouts.has(workout.id)) return false;
      const scheduledTime = getWorkoutScheduledTime(workout);
      if (!scheduledTime) return false;
      const [hours] = scheduledTime.split(':').map(Number);
      return Math.abs(hours - currentHour) <= 1; // В течение часа
    });
  };

  const nextWorkout = getNextWorkout();
  const currentWorkout = getCurrentWorkout();
  const completedCount = completedWorkouts.size;
  const totalWorkouts = todayWorkouts.length;
  const hasScheduledWorkouts = todayWorkouts.some(w => 'scheduledDate' in w);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold">Активність</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {completedCount}/{totalWorkouts} виконано
        </Badge>
      </div>

      {/* Статистика дня */}
        <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Clock className="w-3 h-3" />
            <span>Час</span>
          </div>
          <div className="font-semibold text-sm">{dailyStats.totalMinutes} хв</div>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Flame className="w-3 h-3" />
            <span>Калорії</span>
          </div>
          <div className="font-semibold text-sm">{dailyStats.caloriesBurned}</div>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <Target className="w-3 h-3" />
            <span>Кроки</span>
          </div>
          <div className="font-semibold text-sm">{dailyStats.steps.toLocaleString()}</div>
        </div>
      </div>

      {/* Умная логика отображения тренировок */}
      {hasScheduledWorkouts ? (
        // Сценарий 1: Есть запланированные тренировки
        (currentWorkout || nextWorkout) ? (
          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const type = getWorkoutType(currentWorkout || nextWorkout || todayWorkouts[0]);
                  const IconComponent = getWorkoutTypeIcon(type);
                  return <IconComponent className="w-6 h-6 text-primary" />;
                })()}
                <div>
                  <h4 className="font-semibold text-base">
                    {currentWorkout ? 'Час тренування!' : 'Сьогодні за планом:'}
                  </h4>
                  <p className="font-medium text-sm">{(currentWorkout || nextWorkout)!.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{getWorkoutDuration(currentWorkout || nextWorkout || todayWorkouts[0])} хв</span>
                    {getWorkoutScheduledTime(currentWorkout || nextWorkout || todayWorkouts[0]) && (
                      <>
                        <span>•</span>
                        <span>{getWorkoutScheduledTime(currentWorkout || nextWorkout || todayWorkouts[0])}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Badge className={`text-xs ${getWorkoutTypeColor(getWorkoutType(currentWorkout || nextWorkout || todayWorkouts[0]))}`}>
                {(() => {
                  const type = getWorkoutType(currentWorkout || nextWorkout || todayWorkouts[0]);
                  return type === 'strength' ? 'Силова' :
                         type === 'cardio' ? 'Кардіо' :
                         type === 'flexibility' ? 'Гнучкість' : 'Змішана';
                })()}
              </Badge>
            </div>
            <Button 
              size="lg" 
              className="w-full gap-2 h-12 text-base font-medium"
              onClick={() => handleStartWorkout((currentWorkout || nextWorkout)!.id)}
            >
              <Play className="w-5 h-5" />
              {currentWorkout ? 'Почати зараз!' : 'Почати тренування'}
            </Button>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
            <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Чудово!</h4>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">Всі заплановані тренування виконані</p>
            <Button size="sm" variant="outline" onClick={onAddWorkout} className="gap-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
              <Plus className="w-4 h-4" />
              Додати ще
            </Button>
          </div>
        )
      ) : (
        // Сценарий 2: Нет запланированных тренировок
        <div className="mb-4 space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Немає запланованих тренувань на сьогодні
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onStartWorkout} 
              className="gap-2 h-10"
            >
              <Play className="w-4 h-4" />
              Вільне тренування
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onAddWorkout} 
              className="gap-2 h-10"
            >
              <Plus className="w-4 h-4" />
              Записати активність
            </Button>
          </div>
        </div>
      )}

      {/* Список тренировок */}
      {todayWorkouts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Тренування на сьогодні</h4>
          {todayWorkouts.map((workout) => (
            <div 
              key={workout.id} 
              className={`flex items-center justify-between p-2 rounded-lg border ${
                completedWorkouts.has(workout.id) 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const type = getWorkoutType(workout);
                  const IconComponent = getWorkoutTypeIcon(type);
                  return <IconComponent className="w-4 h-4 text-muted-foreground" />;
                })()}
                <div>
                  <p className={`text-sm font-medium ${
                    completedWorkouts.has(workout.id) ? 'line-through text-muted-foreground' : ''
                  }`}>
                    {workout.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getWorkoutDuration(workout)} хв
                    {getWorkoutScheduledTime(workout) && ` • ${getWorkoutScheduledTime(workout)}`}
                  </p>
                </div>
              </div>
              {completedWorkouts.has(workout.id) ? (
                <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                  Виконано
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 text-xs"
                  onClick={() => handleStartWorkout(workout.id)}
                >
                  Почати
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
