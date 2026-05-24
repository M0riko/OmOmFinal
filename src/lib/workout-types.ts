export interface Exercise {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  descriptionUk: string;
  videoUrl?: string;
  gifUrl?: string;
  imageUrl?: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment;
  exerciseType: ExerciseType;
  difficulty: Difficulty;
  instructions: string[];
  instructionsUk: string[];
  tips: string[];
  tipsUk: string[];
  tags: string[];
  isCustom: boolean;
  createdBy?: string;
}

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  duration?: number; // для кардио/изометрических упражнений
  restTime: number; // время отдыха после подхода
  isCompleted: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  order: number;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  nameUk: string;
  description?: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // в минутах
  difficulty: Difficulty;
  targetMuscleGroups: MuscleGroup[];
  isCustom: boolean;
  createdBy?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  descriptionUk: string;
  duration: number; // количество недель
  frequency: number; // тренировок в неделю
  difficulty: Difficulty;
  goal: WorkoutGoal;
  days: WorkoutDay[];
  isCustom: boolean;
  createdBy?: string;
  tags: string[];
}

export interface PlannedWorkout {
  id: string;
  programId?: string;
  dayId?: string;
  name: string;
  exercises: WorkoutExercise[];
  scheduledDate: string;
  isCompleted: boolean;
  completedDate?: string;
  actualDuration?: number;
  notes?: string;
}

export interface CompletedWorkout {
  id: string;
  plannedWorkoutId?: string;
  name: string;
  exercises: WorkoutExercise[];
  startTime: string;
  endTime: string;
  duration: number;
  totalVolume: number; // общий поднятый вес
  personalRecords: PersonalRecord[];
  notes?: string;
  rating?: number; // 1-5 звезд
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  recordType: 'max_weight' | 'max_reps' | 'max_volume' | 'best_time';
  value: number;
  unit: string;
  date: string;
  workoutId: string;
}

export interface WorkoutGoal {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  descriptionUk: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  exerciseId?: string;
  exerciseName?: string;
  targetDate: string;
  isCompleted: boolean;
  completedDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // в минутах
  totalVolume: number; // общий поднятый вес
  averageWorkoutDuration: number;
  personalRecords: PersonalRecord[];
  muscleGroupFrequency: Record<MuscleGroup, number>;
  weeklyVolume: number[];
  monthlyVolume: number[];
  favoriteExercises: Array<{
    exerciseId: string;
    exerciseName: string;
    frequency: number;
  }>;
  progressByExercise: Record<string, Array<{
    date: string;
    maxWeight: number;
    maxReps: number;
  }>>;
}

export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques' | 'lower_back' | 'glutes' | 'quads' | 'hamstrings'
  | 'calves' | 'traps' | 'lats' | 'rhomboids' | 'delts' | 'core'
  | 'full_body' | 'cardio';

export type Equipment = 
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine' | 'bodyweight'
  | 'resistance_band' | 'medicine_ball' | 'trx' | 'bench' | 'pull_up_bar'
  | 'dip_bars' | 'none';

export type ExerciseType = 
  | 'strength' | 'cardio' | 'flexibility' | 'plyometric' | 'isometric'
  | 'endurance' | 'power' | 'balance' | 'coordination';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type WorkoutGoalType = 
  | 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility'
  | 'general_fitness' | 'sport_specific' | 'rehabilitation';

// Константы для маппинга
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечі',
  biceps: 'Біцепс',
  triceps: 'Трицепс',
  forearms: 'Передпліччя',
  abs: 'Пресс',
  obliques: 'Косі м\'язи живота',
  lower_back: 'Поперек',
  glutes: 'Сідниці',
  quads: 'Квадрицепс',
  hamstrings: 'Біцепс стегна',
  calves: 'Литки',
  traps: 'Трапеції',
  lats: 'Широчайші',
  rhomboids: 'Ромбовидні',
  delts: 'Дельти',
  core: 'Кор',
  full_body: 'Все тіло',
  cardio: 'Кардіо'
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Штанга',
  dumbbell: 'Гантелі',
  kettlebell: 'Гиря',
  cable: 'Трос',
  machine: 'Тренажер',
  bodyweight: 'Власна вага',
  resistance_band: 'Резинка',
  medicine_ball: 'Медицинський м\'яч',
  trx: 'TRX',
  bench: 'Лавка',
  pull_up_bar: 'Турнік',
  dip_bars: 'Бруси',
  none: 'Без обладнання'
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  strength: 'Силове',
  cardio: 'Кардіо',
  flexibility: 'Розтяжка',
  plyometric: 'Пліометрика',
  isometric: 'Ізометричне',
  endurance: 'Витривалість',
  power: 'Потужність',
  balance: 'Баланс',
  coordination: 'Координація'
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Початківець',
  intermediate: 'Середній',
  advanced: 'Просунутий',
  expert: 'Експерт'
};

export const WORKOUT_GOAL_LABELS: Record<WorkoutGoalType, string> = {
  weight_loss: 'Схуднення',
  muscle_gain: 'Набір м\'язової маси',
  strength: 'Розвиток сили',
  endurance: 'Витривалість',
  flexibility: 'Гнучкість',
  general_fitness: 'Загальна фізична підготовка',
  sport_specific: 'Спортивна спеціалізація',
  rehabilitation: 'Реабілітація'
};
