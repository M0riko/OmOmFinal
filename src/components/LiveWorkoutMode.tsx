import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  SkipForward, 
  CheckCircle, 
  Clock, 
  Dumbbell, 
  Target,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Zap,
  Trophy,
  Timer
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { PlannedWorkout, WorkoutExercise, ExerciseSet } from "@/lib/workout-types";
import { toast } from "sonner";

interface LiveWorkoutModeProps {
  workout: PlannedWorkout;
  onComplete: () => void;
  onCancel: () => void;
}

export function LiveWorkoutMode({ workout, onComplete, onCancel }: LiveWorkoutModeProps) {
  const { completeSet, completeWorkout } = useWorkouts();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date>(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [currentReps, setCurrentReps] = useState<number>(0);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSetsCount = completedSets.size;
  const progress = totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;

  // Таймер отдыха
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isResting && restTimeLeft > 0 && !isPaused) {
      interval = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            if (isSoundEnabled) {
              // Воспроизводим звук окончания отдыха
              playNotificationSound();
            }
            toast.success('Час відпочинку закінчився!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restTimeLeft, isPaused, isSoundEnabled]);

  const playNotificationSound = () => {
    // Простой звуковой сигнал
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleCompleteSet = useCallback(() => {
    if (!currentSet || !currentExercise) return;

    const setId = currentSet.id;
    const exerciseId = currentExercise.id;
    
    // Записываем подход
    completeSet(workout.id, exerciseId, setId, currentWeight, currentReps);
    setCompletedSets(prev => new Set([...prev, setId]));

    // Проверяем, есть ли еще подходы в этом упражнении
    if (currentSetIndex < currentExercise.sets.length - 1) {
      // Переходим к следующему подходу
      setCurrentSetIndex(prev => prev + 1);
      setCurrentWeight(currentExercise.sets[currentSetIndex + 1].weight);
      setCurrentReps(currentExercise.sets[currentSetIndex + 1].reps);
      
      // Запускаем таймер отдыха
      setIsResting(true);
      setRestTimeLeft(currentSet.restTime);
      
      toast.success(`Підхід ${currentSetIndex + 1} завершено! Відпочинок ${currentSet.restTime}с`);
    } else {
      // Упражнение завершено, переходим к следующему
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        const nextExercise = workout.exercises[currentExerciseIndex + 1];
        if (nextExercise.sets.length > 0) {
          setCurrentWeight(nextExercise.sets[0].weight);
          setCurrentReps(nextExercise.sets[0].reps);
        }
        
        toast.success(`Вправа "${currentExercise.exercise.nameUk}" завершено!`);
      } else {
        // Тренировка завершена
        handleCompleteWorkout();
      }
    }
  }, [currentSet, currentExercise, currentSetIndex, currentExerciseIndex, workout, currentWeight, currentReps, completeSet]);

  const handleCompleteWorkout = () => {
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 60000);
    
    completeWorkout();
    toast.success(`Тренування завершено! Тривалість: ${duration} хвилин`);
    onComplete();
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const handlePauseWorkout = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutDuration = () => {
    const now = new Date();
    const duration = Math.floor((now.getTime() - workoutStartTime.getTime()) / 60000);
    return duration;
  };

  if (!currentExercise || !currentSet) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Тренування завершено!</h2>
          <p className="text-muted-foreground">
            Час тренування: {getWorkoutDuration()} хвилин
          </p>
          <Button onClick={onComplete} className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Завершити
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок тренировки */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{workout.name}</h2>
            <p className="text-muted-foreground">
              Вправа {currentExerciseIndex + 1} з {workout.exercises.length} • 
              Підхід {currentSetIndex + 1} з {currentExercise.sets.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseWorkout}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Прогресс */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Прогрес</span>
            <span className="text-sm text-muted-foreground">
              {completedSetsCount} / {totalSets} підходів
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Текущее упражнение */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">{currentExercise.exercise.nameUk}</h3>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="gap-1">
                <Target className="w-3 h-3" />
                {currentExercise.exercise.primaryMuscleGroup}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Dumbbell className="w-3 h-3" />
                {currentExercise.exercise.equipment}
              </Badge>
            </div>
          </div>

          {/* Ввод данных о подходе */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Вага (кг)</label>
              <Input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                className="text-center text-lg"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Повторення</label>
              <Input
                type="number"
                value={currentReps}
                onChange={(e) => setCurrentReps(parseInt(e.target.value) || 0)}
                className="text-center text-lg"
                placeholder="0"
              />
            </div>
          </div>

          {/* Кнопка завершения подхода */}
          <Button
            onClick={handleCompleteSet}
            className="w-full h-12 text-lg gap-2"
            disabled={currentReps === 0}
          >
            <CheckCircle className="w-5 h-5" />
            Завершити підхід
          </Button>

          {/* Информация о следующем подходе */}
          {currentSetIndex < currentExercise.sets.length - 1 && (
            <div className="text-center text-sm text-muted-foreground">
              Наступний підхід: {currentExercise.sets[currentSetIndex + 1].reps} повторень
            </div>
          )}
        </div>
      </Card>

      {/* Таймер отдыха */}
      {isResting && (
        <Card className="p-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Timer className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                Час відпочинку
              </h3>
            </div>
            
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
              {formatTime(restTimeLeft)}
            </div>
            
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={handleSkipRest}
                className="gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Пропустити
              </Button>
              <Button
                variant="outline"
                onClick={handlePauseWorkout}
                className="gap-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Продовжити' : 'Пауза'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Список упражнений */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">План тренування</h4>
        <div className="space-y-2">
          {workout.exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                index === currentExerciseIndex 
                  ? 'bg-primary/10 border border-primary/20' 
                  : index < currentExerciseIndex 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-muted/50'
              }`}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {index < currentExerciseIndex ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : index === currentExerciseIndex ? (
                  <Zap className="w-4 h-4 text-primary" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{exercise.exercise.nameUk}</div>
                <div className="text-sm text-muted-foreground">
                  {exercise.sets.length} підходів по {exercise.sets[0]?.reps} повторень
                </div>
              </div>
              {index === currentExerciseIndex && (
                <Badge variant="default">Поточна</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Статистика тренировки */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{getWorkoutDuration()}</div>
            <div className="text-sm text-muted-foreground">хвилин</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{completedSetsCount}</div>
            <div className="text-sm text-muted-foreground">підходів</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {workout.exercises.reduce((sum, ex) => 
                sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0
              )}
            </div>
            <div className="text-sm text-muted-foreground">кг об'єм</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
