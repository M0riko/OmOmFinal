export interface Article {
  id: string;
  title: string;
  titleUk: string;
  excerpt: string;
  excerptUk: string;
  content: string;
  contentUk: string;
  author: string;
  authorUk: string;
  publishedAt: string;
  updatedAt: string;
  category: ArticleCategory;
  tags: string[];
  readingTime: number; // в минутах
  difficulty: ArticleDifficulty;
  featured: boolean;
  imageUrl?: string;
  imageAlt?: string;
  imageAltUk?: string;
  sourceUrl?: string; // для кураторского контента
  sourceName?: string;
  isCurated: boolean; // true если это кураторский контент
  views: number;
  likes: number;
  saves: number;
  comments: ArticleComment[];
  callToActions: CallToAction[];
  relatedArticles: string[]; // ID связанных статей
  isPublished: boolean;
  isCustom: boolean;
  createdBy?: string;
}

export interface ArticleComment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: ArticleComment[];
  isEdited: boolean;
}

export interface CallToAction {
  id: string;
  type: CallToActionType;
  title: string;
  titleUk: string;
  description?: string;
  descriptionUk?: string;
  action: CallToActionAction;
  position: 'inline' | 'end' | 'sidebar';
  priority: number;
  isActive: boolean;
}

export interface CallToActionAction {
  type: 'navigate' | 'filter' | 'modal' | 'external';
  target: string; // путь или идентификатор
  params?: Record<string, any>; // параметры для фильтров или модалов
  externalUrl?: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  descriptionUk: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface UserArticleInteraction {
  id: string;
  userId: string;
  articleId: string;
  type: InteractionType;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ArticleRecommendation {
  articleId: string;
  score: number;
  reason: RecommendationReason;
  reasonText: string;
  reasonTextUk: string;
}

export interface UserReadingStats {
  totalArticlesRead: number;
  totalReadingTime: number; // в минутах
  favoriteCategories: Array<{
    categoryId: string;
    categoryName: string;
    readCount: number;
    percentage: number;
  }>;
  readingStreak: number; // дней подряд
  lastReadAt: string;
  averageReadingTime: number;
  mostReadTags: Array<{
    tag: string;
    count: number;
  }>;
}

export type ArticleCategoryType = 
  | 'nutrition' | 'training' | 'recovery' | 'motivation' | 'science' 
  | 'lifestyle' | 'recipes' | 'supplements' | 'mental_health' | 'injury_prevention';

export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type InteractionType = 'view' | 'like' | 'save' | 'share' | 'comment' | 'complete';

export type CallToActionType = 
  | 'find_recipes' | 'start_workout' | 'track_nutrition' | 'set_goal' 
  | 'add_to_shopping' | 'plan_meal' | 'track_sleep' | 'join_challenge';

export type RecommendationReason = 
  | 'user_goal' | 'user_activity' | 'user_preferences' | 'trending' 
  | 'category_match' | 'tag_match' | 'similar_users' | 'new_content';

// Константы для маппинга
export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategoryType, string> = {
  nutrition: 'Харчування',
  training: 'Тренування',
  recovery: 'Відновлення',
  motivation: 'Мотивація',
  science: 'Наука та дослідження',
  lifestyle: 'Стиль життя',
  recipes: 'Рецепти',
  supplements: 'Добавки',
  mental_health: 'Психічне здоров\'я',
  injury_prevention: 'Профілактика травм'
};

export const ARTICLE_DIFFICULTY_LABELS: Record<ArticleDifficulty, string> = {
  beginner: 'Початківець',
  intermediate: 'Середній',
  advanced: 'Просунутий'
};

export const CALL_TO_ACTION_LABELS: Record<CallToActionType, string> = {
  find_recipes: 'Знайти рецепти',
  start_workout: 'Почати тренування',
  track_nutrition: 'Відстежити харчування',
  set_goal: 'Встановити ціль',
  add_to_shopping: 'Додати в список покупок',
  plan_meal: 'Запланувати прийом їжі',
  track_sleep: 'Відстежити сон',
  join_challenge: 'Приєднатися до челенджу'
};

export const RECOMMENDATION_REASON_LABELS: Record<RecommendationReason, string> = {
  user_goal: 'Відповідає вашим цілям',
  user_activity: 'На основі вашої активності',
  user_preferences: 'Згідно з вашими вподобаннями',
  trending: 'Популярне зараз',
  category_match: 'Ваша улюблена категорія',
  tag_match: 'Схожі інтереси',
  similar_users: 'Читають схожі користувачі',
  new_content: 'Новий контент'
};

// Предустановленные категории
export const DEFAULT_ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    id: 'nutrition',
    name: 'Nutrition',
    nameUk: 'Харчування',
    description: 'Articles about healthy eating, nutrition science, and dietary strategies',
    descriptionUk: 'Статті про здорове харчування, науку про харчування та дієтичні стратегії',
    icon: 'Apple',
    color: '#10B981',
    order: 1,
    isActive: true
  },
  {
    id: 'training',
    name: 'Training',
    nameUk: 'Тренування',
    description: 'Workout guides, exercise techniques, and training programs',
    descriptionUk: 'Путівники по тренуваннях, техніки вправ та тренувальні програми',
    icon: 'Dumbbell',
    color: '#3B82F6',
    order: 2,
    isActive: true
  },
  {
    id: 'recovery',
    name: 'Recovery',
    nameUk: 'Відновлення',
    description: 'Rest, sleep, and recovery strategies for optimal performance',
    descriptionUk: 'Стратегії відпочинку, сну та відновлення для оптимальної продуктивності',
    icon: 'Moon',
    color: '#8B5CF6',
    order: 3,
    isActive: true
  },
  {
    id: 'motivation',
    name: 'Motivation',
    nameUk: 'Мотивація',
    description: 'Inspirational content, success stories, and mindset tips',
    descriptionUk: 'Надихаючий контент, історії успіху та поради щодо мислення',
    icon: 'Zap',
    color: '#F59E0B',
    order: 4,
    isActive: true
  },
  {
    id: 'science',
    name: 'Science & Research',
    nameUk: 'Наука та дослідження',
    description: 'Evidence-based articles and scientific research',
    descriptionUk: 'Статті на основі доказів та наукові дослідження',
    icon: 'Microscope',
    color: '#EF4444',
    order: 5,
    isActive: true
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    nameUk: 'Стиль життя',
    description: 'Healthy lifestyle tips and habits',
    descriptionUk: 'Поради щодо здорового способу життя та звички',
    icon: 'Heart',
    color: '#EC4899',
    order: 6,
    isActive: true
  },
  {
    id: 'recipes',
    name: 'Recipes',
    nameUk: 'Рецепти',
    description: 'Healthy recipes and cooking tips',
    descriptionUk: 'Здорові рецепти та поради з приготування їжі',
    icon: 'ChefHat',
    color: '#F97316',
    order: 7,
    isActive: true
  },
  {
    id: 'supplements',
    name: 'Supplements',
    nameUk: 'Добавки',
    description: 'Information about supplements and their effects',
    descriptionUk: 'Інформація про добавки та їх вплив',
    icon: 'Pill',
    color: '#06B6D4',
    order: 8,
    isActive: true
  },
  {
    id: 'mental_health',
    name: 'Mental Health',
    nameUk: 'Психічне здоров\'я',
    description: 'Mental health and wellness articles',
    descriptionUk: 'Статті про психічне здоров\'я та благополуччя',
    icon: 'Brain',
    color: '#84CC16',
    order: 9,
    isActive: true
  },
  {
    id: 'injury_prevention',
    name: 'Injury Prevention',
    nameUk: 'Профілактика травм',
    description: 'Tips for preventing injuries and staying safe',
    descriptionUk: 'Поради щодо запобігання травмам та безпеки',
    icon: 'Shield',
    color: '#6B7280',
    order: 10,
    isActive: true
  }
];
