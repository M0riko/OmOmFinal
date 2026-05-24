import { Exercise, MuscleGroup, Equipment, ExerciseType, Difficulty } from './workout-types';

export const EXERCISES_DATABASE: Exercise[] = [
  // Грудь
  {
    id: 'bench_press',
    name: 'Bench Press',
    nameUk: 'Жим лежа',
    description: 'Classic chest exercise performed lying on a bench',
    descriptionUk: 'Класична вправа для грудей, що виконується лежачи на лавці',
    videoUrl: 'https://example.com/bench_press.mp4',
    gifUrl: 'https://example.com/bench_press.gif',
    primaryMuscleGroup: 'chest',
    secondaryMuscleGroups: ['triceps', 'shoulders'],
    equipment: 'barbell',
    exerciseType: 'strength',
    difficulty: 'intermediate',
    instructions: [
      'Lie flat on a bench with your feet on the floor',
      'Grip the bar with hands slightly wider than shoulder width',
      'Lower the bar to your chest with control',
      'Press the bar back up to starting position'
    ],
    instructionsUk: [
      'Лягте на лавку, ноги на підлозі',
      'Візьміть штангу хватом трохи ширше плечей',
      'Опустіть штангу до грудей з контролем',
      'Витисніть штангу в початкове положення'
    ],
    tips: [
      'Keep your core tight throughout the movement',
      'Don\'t bounce the bar off your chest',
      'Maintain a slight arch in your back'
    ],
    tipsUk: [
      'Тримайте кор напруженим протягом всього руху',
      'Не відбивайте штангу від грудей',
      'Зберігайте легкий прогин у спині'
    ],
    tags: ['chest', 'barbell', 'compound'],
    isCustom: false
  },
  {
    id: 'push_ups',
    name: 'Push-ups',
    nameUk: 'Віджимання',
    description: 'Bodyweight chest exercise',
    descriptionUk: 'Вправа для грудей з власною вагою',
    primaryMuscleGroup: 'chest',
    secondaryMuscleGroups: ['triceps', 'shoulders', 'core'],
    equipment: 'bodyweight',
    exerciseType: 'strength',
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands under shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep your body in a straight line'
    ],
    instructionsUk: [
      'Почніть в положенні планки, руки під плечами',
      'Опустіть тіло до майже торкання підлоги грудьми',
      'Відтисніться в початкове положення',
      'Тримайте тіло прямою лінією'
    ],
    tips: [
      'Keep your core engaged',
      'Don\'t let your hips sag',
      'Breathe out on the way up'
    ],
    tipsUk: [
      'Тримайте кор напруженим',
      'Не опускайте стегна',
      'Видихайте при підйомі'
    ],
    tags: ['chest', 'bodyweight', 'beginner'],
    isCustom: false
  },
  {
    id: 'dumbbell_flyes',
    name: 'Dumbbell Flyes',
    nameUk: 'Розведення гантелей',
    description: 'Isolation exercise for chest muscles',
    descriptionUk: 'Ізоляційна вправа для м\'язів грудей',
    primaryMuscleGroup: 'chest',
    secondaryMuscleGroups: ['shoulders'],
    equipment: 'dumbbell',
    exerciseType: 'strength',
    difficulty: 'beginner',
    instructions: [
      'Lie on a bench holding dumbbells above your chest',
      'Lower the weights in a wide arc',
      'Feel the stretch in your chest',
      'Bring the weights back together above your chest'
    ],
    instructionsUk: [
      'Лягте на лавку, тримаючи гантелі над грудьми',
      'Опустіть ваги широкою дугою',
      'Відчуйте розтягнення в грудях',
      'Зведіть ваги назад над грудьми'
    ],
    tips: [
      'Keep a slight bend in your elbows',
      'Control the movement throughout',
      'Don\'t go too heavy'
    ],
    tipsUk: [
      'Тримайте легкий згин в ліктях',
      'Контролюйте рух протягом всього виконання',
      'Не беріть занадто важкі ваги'
    ],
    tags: ['chest', 'dumbbell', 'isolation'],
    isCustom: false
  },

  // Спина
  {
    id: 'deadlift',
    name: 'Deadlift',
    nameUk: 'Станова тяга',
    description: 'Compound exercise targeting the entire posterior chain',
    descriptionUk: 'Базова вправа для всієї задньої ланцюга м\'язів',
    primaryMuscleGroup: 'back',
    secondaryMuscleGroups: ['glutes', 'hamstrings', 'core', 'traps'],
    equipment: 'barbell',
    exerciseType: 'strength',
    difficulty: 'advanced',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep your back straight and chest up',
      'Drive through your heels to stand up',
      'Lower the bar with control'
    ],
    instructionsUk: [
      'Станьте ноги на ширині стегон, штанга над серединою стопи',
      'Нахиліться в стегнах і колінах, щоб взяти штангу',
      'Тримайте спину прямою, груди піднятими',
      'Відштовхуйтесь п\'ятами, щоб піднятися',
      'Опустіть штангу з контролем'
    ],
    tips: [
      'Keep the bar close to your body',
      'Don\'t round your back',
      'Engage your core throughout'
    ],
    tipsUk: [
      'Тримайте штангу близько до тіла',
      'Не округляйте спину',
      'Напружуйте кор протягом всього руху'
    ],
    tags: ['back', 'barbell', 'compound', 'power'],
    isCustom: false
  },
  {
    id: 'pull_ups',
    name: 'Pull-ups',
    nameUk: 'Підтягування',
    description: 'Bodyweight exercise for back and biceps',
    descriptionUk: 'Вправа з власною вагою для спини та біцепсів',
    primaryMuscleGroup: 'back',
    secondaryMuscleGroups: ['biceps', 'shoulders'],
    equipment: 'pull_up_bar',
    exerciseType: 'strength',
    difficulty: 'intermediate',
    instructions: [
      'Hang from a pull-up bar with overhand grip',
      'Pull your body up until chin clears the bar',
      'Lower yourself with control',
      'Keep your core engaged'
    ],
    instructionsUk: [
      'Повисніть на турніку прямим хватом',
      'Підтягніть тіло до торкання підборіддям перекладини',
      'Опустіть себе з контролем',
      'Тримайте кор напруженим'
    ],
    tips: [
      'Don\'t swing your body',
      'Focus on pulling with your back',
      'Full range of motion'
    ],
    tipsUk: [
      'Не розгойдуйте тіло',
      'Фокусуйтесь на тягненні спиною',
      'Повна амплітуда руху'
    ],
    tags: ['back', 'bodyweight', 'compound'],
    isCustom: false
  },

  // Ноги
  {
    id: 'squats',
    name: 'Squats',
    nameUk: 'Присідання',
    description: 'Fundamental lower body exercise',
    descriptionUk: 'Фундаментальна вправа для нижньої частини тіла',
    primaryMuscleGroup: 'quads',
    secondaryMuscleGroups: ['glutes', 'hamstrings', 'core'],
    equipment: 'bodyweight',
    exerciseType: 'strength',
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body by bending at hips and knees',
      'Go down until thighs are parallel to floor',
      'Drive through heels to return to standing'
    ],
    instructionsUk: [
      'Станьте ноги на ширині плечей',
      'Опустіть тіло, згинаючи в стегнах і колінах',
      'Спустіться до паралелі стегон з підлогою',
      'Відштовхуйтесь п\'ятами, щоб повернутися в стійку'
    ],
    tips: [
      'Keep your chest up',
      'Don\'t let knees cave in',
      'Weight on your heels'
    ],
    tipsUk: [
      'Тримайте груди піднятими',
      'Не зводите коліна всередину',
      'Вага на п\'ятах'
    ],
    tags: ['legs', 'bodyweight', 'compound'],
    isCustom: false
  },
  {
    id: 'barbell_squats',
    name: 'Barbell Squats',
    nameUk: 'Присідання зі штангою',
    description: 'Weighted squat variation',
    descriptionUk: 'Варіація присідань з вагою',
    primaryMuscleGroup: 'quads',
    secondaryMuscleGroups: ['glutes', 'hamstrings', 'core'],
    equipment: 'barbell',
    exerciseType: 'strength',
    difficulty: 'intermediate',
    instructions: [
      'Position bar on upper back',
      'Stand with feet shoulder-width apart',
      'Lower into squat position',
      'Drive up through heels'
    ],
    instructionsUk: [
      'Розмістіть штангу на верхній частині спини',
      'Станьте ноги на ширині плечей',
      'Опустіться в положення присідання',
      'Відштовхуйтесь п\'ятами вгору'
    ],
    tips: [
      'Keep core tight',
      'Maintain neutral spine',
      'Full depth'
    ],
    tipsUk: [
      'Тримайте кор напруженим',
      'Зберігайте нейтральний хребет',
      'Повна глибина'
    ],
    tags: ['legs', 'barbell', 'compound'],
    isCustom: false
  },

  // Плечі
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    nameUk: 'Жим над головою',
    description: 'Shoulder strength exercise',
    descriptionUk: 'Вправа для сили плечей',
    primaryMuscleGroup: 'shoulders',
    secondaryMuscleGroups: ['triceps', 'core'],
    equipment: 'barbell',
    exerciseType: 'strength',
    difficulty: 'intermediate',
    instructions: [
      'Start with bar at shoulder level',
      'Press straight up overhead',
      'Lower with control',
      'Keep core engaged'
    ],
    instructionsUk: [
      'Почніть зі штангою на рівні плечей',
      'Витисніть прямо вгору над головою',
      'Опустіть з контролем',
      'Тримайте кор напруженим'
    ],
    tips: [
      'Don\'t arch your back excessively',
      'Press straight up',
      'Full range of motion'
    ],
    tipsUk: [
      'Не прогинайте спину надмірно',
      'Витискайте прямо вгору',
      'Повна амплітуда руху'
    ],
    tags: ['shoulders', 'barbell', 'compound'],
    isCustom: false
  },

  // Руки
  {
    id: 'bicep_curls',
    name: 'Bicep Curls',
    nameUk: 'Згинання на біцепс',
    description: 'Isolation exercise for biceps',
    descriptionUk: 'Ізоляційна вправа для біцепсів',
    primaryMuscleGroup: 'biceps',
    secondaryMuscleGroups: ['forearms'],
    equipment: 'dumbbell',
    exerciseType: 'strength',
    difficulty: 'beginner',
    instructions: [
      'Hold dumbbells at your sides',
      'Curl weights up to shoulders',
      'Squeeze biceps at the top',
      'Lower with control'
    ],
    instructionsUk: [
      'Тримайте гантелі по боках',
      'Згинайте ваги до плечей',
      'Стисніть біцепси вгорі',
      'Опустіть з контролем'
    ],
    tips: [
      'Don\'t swing the weights',
      'Control the negative',
      'Full range of motion'
    ],
    tipsUk: [
      'Не розгойдуйте ваги',
      'Контролюйте негативну фазу',
      'Повна амплітуда руху'
    ],
    tags: ['biceps', 'dumbbell', 'isolation'],
    isCustom: false
  },

  // Кардіо
  {
    id: 'running',
    name: 'Running',
    nameUk: 'Біг',
    description: 'Cardiovascular exercise',
    descriptionUk: 'Кардіоваскулярна вправа',
    primaryMuscleGroup: 'cardio',
    secondaryMuscleGroups: ['quads', 'hamstrings', 'calves'],
    equipment: 'none',
    exerciseType: 'cardio',
    difficulty: 'beginner',
    instructions: [
      'Start with a warm-up walk',
      'Gradually increase pace to running',
      'Maintain steady breathing',
      'Cool down with walking'
    ],
    instructionsUk: [
      'Почніть з розминкової ходьби',
      'Поступово збільшуйте темп до бігу',
      'Підтримуйте рівномірне дихання',
      'Завершіть ходьбою для заспокоєння'
    ],
    tips: [
      'Wear proper running shoes',
      'Stay hydrated',
      'Listen to your body'
    ],
    tipsUk: [
      'Носіть правильні бігові кросівки',
      'Підтримуйте водний баланс',
      'Прислухайтесь до свого тіла'
    ],
    tags: ['cardio', 'endurance', 'outdoor'],
    isCustom: false
  }
];

// Функции для работы с базой данных упражнений
export function getExercisesByMuscleGroup(muscleGroup: MuscleGroup): Exercise[] {
  return EXERCISES_DATABASE.filter(exercise => 
    exercise.primaryMuscleGroup === muscleGroup || 
    exercise.secondaryMuscleGroups.includes(muscleGroup)
  );
}

export function getExercisesByEquipment(equipment: Equipment): Exercise[] {
  return EXERCISES_DATABASE.filter(exercise => exercise.equipment === equipment);
}

export function getExercisesByDifficulty(difficulty: Difficulty): Exercise[] {
  return EXERCISES_DATABASE.filter(exercise => exercise.difficulty === difficulty);
}

export function searchExercises(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase();
  return EXERCISES_DATABASE.filter(exercise => 
    exercise.name.toLowerCase().includes(lowerQuery) ||
    exercise.nameUk.toLowerCase().includes(lowerQuery) ||
    exercise.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES_DATABASE.find(exercise => exercise.id === id);
}

export function getRandomExercises(count: number): Exercise[] {
  const shuffled = [...EXERCISES_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
