import { WorkoutProgram, WorkoutDay, WorkoutExercise, ExerciseSet, Difficulty, WorkoutGoalType } from './workout-types';
import { getExerciseById } from './exercises-database';

// Создание упражнения для программы
function createWorkoutExercise(
  exerciseId: string, 
  sets: number, 
  reps: number, 
  weight: number = 0, 
  restTime: number = 90
): WorkoutExercise {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    throw new Error(`Exercise with id ${exerciseId} not found`);
  }

  const exerciseSets: ExerciseSet[] = Array.from({ length: sets }, (_, index) => ({
    id: `${exerciseId}_set_${index + 1}`,
    reps,
    weight,
    restTime,
    isCompleted: false
  }));

  return {
    id: `${exerciseId}_workout`,
    exercise,
    sets: exerciseSets,
    order: 0
  };
}

// Готовые программы тренировок
export const WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'beginner_full_body',
    name: 'Beginner Full Body',
    nameUk: 'Повне тіло для початківців',
    description: 'Complete full-body workout for beginners',
    descriptionUk: 'Повна тренувальна програма для початківців',
    duration: 8, // 8 недель
    frequency: 3, // 3 раза в неделю
    difficulty: 'beginner',
    goal: 'general_fitness',
    isCustom: false,
    tags: ['beginner', 'full_body', 'strength'],
    days: [
      {
        id: 'beginner_day_1',
        name: 'Full Body A',
        nameUk: 'Повне тіло А',
        description: 'Upper body focus with some legs',
        descriptionUk: 'Акцент на верхню частину тіла з ногами',
        estimatedDuration: 45,
        difficulty: 'beginner',
        targetMuscleGroups: ['chest', 'back', 'shoulders', 'quads'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('push_ups', 3, 8, 0, 60),
          createWorkoutExercise('squats', 3, 12, 0, 60),
          createWorkoutExercise('bicep_curls', 2, 10, 5, 45),
          createWorkoutExercise('overhead_press', 2, 8, 5, 60)
        ]
      },
      {
        id: 'beginner_day_2',
        name: 'Full Body B',
        nameUk: 'Повне тіло Б',
        description: 'Lower body focus with some upper body',
        descriptionUk: 'Акцент на нижню частину тіла з верхньою',
        estimatedDuration: 45,
        difficulty: 'beginner',
        targetMuscleGroups: ['quads', 'glutes', 'back', 'triceps'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('squats', 3, 12, 0, 60),
          createWorkoutExercise('push_ups', 3, 8, 0, 60),
          createWorkoutExercise('dumbbell_flyes', 2, 10, 5, 45),
          createWorkoutExercise('bicep_curls', 2, 10, 5, 45)
        ]
      },
      {
        id: 'beginner_day_3',
        name: 'Full Body C',
        nameUk: 'Повне тіло В',
        description: 'Balanced full body workout',
        descriptionUk: 'Збалансована тренування всього тіла',
        estimatedDuration: 45,
        difficulty: 'beginner',
        targetMuscleGroups: ['chest', 'back', 'quads', 'shoulders'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('push_ups', 3, 10, 0, 60),
          createWorkoutExercise('squats', 3, 15, 0, 60),
          createWorkoutExercise('overhead_press', 2, 8, 5, 60),
          createWorkoutExercise('bicep_curls', 2, 12, 5, 45)
        ]
      }
    ]
  },
  {
    id: 'intermediate_push_pull_legs',
    name: 'Push/Pull/Legs',
    nameUk: 'Толкати/Тягнути/Ноги',
    description: 'Intermediate 6-day split program',
    descriptionUk: 'Середня 6-денна спліт програма',
    duration: 12,
    frequency: 6,
    difficulty: 'intermediate',
    goal: 'muscle_gain',
    isCustom: false,
    tags: ['intermediate', 'split', 'muscle_gain'],
    days: [
      {
        id: 'push_day_1',
        name: 'Push Day 1',
        nameUk: 'День толкання 1',
        description: 'Chest, shoulders, triceps',
        descriptionUk: 'Груди, плечі, трицепси',
        estimatedDuration: 60,
        difficulty: 'intermediate',
        targetMuscleGroups: ['chest', 'shoulders', 'triceps'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('bench_press', 4, 8, 20, 90),
          createWorkoutExercise('overhead_press', 3, 8, 15, 90),
          createWorkoutExercise('dumbbell_flyes', 3, 10, 10, 60),
          createWorkoutExercise('bicep_curls', 3, 10, 10, 60)
        ]
      },
      {
        id: 'pull_day_1',
        name: 'Pull Day 1',
        nameUk: 'День тягнення 1',
        description: 'Back, biceps',
        descriptionUk: 'Спина, біцепси',
        estimatedDuration: 60,
        difficulty: 'intermediate',
        targetMuscleGroups: ['back', 'biceps'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('deadlift', 4, 5, 30, 120),
          createWorkoutExercise('pull_ups', 3, 8, 0, 90),
          createWorkoutExercise('bicep_curls', 3, 10, 10, 60)
        ]
      },
      {
        id: 'legs_day_1',
        name: 'Legs Day 1',
        nameUk: 'День ніг 1',
        description: 'Quads, glutes, hamstrings',
        descriptionUk: 'Квадрицепси, сідниці, біцепси стегна',
        estimatedDuration: 60,
        difficulty: 'intermediate',
        targetMuscleGroups: ['quads', 'glutes', 'hamstrings'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('barbell_squats', 4, 8, 25, 90),
          createWorkoutExercise('squats', 3, 15, 0, 60),
          createWorkoutExercise('bicep_curls', 2, 10, 5, 45)
        ]
      },
      {
        id: 'push_day_2',
        name: 'Push Day 2',
        nameUk: 'День толкання 2',
        description: 'Chest, shoulders, triceps (variation)',
        descriptionUk: 'Груди, плечі, трицепси (варіація)',
        estimatedDuration: 60,
        difficulty: 'intermediate',
        targetMuscleGroups: ['chest', 'shoulders', 'triceps'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('dumbbell_flyes', 4, 10, 12, 60),
          createWorkoutExercise('overhead_press', 3, 10, 12, 90),
          createWorkoutExercise('push_ups', 3, 12, 0, 60),
          createWorkoutExercise('bicep_curls', 3, 12, 8, 60)
        ]
      },
      {
        id: 'pull_day_2',
        name: 'Pull Day 2',
        nameUk: 'День тягнення 2',
        description: 'Back, biceps (variation)',
        descriptionUk: 'Спина, біцепси (варіація)',
        estimatedDuration: 60,
        difficulty: 'intermediate',
        targetMuscleGroups: ['back', 'biceps'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('pull_ups', 4, 8, 0, 90),
          createWorkoutExercise('deadlift', 3, 8, 25, 120),
          createWorkoutExercise('bicep_curls', 3, 12, 8, 60)
        ]
      },
      {
        id: 'legs_day_2',
        name: 'Legs Day 2',
        nameUk: 'День ніг 2',
        description: 'Quads, glutes, hamstrings (variation)',
        descriptionUk: 'Квадрицепси, сідниці, біцепси стегна (варіація)',
        estimatedDuration: 60,
        difficulty: 'intermediate',
        targetMuscleGroups: ['quads', 'glutes', 'hamstrings'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('squats', 4, 12, 0, 60),
          createWorkoutExercise('barbell_squats', 3, 10, 20, 90),
          createWorkoutExercise('bicep_curls', 2, 12, 5, 45)
        ]
      }
    ]
  },
  {
    id: 'home_workout',
    name: 'Home Workout',
    nameUk: 'Домашня тренування',
    description: 'Bodyweight workout for home',
    descriptionUk: 'Тренування з власною вагою для дому',
    duration: 4,
    frequency: 4,
    difficulty: 'beginner',
    goal: 'general_fitness',
    isCustom: false,
    tags: ['home', 'bodyweight', 'beginner'],
    days: [
      {
        id: 'home_day_1',
        name: 'Upper Body',
        nameUk: 'Верхня частина тіла',
        description: 'Chest, back, arms',
        descriptionUk: 'Груди, спина, руки',
        estimatedDuration: 30,
        difficulty: 'beginner',
        targetMuscleGroups: ['chest', 'back', 'biceps', 'triceps'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('push_ups', 3, 10, 0, 60),
          createWorkoutExercise('bicep_curls', 2, 12, 5, 45),
          createWorkoutExercise('dumbbell_flyes', 2, 10, 5, 45)
        ]
      },
      {
        id: 'home_day_2',
        name: 'Lower Body',
        nameUk: 'Нижня частина тіла',
        description: 'Legs and glutes',
        descriptionUk: 'Ноги та сідниці',
        estimatedDuration: 30,
        difficulty: 'beginner',
        targetMuscleGroups: ['quads', 'glutes', 'hamstrings'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('squats', 3, 15, 0, 60),
          createWorkoutExercise('bicep_curls', 2, 10, 5, 45)
        ]
      },
      {
        id: 'home_day_3',
        name: 'Cardio',
        nameUk: 'Кардіо',
        description: 'Cardiovascular training',
        descriptionUk: 'Кардіоваскулярне тренування',
        estimatedDuration: 25,
        difficulty: 'beginner',
        targetMuscleGroups: ['cardio'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('running', 1, 1, 0, 0) // 1 подход = 20 минут бега
        ]
      },
      {
        id: 'home_day_4',
        name: 'Full Body',
        nameUk: 'Повне тіло',
        description: 'Complete body workout',
        descriptionUk: 'Повна тренування тіла',
        estimatedDuration: 35,
        difficulty: 'beginner',
        targetMuscleGroups: ['chest', 'back', 'quads', 'shoulders'],
        isCustom: false,
        exercises: [
          createWorkoutExercise('push_ups', 2, 8, 0, 60),
          createWorkoutExercise('squats', 2, 12, 0, 60),
          createWorkoutExercise('overhead_press', 2, 8, 5, 60),
          createWorkoutExercise('bicep_curls', 2, 10, 5, 45)
        ]
      }
    ]
  }
];

