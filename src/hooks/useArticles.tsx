import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Article, 
  ArticleCategory, 
  UserArticleInteraction, 
  ArticleRecommendation, 
  UserReadingStats,
  InteractionType,
  RecommendationReason
} from '@/lib/article-types';
import { 
  ARTICLES_DATABASE, 
  DEFAULT_ARTICLE_CATEGORIES,
  getArticlesByCategory,
  getFeaturedArticles,
  getRecentArticles,
  searchArticles,
  getArticleById,
  getRelatedArticles,
  getPopularArticles
} from '@/lib/articles-database';
import { useAuth } from './useAuth';
import { useDaily } from './useDaily';
// import { useWorkouts } from './useWorkouts';
import { toast } from 'sonner';

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
  : (import.meta.env.VITE_API_BASE_URL || '');

const STORAGE_KEYS = {
  USER_INTERACTIONS: 'omomo_article_interactions',
  SAVED_ARTICLES: 'omomo_saved_articles',
  READING_STATS: 'omomo_reading_stats',
  USER_ARTICLES: 'omomo_user_articles'
};

export function useArticles() {
  const { user } = useAuth();
  // const { dailyData } = useDaily();
  // const { workoutGoals, completedWorkouts } = useWorkouts();
  const workoutGoals: any[] = [];
  const completedWorkouts: any[] = [];
  
  const [userInteractions, setUserInteractions] = useState<UserArticleInteraction[]>([]);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [backendArticles, setBackendArticles] = useState<Article[]>([]);
  const [readingStats, setReadingStats] = useState<UserReadingStats>({
    totalArticlesRead: 0,
    totalReadingTime: 0,
    favoriteCategories: [],
    readingStreak: 0,
    lastReadAt: '',
    averageReadingTime: 0,
    mostReadTags: []
  });

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedInteractions = localStorage.getItem(STORAGE_KEYS.USER_INTERACTIONS);
      if (savedInteractions) {
        setUserInteractions(JSON.parse(savedInteractions));
      }

      const savedArticlesData = localStorage.getItem(STORAGE_KEYS.SAVED_ARTICLES);
      if (savedArticlesData) {
        setSavedArticles(JSON.parse(savedArticlesData));
      }

      const savedStats = localStorage.getItem(STORAGE_KEYS.READING_STATS);
      if (savedStats) {
        setReadingStats(JSON.parse(savedStats));
      }

      const savedUserArticles = localStorage.getItem(STORAGE_KEYS.USER_ARTICLES);
      if (savedUserArticles) {
        setUserArticles(JSON.parse(savedUserArticles));
      }
    } catch (error) {
      console.error('Error loading article data:', error);
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INTERACTIONS, JSON.stringify(userInteractions));
    } catch (error) {
      console.error('Error saving user interactions:', error);
    }
  }, [userInteractions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_ARTICLES, JSON.stringify(savedArticles));
    } catch (error) {
      console.error('Error saving saved articles:', error);
    }
  }, [savedArticles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.READING_STATS, JSON.stringify(readingStats));
    } catch (error) {
      console.error('Error saving reading stats:', error);
    }
  }, [readingStats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ARTICLES, JSON.stringify(userArticles));
    } catch (error) {
      console.error('Error saving user articles:', error);
    }
  }, [userArticles]);

  // Получение статей с сервера
  useEffect(() => {
    fetch(`${API_BASE}/api/articles`)
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          // Маппинг данных с бекенда в формат Article
          const mappedArticles: Article[] = data.articles.map((a: any) => ({
            id: a._id,
            title: a.title,
            titleUk: a.titleUk,
            excerpt: a.excerpt || "",
            excerptUk: a.excerptUk || "",
            content: a.content,
            contentUk: a.contentUk,
            author: a.authorName || "User",
            authorUk: a.authorNameUk || "Користувач",
            authorId: a.authorId,
            category: DEFAULT_ARTICLE_CATEGORIES.find(c => c.id === a.categoryId) || DEFAULT_ARTICLE_CATEGORIES[0],
            tags: a.tags || [],
            publishedAt: a.publishedAt,
            readTime: a.readingTime ? `${a.readingTime} хв читання` : "5 хв читання",
            readingTime: a.readingTime || 5,
            imageUrl: a.imageUrl || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop",
            imageAlt: a.imageAlt || "Article image",
            imageAltUk: a.imageAltUk || "Зображення до статті",
            difficulty: a.difficulty as any,
            views: a.views || 0,
            likes: a.likes || 0,
            saves: a.saves || 0,
            isPublished: true
          }));
          setBackendArticles(mappedArticles);
        }
      })
      .catch(console.error);
  }, []);

  // Получение всех статей
  const allArticles = useMemo(() => {
    const publishedArticles = ARTICLES_DATABASE.filter(article => article.isPublished);
    return [...publishedArticles, ...backendArticles, ...userArticles];
  }, [userArticles, backendArticles]);

  // Получение всех категорий
  const allCategories = useMemo(() => {
    return DEFAULT_ARTICLE_CATEGORIES.filter(category => category.isActive);
  }, []);

  // Регистрация взаимодействия с статьей
  const recordInteraction = useCallback((articleId: string, type: InteractionType, metadata?: Record<string, any>) => {
    const interaction: UserArticleInteraction = {
      id: crypto.randomUUID(),
      userId: user?.id || 'anonymous',
      articleId,
      type,
      createdAt: new Date().toISOString(),
      metadata
    };

    setUserInteractions(prev => [interaction, ...prev]);

    // Обновляем статистику чтения
    if (type === 'view') {
      updateReadingStats(articleId);
    }

    // Обновляем счетчики статьи
    const article = getArticleById(articleId);
    if (article) {
      // В реальном приложении это должно обновляться на сервере
      console.log(`Recorded ${type} interaction for article: ${article.title}`);
    }
  }, [user]);

  // Обновление статистики чтения
  const updateReadingStats = useCallback((articleId: string) => {
    const article = getArticleById(articleId);
    if (!article) return;

    const now = new Date().toISOString();
    const lastRead = new Date(readingStats.lastReadAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastRead.setHours(0, 0, 0, 0);

    const isNewDay = lastRead.getTime() !== today.getTime();
    const newStreak = isNewDay ? 
      (lastRead.getTime() === today.getTime() - 24 * 60 * 60 * 1000 ? readingStats.readingStreak + 1 : 1) :
      readingStats.readingStreak;

    setReadingStats(prev => ({
      ...prev,
      totalArticlesRead: prev.totalArticlesRead + 1,
      totalReadingTime: prev.totalReadingTime + article.readingTime,
      readingStreak: newStreak,
      lastReadAt: now,
      averageReadingTime: (prev.totalReadingTime + article.readingTime) / (prev.totalArticlesRead + 1)
    }));
  }, [readingStats]);

  // Лайк статьи
  const likeArticle = useCallback((articleId: string) => {
    recordInteraction(articleId, 'like');
    toast.success('Статтю додано в улюблені!');
  }, [recordInteraction]);

  // Сохранение статьи
  const saveArticle = useCallback((articleId: string) => {
    if (savedArticles.includes(articleId)) {
      setSavedArticles(prev => prev.filter(id => id !== articleId));
      toast.success('Статтю видалено з улюблених');
    } else {
      setSavedArticles(prev => [...prev, articleId]);
      recordInteraction(articleId, 'save');
      toast.success('Статтю збережено в улюблені!');
    }
  }, [savedArticles, recordInteraction]);

  // Проверка, сохранена ли статья
  const isArticleSaved = useCallback((articleId: string) => {
    return savedArticles.includes(articleId);
  }, [savedArticles]);

  // Проверка, лайкнута ли статья
  const isArticleLiked = useCallback((articleId: string) => {
    return userInteractions.some(interaction => 
      interaction.articleId === articleId && interaction.type === 'like'
    );
  }, [userInteractions]);

  // Система рекомендаций
  const getPersonalizedRecommendations = useCallback((limit: number = 10): ArticleRecommendation[] => {
    try {
      const recommendations: ArticleRecommendation[] = [];
      const userGoal = workoutGoals?.find(goal => !goal.isCompleted);
      const recentWorkouts = completedWorkouts?.slice(0, 5) || [];
      const recentInteractions = userInteractions.slice(0, 20);

    // Рекомендации на основе целей пользователя
    if (userGoal) {
      const goalCategory = getCategoryByGoal(userGoal.nameUk);
      if (goalCategory) {
        const goalArticles = getArticlesByCategory(goalCategory.id)
          .filter(article => !recentInteractions.some(i => i.articleId === article.id))
          .slice(0, 3);
        
        goalArticles.forEach(article => {
          recommendations.push({
            articleId: article.id,
            score: 0.9,
            reason: 'user_goal',
            reasonText: 'Matches your fitness goals',
            reasonTextUk: 'Відповідає вашим фітнес-цілям'
          });
        });
      }
    }

    // Рекомендации на основе активности
    if (recentWorkouts.length > 0) {
      const workoutTypes = recentWorkouts.flatMap(workout => 
        workout.exercises.map(ex => ex.exercise.primaryMuscleGroup)
      );
      const mostCommonMuscleGroup = getMostCommon(workoutTypes);
      
      if (mostCommonMuscleGroup) {
        const trainingArticles = getArticlesByCategory('training')
          .filter(article => 
            article.tags.some(tag => tag.toLowerCase().includes(mostCommonMuscleGroup.toLowerCase())) &&
            !recentInteractions.some(i => i.articleId === article.id)
          )
          .slice(0, 2);
        
        trainingArticles.forEach(article => {
          recommendations.push({
            articleId: article.id,
            score: 0.8,
            reason: 'user_activity',
            reasonText: 'Based on your recent workouts',
            reasonTextUk: 'На основі ваших останніх тренувань'
          });
        });
      }
    }

    // Рекомендации на основе предпочтений
    const likedCategories = recentInteractions
      .filter(i => i.type === 'like')
      .map(i => getArticleById(i.articleId)?.category.id)
      .filter(Boolean);
    
    const mostLikedCategory = getMostCommon(likedCategories);
    if (mostLikedCategory) {
      const preferenceArticles = getArticlesByCategory(mostLikedCategory)
        .filter(article => !recentInteractions.some(i => i.articleId === article.id))
        .slice(0, 2);
      
      preferenceArticles.forEach(article => {
        recommendations.push({
          articleId: article.id,
          score: 0.7,
          reason: 'user_preferences',
          reasonText: 'Similar to articles you liked',
          reasonTextUk: 'Схоже на статті, які вам сподобались'
        });
      });
    }

    const popularArticles = getPopularArticles(5)
      .filter(article => !recentInteractions.some(i => i.articleId === article.id))
      .slice(0, 3);
    
    popularArticles.forEach(article => {
      recommendations.push({
        articleId: article.id,
        score: 0.6,
        reason: 'trending',
        reasonText: 'Popular right now',
        reasonTextUk: 'Популярне зараз'
      });
    });

    // Сортируем по score и возвращаем лимит
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    } catch (error) {
      console.error('Error in getPersonalizedRecommendations:', error);
      return [];
    }
  }, [completedWorkouts, userInteractions, workoutGoals]);

  // Получение персонализированной ленты
  const getPersonalizedFeed = useCallback((limit: number = 10): Article[] => {
    try {
      const recommendations = getPersonalizedRecommendations(limit);
      return recommendations
        .map(rec => getArticleById(rec.articleId))
        .filter(Boolean) as Article[];
    } catch (error) {
      console.error('Error in getPersonalizedFeed:', error);
      throw error;
    }
  }, [getPersonalizedRecommendations]);

  // Получение сохраненных статей
  const getSavedArticles = useCallback((): Article[] => {
    return savedArticles
      .map(id => getArticleById(id))
      .filter(Boolean) as Article[];
  }, [savedArticles]);

  // Получение истории чтения
  const getReadingHistory = useCallback((): Article[] => {
    const viewedArticles = userInteractions
      .filter(i => i.type === 'view')
      .map(i => i.articleId);
    
    const uniqueArticles = [...new Set(viewedArticles)];
    return uniqueArticles
      .map(id => getArticleById(id))
      .filter(Boolean) as Article[];
  }, [userInteractions]);

  // Вспомогательные функции
  const getCategoryByGoal = (goalName: string): ArticleCategory | null => {
    const goalLower = goalName.toLowerCase();
    if (goalLower.includes('схуднення') || goalLower.includes('weight loss')) {
      return allCategories.find(c => c.id === 'nutrition') || null;
    }
    if (goalLower.includes('маса') || goalLower.includes('muscle')) {
      return allCategories.find(c => c.id === 'training') || null;
    }
    if (goalLower.includes('сила') || goalLower.includes('strength')) {
      return allCategories.find(c => c.id === 'training') || null;
    }
    return null;
  };

  const getMostCommon = (arr: (string | undefined)[]): string | null => {
    const counts: Record<string, number> = {};
    arr.forEach(item => {
      if (item) {
        counts[item] = (counts[item] || 0) + 1;
      }
    });
    
    const mostCommon = Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostCommon ? mostCommon[0] : null;
  };

  // Функции для управления пользовательскими статьями
  const createUserArticle = useCallback(async (article: Article) => {
    try {
      const token = localStorage.getItem('omomo_auth_token');
      if (!token) {
        toast.error('Ви повинні бути авторизовані для створення статті');
        return;
      }
      
      const payload = {
        title: article.title,
        titleUk: article.titleUk,
        excerpt: article.excerpt,
        excerptUk: article.excerptUk,
        content: article.content,
        contentUk: article.contentUk,
        categoryId: article.category.id,
        tags: article.tags,
        difficulty: article.difficulty,
        readingTime: article.readingTime,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        imageAltUk: article.imageAltUk
      };

      const res = await fetch(`${API_BASE}/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success('Ваша стаття відправлена на модерацію!');
        // We do not add it directly to userArticles until approved by admin
      } else {
        toast.error('Помилка при створенні статті');
      }
    } catch (error) {
      console.error(error);
      toast.error('Сталася помилка');
    }
  }, []);

  const updateUserArticle = useCallback((articleId: string, updates: Partial<Article>) => {
    setUserArticles(prev => prev.map(article => 
      article.id === articleId ? { ...article, ...updates, updatedAt: new Date().toISOString() } : article
    ));
    toast.success('Статтю успішно оновлено!');
  }, []);

  const deleteUserArticle = useCallback(async (articleId: string) => {
    try {
      const token = localStorage.getItem('omomo_auth_token');
      if (token) {
        // Also try to delete from backend if it exists there
        const API_BASE = import.meta.env.PROD
          ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
          : (import.meta.env.VITE_API_BASE_URL || '');
          
        await fetch(`${API_BASE}/api/articles/${articleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Remove from backendArticles state if present
        setBackendArticles(prev => prev.filter(article => article.id !== articleId));
      }
      
      // Remove from local userArticles state
      setUserArticles(prev => prev.filter(article => article.id !== articleId));
      toast.success('Статтю успішно видалено!');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Помилка при видаленні статті');
    }
  }, []);

  const getUserArticles = useCallback(() => {
    return userArticles;
  }, [userArticles]);

  return {
    // Данные
    allArticles,
    allCategories,
    savedArticles: getSavedArticles(),
    readingHistory: getReadingHistory(),
    readingStats,
    
    // Функции взаимодействия
    recordInteraction,
    likeArticle,
    saveArticle,
    isArticleSaved,
    isArticleLiked,
    
    // Рекомендации и лента
    getPersonalizedRecommendations,
    getPersonalizedFeed,
    
    // Утилиты
    getArticleById,
    getArticlesByCategory,
    getFeaturedArticles,
    getRecentArticles,
    searchArticles,
    getRelatedArticles,
    getPopularArticles,
    
    // Управление пользовательскими статьями
    createUserArticle,
    updateUserArticle,
    deleteUserArticle,
    getUserArticles
  };
}
