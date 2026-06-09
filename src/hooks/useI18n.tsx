import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Locale = "uk" | "en";
type Dict = Record<string, string>;

const uk: Dict = {
  hello: "Привіт",
  addProduct: "Додати продукт",
  addMeal: "Додати страву",
  profile: "Профіль",
  signIn: "Увійти",
  signOut: "Вийти",
  home: "Головна",
  recipes: "Рецепти",
  fridge: "Холодильник",
  mealPlan: "План харчування",
  shopping: "Список покупок",
  training: "Тренування",
  articles: "Статті",
  quickActions: "Швидкі дії",
  whatYouAdded: "Що ти сьогодні додав(ла)",
  recommendations: "Рекомендації",
  calcCalories: "Порахувати калорії",
  weekPlan: "План харчування на тиждень",
  preview: "Прев'ю",
  details: "Детальніше",
  keepPace: "Тримай темп!",
  onTheRightTrack: "Ти на правильному шляху до своєї мети",
  viewAchievements: "Переглянути досягнення",
  aiCoach: "AI-Коуч",
  aiInsights: "AI-поради",
  aiWorkoutGenerator: "AI-генератор тренувань",
  aiNutritionPlanner: "AI-планувальник харчування",
  aiAnalytics: "AI-аналітика",
  aiWeeklySummary: "AI-аналіз тижня",
  aiNotifications: "AI-сповіщення",
  
  // Додаткові переклади
  loading: "Завантаження...",
  error: "Помилка",
  success: "Успіх",
  cancel: "Скасувати",
  save: "Зберегти",
  delete: "Видалити",
  edit: "Редагувати",
  add: "Додати",
  search: "Пошук",
  close: "Закрити",
  back: "Назад",
  next: "Далі",
  previous: "Попередній",
  yes: "Так",
  no: "Ні",
  ok: "ОК",
  retry: "Повторити",
  refresh: "Оновити",
  settings: "Налаштування",
  logout: "Вийти",
  login: "Увійти",
  register: "Зареєструватися",
  
  // Харчування
  breakfast: "Сніданок",
  lunch: "Обід",
  dinner: "Вечеря",
  snack: "Перекус",
  meals: "Прийоми їжі",
  calories: "Калорії",
  protein: "Білок",
  carbs: "Вуглеводи",
  fat: "Жири",
  
  // Статистика
  today: "Сьогодні",
  yesterday: "Вчора",
  thisWeek: "Цей тиждень",
  thisMonth: "Цей місяць",
  progress: "Прогрес",
  goal: "Мета",
  achieved: "Досягнуто",
  remaining: "Залишилося",
  
  // Загальні
  name: "Ім'я",
  email: "Електронна пошта",
  password: "Пароль",
  age: "Вік",
  gender: "Стать",
  height: "Зріст",
  weight: "Вага",
  days: "днів",
  guest: "Гість",
  water: "Вода",
  steps: "Кроки",
  burned: "Спалено",
  activity: "Активність",
  
  // AI компоненти
  tipOfTheDay: "Порада дня",
  motivation: "Мотивація",
  attention: "Увага",
  achievement: "Досягнення",
  yourAIAssistant: "Ваш AI-помічник",
  updatedJustNow: "Оновлено щойно",
  aiActive: "AI активний",
  viewRecipes: "Переглянути рецепти",
  viewProgress: "Переглянути прогрес",
  addWater: "Додати воду",
  viewStatistics: "Переглянути статистику",
  tryAddingMoreProtein: "Спробуйте додати більше білку до сніданку для кращого насичення",
  greatWork: "Відмінна робота! Ви на правильному шляху до досягнення мети",
  dontForgetWater: "Не забувайте пити воду! Сьогодні ви випили менше норми",
  congratulations: "Вітаємо! Ви виконали тижневу мету з тренувань",
  creatingPersonalProgram: "Створюю персональну програму на основі ваших цілей",
  aiWillSendPersonalTips: "AI буде надсилати вам персональні поради та нагадування",
  
  // Профіль
  user: "Користувач",
  level: "Рівень",
  daysInRow: "днів поспіль",
  statistics: "Статистика",
  benchPress: "Жим лежа",
  running5k: "Біг 5км",
  plank: "Планка",
  kg: "кг",
  min: "хв",
  firstWorkout: "Перша тренування",
  completeFirstWorkout: "Виконайте свою першу тренування",
  weekInRow: "Тиждень поспіль",
  train7DaysInRow: "Тренуйтесь 7 днів поспіль",
  strongman: "Силач",
  lift100kgBench: "Підніміть 100кг в жимі лежа",
  marathoner: "Марафонець",
  run42km: "Пробіжіть 42км",
  reachLevel20: "Досягти 20 рівня",
  nextMilestone: "100 тренувань",
  
  // AI Coach
  aiCoachTitle: "AI-Коуч",
  personalAssistant: "Ваш персональний помічник зі здорового способу життя",
  
  // AI Coach Chat
  aiCoachGreeting: "Привіт! Я ваш персональний AI-коуч. Готовий допомогти з питаннями щодо харчування, тренувань та здорового способу життя. Що вас цікавить?",
  waterRecommendation: "Рекомендується пити 30-35 мл води на 1 кг ваги тіла на день. Це приблизно 2-3 літри для людини вагою 70 кг. П'йте воду рівномірно протягом дня, особливо до та після тренувань.",
  preWorkoutMeal: "Перед тренуванням (за 1-2 години) їжте вуглеводи з невеликою кількістю білку: банан з горіхами, вівсянка з ягодами, або тост з арахісовою пастою. Уникайте жирної та важкої їжі.",
  sleepTips: "Для покращення сну: лягайте та вставайте в один час, уникайте екранів за годину до сну, провітрюйте кімнату, не їжте за 3 години до сну, займайтесь спортом, але не пізно ввечері.",
  aiTyping: "AI друкує...",
  askQuestionPlaceholder: "Задайте питання AI-коучу...",
  
  // Популярні питання
  popularQuestions: "Популярні питання:",
  howToLoseWeightFaster: "Як швидше схуднути?",
  absExercises: "Які вправи для пресу?",
  howMuchWaterPerDay: "Скільки води пити на день?",
  howToGainMuscle: "Як набрати м'язову масу?",
  whatToEatBeforeWorkout: "Що їсти перед тренуванням?",
  howToImproveSleep: "Як покращити сон?",
  
  // Profile компоненти
  levelTitle: "Рівень",
  startWorkout: "Почати тренування",
  weekAnalysis: "AI Аналіз Тижня",
  weekTitle: "Тиждень",
  completedDays: "Виконали",
  ofDays: "з",
  aiInsight: "🧠 AI Інсайт:",
  
  // Додаткові переклади
  aiMealPlanSaved: "AI план харчування збережено!",
  aiWorkoutStarted: "AI тренування розпочато!",
  onboardingActive: "Показуємо онбординг якщо він активний",
  aiDataAnalysis: "AI Аналіз Даних",
  aiConfidence: "Впевненість AI",
  aiAnalyzed: "AI проаналізував",
  aspects: "аспектів",
  yourProgress: "вашого прогресу",
  
  // Коментарі
  aiWorkoutLogic: "Логіка початку AI тренування",
  aiMealPlanLogic: "Логіка збереження AI плану",
  
  // Додаткові коментарі
  dashboardStats: "Статистика для дашборда",
  
  // Додаткові переклади
  viewPlan: "Переглянути план",
  trainers: "Тренери",
  music: "Музика",
  ittenWheel: "Коло Іттена",
  colorHarmony: "Гармонія кольорів",
  ittenWheelDesc: "Визначення гармонійного сполучення кольорів",
  complementary: "Комплементарна",
  analogous: "Аналогова",
  triadic: "Тріада",
  splitComplementary: "Розділена комплементарна",
  tetradic: "Тетрада (Подвійна комплементарна)",
  baseColor: "Базовий колір",
  harmonyScheme: "Схема гармонії",
  copyHex: "Копіювати HEX",
  copyRgb: "Копіювати RGB",
  copyHsl: "Копіювати HSL",
  copied: "Скопійовано!",
  colorCode: "Код кольору",
  sandboxTitle: "Інтерактивний макет (Пісочниця)",
  sandboxDesc: "Динамічний перегляд застосування кольорів у дизайні інтерфейсу",
  codeExport: "Експорт коду",
  codeExportDesc: "Готові стилі та React/Tailwind компоненти",
};

