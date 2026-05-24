import { useState, useEffect, useCallback, useMemo } from 'react';

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');
import { 
  Exercise, 
  WorkoutProgram, 
  WorkoutDay, 
  WorkoutExercise, 
  ExerciseSet, 
  PlannedWorkout, 
  CompletedWorkout, 
  PersonalRecord, 
  WorkoutGoal, 
  WorkoutStats,
  MuscleGroup,
  Difficulty,
  WorkoutGoalType
} from '@/lib/workout-types';
import { EXERCISES_DATABASE, getExerciseById, searchExercises } from '@/lib/exercises-database';
import { WORKOUT_PROGRAMS, getProgramById } from '@/lib/workout-programs';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEYS = {
  PLANNED_WORKOUTS: 'omomo_planned_workouts',
  COMPLETED_WORKOUTS: 'omomo_completed_workouts',
  PERSONAL_RECORDS: 'omomo_personal_records',
  WORKOUT_GOALS: 'omomo_workout_goals',
  CUSTOM_EXERCISES: 'omomo_custom_exercises',
  CUSTOM_PROGRAMS: 'omomo_custom_programs'
};

const getStorageKey = (key: string, userId?: string) => `${key}_${userId || 'guest'}`;

export function useWorkouts() {
  const [plannedWorkouts, setPlannedWorkouts] = useState<PlannedWorkout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [workoutGoals, setWorkoutGoals] = useState<WorkoutGoal[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [customPrograms, setCustomPrograms] = useState<WorkoutProgram[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<PlannedWorkout | null>(null);
  
  const { user, isAuthenticated } = useAuth();

  // Загрузка данных из localStorage и API
  useEffect(() => {
    if (!isAuthenticated) {
      setPlannedWorkouts([]);
      setCompletedWorkouts([]);
      setPersonalRecords([]);
      setWorkoutGoals([]);
      setCustomExercises([]);
      setCustomPrograms([]);
      return;
    }

    try {
      const savedPlanned = localStorage.getItem(getStorageKey(STORAGE_KEYS.PLANNED_WORKOUTS, user?.id));
      if (savedPlanned) {
        setPlannedWorkouts(JSON.parse(savedPlanned));
      } else {
        setPlannedWorkouts([]);
      }

      const savedRecords = localStorage.getItem(getStorageKey(STORAGE_KEYS.PERSONAL_RECORDS, user?.id));
      if (savedRecords) {
        setPersonalRecords(JSON.parse(savedRecords));
      } else {
        setPersonalRecords([]);
      }

      const savedGoals = localStorage.getItem(getStorageKey(STORAGE_KEYS.WORKOUT_GOALS, user?.id));
      if (savedGoals) {
        setWorkoutGoals(JSON.parse(savedGoals));
      } else {
        setWorkoutGoals([]);
      }

      const savedCustomExercises = localStorage.getItem(getStorageKey(STORAGE_KEYS.CUSTOM_EXERCISES, user?.id));
      if (savedCustomExercises) {
        setCustomExercises(JSON.parse(savedCustomExercises));
      } else {
        setCustomExercises([]);
      }

      const savedCustomPrograms = localStorage.getItem(getStorageKey(STORAGE_KEYS.CUSTOM_PROGRAMS, user?.id));
      if (savedCustomPrograms) {
        setCustomPrograms(JSON.parse(savedCustomPrograms));
      } else {
        setCustomPrograms([]);
      }

      // Load completed workouts from local, then merge missing ones from backend
      let localCompleted: CompletedWorkout[] = [];
      const savedCompleted = localStorage.getItem(getStorageKey(STORAGE_KEYS.COMPLETED_WORKOUTS, user?.id));
      if (savedCompleted) {
        localCompleted = JSON.parse(savedCompleted);
      }
      
      setCompletedWorkouts(localCompleted);

      // Fetch from backend API to get cross-device workout history
      const token = localStorage.getItem('omomo_auth_token');
      if (token) {
        fetch(`${API_BASE}/api/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.history && data.history.workouts) {
            const backendWorkouts = data.history.workouts || [];
            
            setCompletedWorkouts(prev => {
              // Create a set of dates/types already in local storage to avoid duplicates
              const existingKeys = new Set(prev.map(w => `${w.startTime.split('T')[0]}_${w.name}`));
              
              const newFromBackend = backendWorkouts
                .filter((bw: any) => !existingKeys.has(`${bw.date}_${bw.workoutType}`))
                .map((bw: any) => ({
                  id: bw._id,
                  plannedWorkoutId: '',
                  name: bw.workoutType,
                  exercises: [], // Basic backend schema doesn't have exercises
                  startTime: bw.date + 'T12:00:00.000Z', // Rough estimation from date
                  endTime: bw.date + 'T13:00:00.000Z',
                  duration: bw.duration,
                  totalVolume: 0,
                  personalRecords: [],
                  rating: 0
                }));
                
              if (newFromBackend.length > 0) {
                return [...newFromBackend, ...prev].sort((a,b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
              }
              return prev;
            });
          }
        })
        .catch(console.error);
      }

    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  }, [isAuthenticated, user?.id]);

  // Сохранение данных в localStorage
  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.setItem(getStorageKey(STORAGE_KEYS.PLANNED_WORKOUTS, user?.id), JSON.stringify(plannedWorkouts));
      } catch (error) {
        console.error('Error saving planned workouts:', error);
      }
    }
  }, [plannedWorkouts, isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.setItem(getStorageKey(STORAGE_KEYS.COMPLETED_WORKOUTS, user?.id), JSON.stringify(completedWorkouts));
      } catch (error) {
        console.error('Error saving completed workouts:', error);
      }
    }
  }, [completedWorkouts, isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.setItem(getStorageKey(STORAGE_KEYS.PERSONAL_RECORDS, user?.id), JSON.stringify(personalRecords));
      } catch (error) {
        console.error('Error saving personal records:', error);
      }
    }
  }, [personalRecords, isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.setItem(getStorageKey(STORAGE_KEYS.WORKOUT_GOALS, user?.id), JSON.stringify(workoutGoals));
      } catch (error) {
        console.error('Error saving workout goals:', error);
      }
    }
  }, [workoutGoals, isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.setItem(getStorageKey(STORAGE_KEYS.CUSTOM_EXERCISES, user?.id), JSON.stringify(customExercises));
      } catch (error) {
        console.error('Error saving custom exercises:', error);
      }
    }
  }, [customExercises, isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        localStorage.setItem(getStorageKey(STORAGE_KEYS.CUSTOM_PROGRAMS, user?.id), JSON.stringify(customPrograms));
      } catch (error) {
        console.error('Error saving custom programs:', error);
      }
    }
  }, [customPrograms, isAuthenticated, user?.id]);

  // Получение всех упражнений (встроенные + пользовательские)
  const allExercises = useMemo(() => {
    return [...EXERCISES_DATABASE, ...customExercises];
  }, [customExercises]);

  // Получение всех программ (встроенные + пользовательские)
  const allPrograms = useMemo(() => {
    return [...WORKOUT_PROGRAMS, ...customPrograms];
  }, [customPrograms]);

  // Планирование тренировки
  const planWorkout = useCallback((workout: Omit<PlannedWorkout, 'id'>) => {
    const newWorkout: PlannedWorkout = {
      ...workout,
      id: crypto.randomUUID()
    };
    setPlannedWorkouts(prev => [...prev, newWorkout]);
    toast.success('Тренування заплановано!');
  }, []);

  // Планирование тренировки из программы
  const planWorkoutFromProgram = useCallback((programId: string, dayId: string, scheduledDate: string) => {
    const program = getProgramById(programId);
    if (!program) {
      toast.error('Програма не знайдена');
      return;
    }

    const day = program.days.find(d => d.id === dayId);
    if (!day) {
      toast.error('День тренування не знайдено');
      return;
    }

    const plannedWorkout: PlannedWorkout = {
      id: crypto.randomUUID(),
      programId,
      dayId,
      name: day.nameUk,
      exercises: day.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({ ...set, isCompleted: false }))
      })),
      scheduledDate,
      isCompleted: false
    };

    setPlannedWorkouts(prev => [...prev, plannedWorkout]);
    toast.success(`Тренування "${day.nameUk}" заплановано!`);
  }, []);

  // Начало тренировки (Live режим)
  const startWorkout = useCallback((workoutId: string) => {
    const workout = plannedWorkouts.find(w => w.id === workoutId);
    if (!workout) {
      toast.error('Тренування не знайдено');
      return;
    }

    setCurrentWorkout(workout);
    setIsLiveMode(true);
    toast.success('Тренування розпочато!');
  }, [plannedWorkouts]);

  // Завершение подхода
  const completeSet = useCallback((workoutId: string, exerciseId: string, setId: string, weight: number, reps: number) => {
    if (!currentWorkout || currentWorkout.id !== workoutId) return;

    setCurrentWorkout(prev => {
      if (!prev) return null;

      const updatedWorkout = { ...prev };
      const exercise = updatedWorkout.exercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        const set = exercise.sets.find(s => s.id === setId);
        if (set) {
          set.weight = weight;
          set.reps = reps;
          set.isCompleted = true;
        }
      }
      return updatedWorkout;
    });
  }, [currentWorkout]);

  // Завершение тренировки
  const completeWorkout = useCallback(() => {
    if (!currentWorkout) return;

    const endTime = new Date().toISOString();
    const startTime = new Date().toISOString(); // В реальном приложении это должно быть время начала
    const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);

    // Подсчет общего объема
    const totalVolume = currentWorkout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.weight * set.reps);
      }, 0);
    }, 0);

    // Проверка на личные рекорды
    const newRecords: PersonalRecord[] = [];
    currentWorkout.exercises.forEach(exercise => {
      const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
      const maxReps = Math.max(...exercise.sets.map(set => set.reps));
      const maxVolume = Math.max(...exercise.sets.map(set => set.weight * set.reps));

      // Проверяем рекорды по весу
      const existingWeightRecord = personalRecords.find(record => 
        record.exerciseId === exercise.exercise.id && record.recordType === 'max_weight'
      );
      if (!existingWeightRecord || maxWeight > existingWeightRecord.value) {
        newRecords.push({
          id: crypto.randomUUID(),
          exerciseId: exercise.exercise.id,
          exerciseName: exercise.exercise.nameUk,
          recordType: 'max_weight',
          value: maxWeight,
          unit: 'кг',
          date: endTime,
          workoutId: currentWorkout.id
        });
      }

      // Проверяем рекорды по повторениям
      const existingRepsRecord = personalRecords.find(record => 
        record.exerciseId === exercise.exercise.id && record.recordType === 'max_reps'
      );
      if (!existingRepsRecord || maxReps > existingRepsRecord.value) {
        newRecords.push({
          id: crypto.randomUUID(),
          exerciseId: exercise.exercise.id,
          exerciseName: exercise.exercise.nameUk,
          recordType: 'max_reps',
          value: maxReps,
          unit: 'раз',
          date: endTime,
          workoutId: currentWorkout.id
        });
      }
    });

    const completedWorkout: CompletedWorkout = {
      id: crypto.randomUUID(),
      plannedWorkoutId: currentWorkout.id,
      name: currentWorkout.name,
      exercises: currentWorkout.exercises,
      startTime,
      endTime,
      duration,
      totalVolume,
      personalRecords: newRecords,
      rating: 0
    };

    // Sync workout to backend
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated) {
      fetch(`${API_BASE}/api/workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          workoutType: currentWorkout.name,
          duration,
          caloriesBurned: duration * 5,
          date: startTime.split('T')[0]
        })
      }).catch(console.error);
    }

    // Обновляем данные
    setCompletedWorkouts(prev => [completedWorkout, ...prev].sort((a,b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()));
    setPersonalRecords(prev => [...prev, ...newRecords]);
    setPlannedWorkouts(prev => prev.map(w => 
      w.id === currentWorkout.id 
        ? { ...w, isCompleted: true, completedDate: endTime }
        : w
    ));

    // Выходим из Live режима
    setIsLiveMode(false);
    setCurrentWorkout(null);

    toast.success(`Тренування завершено! Тривалість: ${duration} хв, Об'єм: ${totalVolume} кг`);
  }, [currentWorkout, personalRecords, isAuthenticated]);

  // Отмена тренировки
  const cancelWorkout = useCallback(() => {
    setIsLiveMode(false);
    setCurrentWorkout(null);
    toast.info('Тренування скасовано');
  }, []);

  // Удаление запланированной тренировки
  const removePlannedWorkout = useCallback((workoutId: string) => {
    setPlannedWorkouts(prev => prev.filter(w => w.id !== workoutId));
    toast.success('Тренування видалено з плану');
  }, []);

  // Добавление цели
  const addWorkoutGoal = useCallback((goal: Omit<WorkoutGoal, 'id'>) => {
    const newGoal: WorkoutGoal = {
      ...goal,
      id: crypto.randomUUID()
    };
    setWorkoutGoals(prev => [...prev, newGoal]);
    toast.success('Ціль додано!');
  }, []);

  // Обновление цели
  const updateWorkoutGoal = useCallback((goalId: string, updates: Partial<WorkoutGoal>) => {
    setWorkoutGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  }, []);

  // Удаление цели
  const removeWorkoutGoal = useCallback((goalId: string) => {
    setWorkoutGoals(prev => prev.filter(goal => goal.id !== goalId));
    toast.success('Ціль видалено');
  }, []);

  // Добавление пользовательского упражнения
  const addCustomExercise = useCallback((exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
      isCustom: true
    };
    setCustomExercises(prev => [...prev, newExercise]);
    toast.success('Вправу додано!');
  }, []);

  // Статистика тренировок
  const workoutStats = useMemo((): WorkoutStats => {
    const totalWorkouts = completedWorkouts.length;
    const totalDuration = completedWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
    const totalVolume = completedWorkouts.reduce((sum, workout) => sum + (workout.totalVolume || 0), 0);
    const averageWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

    // Частота тренировки мышечных групп
    const muscleGroupFrequency: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
    completedWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        muscleGroupFrequency[exercise.exercise.primaryMuscleGroup] = 
          (muscleGroupFrequency[exercise.exercise.primaryMuscleGroup] || 0) + 1;
      });
    });

    // Любимые упражнения
    const exerciseFrequency: Record<string, { name: string; count: number }> = {};
    completedWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const key = exercise.exercise.id;
        if (!exerciseFrequency[key]) {
          exerciseFrequency[key] = { name: exercise.exercise.nameUk, count: 0 };
        }
        exerciseFrequency[key].count++;
      });
    });

    const favoriteExercises = Object.entries(exerciseFrequency)
      .map(([exerciseId, data]) => ({ exerciseId, exerciseName: data.name, frequency: data.count }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Прогресс по упражнениям
    const progressByExercise: Record<string, Array<{ date: string; maxWeight: number; maxReps: number }>> = {};
    completedWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const key = exercise.exercise.id;
        if (!progressByExercise[key]) {
          progressByExercise[key] = [];
        }
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight), 0);
        const maxReps = Math.max(...exercise.sets.map(set => set.reps), 0);
        progressByExercise[key].push({
          date: workout.endTime,
          maxWeight,
          maxReps
        });
      });
    });

    return {
      totalWorkouts,
      totalDuration,
      totalVolume,
      averageWorkoutDuration,
      personalRecords,
      muscleGroupFrequency,
      weeklyVolume: [], // TODO: реализовать подсчет недельного объема
      monthlyVolume: [], // TODO: реализовать подсчет месячного объема
      favoriteExercises,
      progressByExercise
    };
  }, [completedWorkouts, personalRecords]);

  // Получение тренировок по дате
  const getWorkoutsByDate = useCallback((date: string) => {
    const targetDate = new Date(date).toDateString();
    return {
      planned: plannedWorkouts.filter(w => 
        new Date(w.scheduledDate).toDateString() === targetDate
      ),
      completed: completedWorkouts.filter(w => 
        new Date(w.endTime).toDateString() === targetDate
      )
    };
  }, [plannedWorkouts, completedWorkouts]);

  return {
    // Данные
    allExercises,
    allPrograms,
    plannedWorkouts,
    completedWorkouts,
    personalRecords,
    workoutGoals,
    customExercises,
    customPrograms,
    workoutStats,
    
    // Состояние Live режима
    isLiveMode,
    currentWorkout,
    
    // Функции планирования
    planWorkout,
    planWorkoutFromProgram,
    removePlannedWorkout,
    
    // Функции выполнения
    startWorkout,
    completeSet,
    completeWorkout,
    cancelWorkout,
    
    // Функции целей
    addWorkoutGoal,
    updateWorkoutGoal,
    removeWorkoutGoal,
    
    // Функции упражнений
    addCustomExercise,
    
    // Утилиты
    getWorkoutsByDate,
    searchExercises
  };
}
