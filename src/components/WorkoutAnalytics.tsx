import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Dumbbell,
  Target,
  Trophy,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Zap,
  Award,
  Star,
  Users,
  Flame
} from "lucide-react";
import { useState, useMemo } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { MUSCLE_GROUP_LABELS } from "@/lib/workout-types";

export function WorkoutAnalytics() {
  const { workoutStats, completedWorkouts, personalRecords } = useWorkouts();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedExercise, setSelectedExercise] = useState<string>('all');

  // Фильтрация данных по времени
  const filteredWorkouts = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return completedWorkouts.filter(workout => 
      new Date(workout.endTime) >= filterDate
    );
  }, [completedWorkouts, timeRange]);

  // Статистика по времени
  const timeStats = useMemo(() => {
    const totalDuration = filteredWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
    const totalVolume = filteredWorkouts.reduce((sum, workout) => sum + workout.totalVolume, 0);
    const averageDuration = filteredWorkouts.length > 0 ? totalDuration / filteredWorkouts.length : 0;
    const averageVolume = filteredWorkouts.length > 0 ? totalVolume / filteredWorkouts.length : 0;

    return {
      totalWorkouts: filteredWorkouts.length,
      totalDuration,
      totalVolume,
      averageDuration,
      averageVolume
    };
  }, [filteredWorkouts]);

  // Прогресс по упражнениям
  const exerciseProgress = useMemo(() => {
    const progress: Record<string, Array<{ date: string; maxWeight: number; maxReps: number }>> = {};
    
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const key = exercise.exercise.id;
        if (!progress[key]) {
          progress[key] = [];
        }
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
        const maxReps = Math.max(...exercise.sets.map(set => set.reps));
        progress[key].push({
          date: workout.endTime,
          maxWeight,
          maxReps
        });
      });
    });

    return progress;
  }, [filteredWorkouts]);

  // Частота тренировки мышечных групп
  const muscleGroupStats = useMemo(() => {
    const stats: Record<string, number> = {};
    
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const group = exercise.exercise.primaryMuscleGroup;
        stats[group] = (stats[group] || 0) + 1;
      });
    });

    return Object.entries(stats)
      .map(([group, count]) => ({
        group,
        label: MUSCLE_GROUP_LABELS[group as keyof typeof MUSCLE_GROUP_LABELS],
        count,
        percentage: (count / filteredWorkouts.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredWorkouts]);

  // Личные рекорды за период
  const recentRecords = useMemo(() => {
    return personalRecords.filter(record => {
      const recordDate = new Date(record.date);
      const filterDate = new Date();
      
      switch (timeRange) {
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(filterDate.getFullYear() - 1);
          break;
      }

      return recordDate >= filterDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [personalRecords, timeRange]);

  // Топ упражнения
  const topExercises = useMemo(() => {
    const exerciseCount: Record<string, { name: string; count: number }> = {};
    
    filteredWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const key = exercise.exercise.id;
        if (!exerciseCount[key]) {
          exerciseCount[key] = { name: exercise.exercise.nameUk, count: 0 };
        }
        exerciseCount[key].count++;
      });
    });

    return Object.entries(exerciseCount)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredWorkouts]);

  // Недельная статистика
  const weeklyStats = useMemo(() => {
    const weeks: Record<string, { workouts: number; duration: number; volume: number }> = {};
    
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.endTime);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { workouts: 0, duration: 0, volume: 0 };
      }
      
      weeks[weekKey].workouts++;
      weeks[weekKey].duration += workout.duration;
      weeks[weekKey].volume += workout.totalVolume;
    });

    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8); // Последние 8 недель
  }, [filteredWorkouts]);

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div>
          <h2 className="text-2xl font-bold">Аналітика тренувань</h2>
          <p className="text-muted-foreground">
            Аналіз прогресу та статистика тренувань
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Тиждень</SelectItem>
              <SelectItem value="month">Місяць</SelectItem>
              <SelectItem value="year">Рік</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Тренувань</p>
              <p className="text-2xl font-bold">{timeStats.totalWorkouts}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Час (хв)</p>
              <p className="text-2xl font-bold">{timeStats.totalDuration}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Об'єм (кг)</p>
              <p className="text-2xl font-bold">{timeStats.totalVolume}</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Dumbbell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Середня тривалість</p>
              <p className="text-2xl font-bold">{Math.round(timeStats.averageDuration)}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="progress">Прогрес</TabsTrigger>
          <TabsTrigger value="muscles">М'язові групи</TabsTrigger>
          <TabsTrigger value="records">Рекорди</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-6">
          {/* Недельная статистика */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Тижнева статистика</h3>
                <p className="text-sm text-muted-foreground">
                  Динаміка тренувань за останні тижні
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between h-32 gap-2">
                {weeklyStats.map(([week, stats]) => {
                  const maxWorkouts = Math.max(...weeklyStats.map(([, s]) => s.workouts));
                  const height = maxWorkouts > 0 ? (stats.workouts / maxWorkouts) * 100 : 0;
                  
                  return (
                    <div key={week} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height: `${height}%` }}>
                        <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg" style={{ height: '100%' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {stats.workouts}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(week).toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Топ упражнения */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Найчастіші вправи</h3>
                <p className="text-sm text-muted-foreground">
                  Вправи, які ви виконуєте найчастіше
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {topExercises.map((exercise, index) => (
                <div key={exercise.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.count} разів
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Star className="w-3 h-3" />
                      {exercise.count}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Прогресс */}
        <TabsContent value="progress" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Прогрес по вправах</h3>
                <p className="text-sm text-muted-foreground">
                  Ріст робочих ваг та повторень
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(exerciseProgress).slice(0, 5).map(([exerciseId, progress]) => {
                const exercise = filteredWorkouts
                  .flatMap(w => w.exercises)
                  .find(ex => ex.exercise.id === exerciseId);
                
                if (!exercise) return null;

                const latestWeight = progress[progress.length - 1]?.maxWeight || 0;
                const firstWeight = progress[0]?.maxWeight || 0;
                const improvement = latestWeight - firstWeight;

                return (
                  <div key={exerciseId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{exercise.exercise.nameUk}</h4>
                        <p className="text-sm text-muted-foreground">
                          {progress.length} тренувань
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{latestWeight} кг</div>
                        <div className={`text-sm flex items-center gap-1 ${
                          improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {improvement > 0 ? <TrendingUp className="w-3 h-3" /> : 
                           improvement < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                          {improvement > 0 ? '+' : ''}{improvement.toFixed(1)} кг
                        </div>
                      </div>
                    </div>
                    
                    {/* Простой график прогресса */}
                    <div className="flex items-end gap-1 h-16">
                      {progress.slice(-10).map((point, index) => {
                        const maxWeight = Math.max(...progress.map(p => p.maxWeight));
                        const height = maxWeight > 0 ? (point.maxWeight / maxWeight) * 100 : 0;
                        
                        return (
                          <div
                            key={index}
                            className="flex-1 bg-primary/20 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Мышечные группы */}
        <TabsContent value="muscles" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Навантаження на м'язові групи</h3>
                <p className="text-sm text-muted-foreground">
                  Розподіл тренувань за м'язовими групами
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {muscleGroupStats.map((stat, index) => (
                <div key={stat.group} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {stat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Рекорды */}
        <TabsContent value="records" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Award className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Особисті рекорди</h3>
                <p className="text-sm text-muted-foreground">
                  Ваші найкращі результати за період
                </p>
              </div>
            </div>

            {recentRecords.length > 0 ? (
              <div className="space-y-3">
                {recentRecords.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <Trophy className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="font-medium">{record.exerciseName}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.recordType === 'max_weight' ? 'Максимальна вага' :
                           record.recordType === 'max_reps' ? 'Максимальні повторення' :
                           record.recordType === 'max_volume' ? 'Максимальний об\'єм' : 'Найкращий час'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{record.value} {record.unit}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-semibold mb-2">Немає рекордів</h4>
                <p className="text-muted-foreground">
                  За вибраний період рекорди не встановлені
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