const en: Dict = {
  hello: "Hello",
  addProduct: "Add product",
  addMeal: "Add meal",
  profile: "Profile",
  signIn: "Sign in",
  signOut: "Sign out",
  home: "Home",
  recipes: "Recipes",
  fridge: "Fridge",
  mealPlan: "Meal plan",
  shopping: "Shopping list",
  training: "Training",
  articles: "Articles",
  quickActions: "Quick actions",
  whatYouAdded: "What you added today",
  recommendations: "Recommendations",
  calcCalories: "Calculate calories",
  weekPlan: "Meal plan for the week",
  preview: "Preview",
  details: "Details",
  keepPace: "Keep the pace!",
  onTheRightTrack: "You're on the right track",
  viewAchievements: "View achievements",
  aiCoach: "AI Coach",
  aiInsights: "AI Insights",
  aiWorkoutGenerator: "AI Workout Generator",
  aiNutritionPlanner: "AI Nutrition Planner",
  aiAnalytics: "AI Analytics",
  aiWeeklySummary: "AI Weekly Summary",
  aiNotifications: "AI Notifications",
  
  // Додаткові переклади
  loading: "Loading...",
  error: "Error",
  success: "Success",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  add: "Add",
  search: "Search",
  close: "Close",
  back: "Back",
  next: "Next",
  previous: "Previous",
  yes: "Yes",
  no: "No",
  ok: "OK",
  retry: "Retry",
  refresh: "Refresh",
  settings: "Settings",
  logout: "Logout",
  login: "Login",
  register: "Register",
  
  // Харчування
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  meals: "Meals",
  calories: "Calories",
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
  
  // Статистика
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "This Week",
  thisMonth: "This Month",
  progress: "Progress",
  goal: "Goal",
  achieved: "Achieved",
  remaining: "Remaining",
  
  // Загальні
  name: "Name",
  email: "Email",
  password: "Password",
  age: "Age",
  gender: "Gender",
  height: "Height",
  weight: "Weight",
  days: "days",
  guest: "Guest",
  water: "Water",
  steps: "Steps",
  burned: "Burned",
  activity: "Activity",
  
  // AI components
  tipOfTheDay: "Tip of the day",
  motivation: "Motivation",
  attention: "Attention",
  achievement: "Achievement",
  yourAIAssistant: "Your AI assistant",
  updatedJustNow: "Updated just now",
  aiActive: "AI active",
  viewRecipes: "View recipes",
  viewProgress: "View progress",
  addWater: "Add water",
  viewStatistics: "View statistics",
  tryAddingMoreProtein: "Try adding more protein to breakfast for better satiety",
  greatWork: "Great work! You're on the right track to achieving your goal",
  dontForgetWater: "Don't forget to drink water! Today you drank less than normal",
  congratulations: "Congratulations! You have completed your weekly training goal",
  creatingPersonalProgram: "Creating a personal program based on your goals",
  aiWillSendPersonalTips: "AI will send you personal tips and reminders",
  
  // Profile
  user: "User",
  level: "Level",
  daysInRow: "days in a row",
  statistics: "Statistics",
  benchPress: "Bench Press",
  running5k: "5K Run",
  plank: "Plank",
  kg: "kg",
  min: "min",
  firstWorkout: "First Workout",
  completeFirstWorkout: "Complete your first workout",
  weekInRow: "Week in a Row",
  train7DaysInRow: "Train 7 days in a row",
  strongman: "Strongman",
  lift100kgBench: "Lift 100kg in bench press",
  marathoner: "Marathoner",
  run42km: "Run 42km",
  reachLevel20: "Reach level 20",
  nextMilestone: "100 workouts",
  
  // AI Coach
  aiCoachTitle: "AI Coach",
  personalAssistant: "Your personal healthy lifestyle assistant",
  
  // AI Coach Chat
  aiCoachGreeting: "Hello! I'm your personal AI coach. Ready to help with questions about nutrition, workouts and healthy lifestyle. What interests you?",
  waterRecommendation: "It's recommended to drink 30-35 ml of water per 1 kg of body weight per day. That's approximately 2-3 liters for a person weighing 70 kg. Drink water evenly throughout the day, especially before and after workouts.",
  preWorkoutMeal: "Before training (1-2 hours before) eat carbohydrates with a small amount of protein: banana with nuts, oatmeal with berries, or toast with peanut butter. Avoid fatty and heavy foods.",
  sleepTips: "To improve sleep: go to bed and wake up at the same time, avoid screens an hour before sleep, ventilate the room, don't eat 3 hours before sleep, exercise, but not late in the evening.",
  aiTyping: "AI typing...",
  askQuestionPlaceholder: "Ask AI coach a question...",
  
  // Popular questions
  popularQuestions: "Popular questions:",
  howToLoseWeightFaster: "How to lose weight faster?",
  absExercises: "What exercises for abs?",
  howMuchWaterPerDay: "How much water to drink per day?",
  howToGainMuscle: "How to gain muscle mass?",
  whatToEatBeforeWorkout: "What to eat before workout?",
  howToImproveSleep: "How to improve sleep?",
  
  // Profile components
  levelTitle: "Level",
  startWorkout: "Start Workout",
  weekAnalysis: "AI Week Analysis",
  weekTitle: "Week",
  completedDays: "Completed",
  ofDays: "of",
  aiInsight: "🧠 AI Insight:",
  
  // Additional translations
  aiMealPlanSaved: "AI meal plan saved!",
  aiWorkoutStarted: "AI workout started!",
  onboardingActive: "Show onboarding if it's active",
  aiDataAnalysis: "AI Data Analysis",
  aiConfidence: "AI Confidence",
  aiAnalyzed: "AI analyzed",
  aspects: "aspects",
  yourProgress: "of your progress",
  
  // Comments
  aiWorkoutLogic: "AI workout start logic",
  aiMealPlanLogic: "AI meal plan save logic",
  
  // Additional comments
  dashboardStats: "Dashboard statistics",
  
  // Additional translations
  viewPlan: "View plan",
  trainers: "Trainers",
  music: "Music",
  ittenWheel: "Itten's Wheel",
  colorHarmony: "Color Harmony",
  ittenWheelDesc: "Determining harmonious combinations of colors",
  complementary: "Complementary",
  analogous: "Analogous",
  triadic: "Triadic",
  splitComplementary: "Split-Complementary",
  tetradic: "Tetradic (Double Complementary)",
  baseColor: "Base Color",
  harmonyScheme: "Harmony Scheme",
  copyHex: "Copy HEX",
  copyRgb: "Copy RGB",
  copyHsl: "Copy HSL",
  copied: "Copied!",
  colorCode: "Color Code",
  sandboxTitle: "Interactive Sandbox",
  sandboxDesc: "Real-time preview of color application in UI design",
  codeExport: "Code Export",
  codeExportDesc: "Ready-to-use styles and React/Tailwind components",
};

type I18nContextValue = {
  t: (k: keyof typeof uk) => string;
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);
const KEY = "omomo_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("uk");

  useEffect(() => {
    const raw = localStorage.getItem(KEY) as Locale | null;
    if (raw === "en" || raw === "uk") setLocale(raw);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, locale);
  }, [locale]);

  const dict = locale === "uk" ? uk : en;
  const t = (k: keyof typeof uk) => dict[k] || String(k);
  const value = useMemo<I18nContextValue>(() => ({ t, locale, setLocale }), [t, locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}


