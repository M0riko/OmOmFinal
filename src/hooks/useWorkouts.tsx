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

  // Загрузка данных из API
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

    // Load from database
    const token = localStorage.getItem('omomo_auth_token');
    if (token) {
      Promise.all([
        fetch(`${API_BASE}/api/workouts/planned`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
        fetch(`${API_BASE}/api/workouts/completed`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
        fetch(`${API_BASE}/api/workouts/records`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
        fetch(`${API_BASE}/api/workouts/goals`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
        fetch(`${API_BASE}/api/workouts/exercises`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
        fetch(`${API_BASE}/api/workouts/programs`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
      ])
      .then(([plannedData, completedData, recordsData, goalsData, exercisesData, programsData]) => {
        if (plannedData.planned) setPlannedWorkouts(plannedData.planned.map((w: any) => ({ id: w._id, ...w })));
        if (completedData.completed) setCompletedWorkouts(completedData.completed.map((w: any) => ({ id: w._id, ...w })));
        if (recordsData.records) setPersonalRecords(recordsData.records.map((r: any) => ({ id: r._id, ...r })));
        if (goalsData.goals) setWorkoutGoals(goalsData.goals.map((g: any) => ({ id: g._id, ...g })));
        if (exercisesData.exercises) setCustomExercises(exercisesData.exercises.map((e: any) => ({ id: e._id, ...e })));
        if (programsData.programs) setCustomPrograms(programsData.programs.map((p: any) => ({ id: p._id, ...p })));
      })
      .catch(console.error);
    }
  }, [isAuthenticated, user?.id]);

  // Сохранение данных в localStorage відключено, працюємо з БД

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
    const token = localStorage.getItem('omomo_auth_token');
    if (isAuthenticated && token) {
      fetch(`${API_BASE}/api/workouts/planned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(workout)
      })
      .then(res => res.json())
      .then(data => {
        if (data.planned) {
          setPlannedWorkouts(prev => [...prev, { id: data.planned._id, ...data.planned }]);
          toast.success('Тренування заплановано!');
        }
      })
      .catch(console.error);
    } else {
      const newWorkout: PlannedWorkout = {
        ...workout,
        id: crypto.randomUUID()
      };
      setPlannedWorkouts(prev => [...prev, newWorkout]);
      toast.success('Тренування заплановано!');
    }
  }, [isAuthenticated]);

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

    const plannedWorkout = {
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

    planWorkout(plannedWorkout);
  }, [planWorkout]);

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
    const startTime = new Date().toISOString();
    const duration = Math.max(15, Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)) || 45;

    // Подсчет общего объема
    const totalVolume = currentWorkout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.weight * set.reps);
      }, 0);
    }, 0);

    // Проверка на личные рекорды
    const newRecords: PersonalRecord[] = [];
    currentWorkout.exercises.forEach(exercise => {
      const maxWeight = Math.max(...exercise.sets.map(set => set.weight), 0);
      const maxReps = Math.max(...exercise.sets.map(set => set.reps), 0);

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

    const completedWorkoutObj = {
      plannedWorkoutId: currentWorkout.id,
      name: currentWorkout.name,
      exercises: currentWorkout.exercises,
      startTime,
      endTime,
      duration,
      totalVolume,
      personalRecords: newRecords,
      rating: 5
    };

    // Sync workout to backend
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated) {
      // 1. Save completed workout
      fetch(`${API_BASE}/api/workouts/completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(completedWorkoutObj)
      })
      .then(res => res.json())
      .then(data => {
        if (data.completed) {
          const completedWorkout = { id: data.completed._id, ...data.completed };
          setCompletedWorkouts(prev => [completedWorkout, ...prev].sort((a,b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()));
          
          // Save personal records
          newRecords.forEach(rec => {
            fetch(`${API_BASE}/api/workouts/records`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(rec)
            }).catch(console.error);
          });

          // Mark planned workout as completed
          if (currentWorkout.id && !currentWorkout.id.includes('-')) {
            fetch(`${API_BASE}/api/workouts/planned/${currentWorkout.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ isCompleted: true, completedDate: endTime })
            }).catch(console.error);
          }
        }
      })
      .catch(console.error);
    } else {
      // Guest
      const completedWorkout: CompletedWorkout = {
        id: crypto.randomUUID(),
        ...completedWorkoutObj
      };
      setCompletedWorkouts(prev => [completedWorkout, ...prev].sort((a,b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()));
      setPersonalRecords(prev => [...prev, ...newRecords]);
      setPlannedWorkouts(prev => prev.map(w => 
        w.id === currentWorkout.id 
          ? { ...w, isCompleted: true, completedDate: endTime }
          : w
      ));
    }

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
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated && !workoutId.includes('-')) {
      fetch(`${API_BASE}/api/workouts/planned/${workoutId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPlannedWorkouts(prev => prev.filter(w => w.id !== workoutId));
          toast.success('Тренування видалено з плану');
        }
      })
      .catch(console.error);
    } else {
      setPlannedWorkouts(prev => prev.filter(w => w.id !== workoutId));
      toast.success('Тренування видалено з плану');
    }
  }, [isAuthenticated]);

  // Добавление цели
  const addWorkoutGoal = useCallback((goal: Omit<WorkoutGoal, 'id'>) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated) {
      fetch(`${API_BASE}/api/workouts/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(goal)
      })
      .then(res => res.json())
      .then(data => {
        if (data.goal) {
          setWorkoutGoals(prev => [...prev, { id: data.goal._id, ...data.goal }]);
          toast.success('Ціль додано!');
        }
      })
      .catch(console.error);
    } else {
      const newGoal: WorkoutGoal = {
        ...goal,
        id: crypto.randomUUID()
      };
      setWorkoutGoals(prev => [...prev, newGoal]);
      toast.success('Ціль додано!');
    }
  }, [isAuthenticated]);

  // Обновление цели
  const updateWorkoutGoal = useCallback((goalId: string, updates: Partial<WorkoutGoal>) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated && !goalId.includes('-')) {
      fetch(`${API_BASE}/api/workouts/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      })
      .then(res => res.json())
      .then(data => {
        if (data.goal) {
          setWorkoutGoals(prev => prev.map(goal => 
            goal.id === goalId ? { ...goal, ...updates } : goal
          ));
        }
      })
      .catch(console.error);
    } else {
      setWorkoutGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      ));
    }
  }, [isAuthenticated]);

  // Удаление цели
  const removeWorkoutGoal = useCallback((goalId: string) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated && !goalId.includes('-')) {
      fetch(`${API_BASE}/api/workouts/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWorkoutGoals(prev => prev.filter(goal => goal.id !== goalId));
          toast.success('Ціль видалено');
        }
      })
      .catch(console.error);
    } else {
      setWorkoutGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast.success('Ціль видалено');
    }
  }, [isAuthenticated]);

  // Добавление пользовательского упражнения
  const addCustomExercise = useCallback((exercise: Omit<Exercise, 'id'>) => {
    const token = localStorage.getItem('omomo_auth_token');
    if (token && isAuthenticated) {
      fetch(`${API_BASE}/api/workouts/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(exercise)
      })
      .then(res => res.json())
      .then(data => {
        if (data.exercise) {
          setCustomExercises(prev => [...prev, { id: data.exercise._id, ...data.exercise }]);
          toast.success('Вправу додано!');
        }
      })
      .catch(console.error);
    } else {
      const newExercise: Exercise = {
        ...exercise,
        id: crypto.randomUUID(),
        isCustom: true
      };
      setCustomExercises(prev => [...prev, newExercise]);
      toast.success('Вправу додано!');
    }
  }, [isAuthenticated]);

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