// Функции для работы с программами
export function getProgramsByDifficulty(difficulty: Difficulty): WorkoutProgram[] {
  return WORKOUT_PROGRAMS.filter(program => program.difficulty === difficulty);
}

export function getProgramsByGoal(goal: WorkoutGoalType): WorkoutProgram[] {
  return WORKOUT_PROGRAMS.filter(program => program.goal === goal);
}

export function getProgramById(id: string): WorkoutProgram | undefined {
  return WORKOUT_PROGRAMS.find(program => program.id === id);
}

export function searchPrograms(query: string): WorkoutProgram[] {
  const lowerQuery = query.toLowerCase();
  return WORKOUT_PROGRAMS.filter(program => 
    program.name.toLowerCase().includes(lowerQuery) ||
    program.nameUk.toLowerCase().includes(lowerQuery) ||
    program.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getRecommendedPrograms(
  difficulty: Difficulty, 
  goal: WorkoutGoalType, 
  availableEquipment: string[] = []
): WorkoutProgram[] {
  return WORKOUT_PROGRAMS.filter(program => {
    const matchesDifficulty = program.difficulty === difficulty;
    const matchesGoal = program.goal === goal;
    
    // Простая проверка оборудования (можно улучшить)
    const hasRequiredEquipment = true; // Пока что все программы доступны
    
    return matchesDifficulty && matchesGoal && hasRequiredEquipment;
  });
}
