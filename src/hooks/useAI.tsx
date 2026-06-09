import { useState, useCallback } from 'react';
import { 
  getDailyInsight, 
  generateWorkoutPlan, 
  generateMealPlan, 
  analyzeProgress, 
  chatWithAICoach, 
  generateMotivation,
  analyzeUserData
} from '@/lib/openai-ai';

interface UserData {
  calories: number;
  water: number;
  sleep: number;
  weight?: number;
  goals?: string[];
  activity?: string;
  age?: number;
  gender?: string;
}

interface AIInsight {
  type: 'tip' | 'warning' | 'motivation' | 'achievement';
  title: string;
  message: string;
  emoji: string;
}

interface WorkoutPlan {
  name: string;
  duration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest: number;
  }>;
  description: string;
}

interface MealPlan {
  name: string;
  meals: Array<{
    type: string;
    name: string;
    calories: number;
    description: string;
  }>;
  totalCalories: number;
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Отримання щоденної поради
  const getInsight = useCallback(async (userData: UserData): Promise<AIInsight | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const insight = await getDailyInsight(userData);
      return insight;
    } catch (err) {
      setError('Помилка отримання AI поради');
      console.error('AI Insight Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Генерація плану тренувань
  const generateWorkout = useCallback(async (goals: string[], userLevel: string = 'початківець'): Promise<WorkoutPlan | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const workout = await generateWorkoutPlan(goals, userLevel);
      return workout;
    } catch (err) {
      setError('Помилка генерації плану тренувань');
      console.error('Workout Generation Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Генерація плану харчування
  const generateMeal = useCallback(async (goals: string[], targetCalories: number = 2000): Promise<MealPlan | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const mealPlan = await generateMealPlan(goals, targetCalories);
      return mealPlan;
    } catch (err) {
      setError('Помилка генерації плану харчування');
      console.error('Meal Plan Generation Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Аналіз прогресу
  const analyzeUserProgress = useCallback(async (stats: any): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const analysis = await analyzeProgress(stats);
      return analysis;
    } catch (err) {
      setError('Помилка аналізу прогресу');
      console.error('Progress Analysis Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Чат з AI коучем
  const chatWithCoach = useCallback(async (message: string, context?: any): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await chatWithAICoach(message, context);
      return response;
    } catch (err) {
      setError('Помилка чату з AI коучем');
      console.error('AI Coach Chat Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Генерація мотивації
  const generateUserMotivation = useCallback(async (userProgress: any): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const motivation = await generateMotivation(userProgress);
      return motivation;
    } catch (err) {
      setError('Помилка генерації мотивації');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Глибокий аналіз даних користувача
  const analyzeUserDataDeep = useCallback(async (userData: any): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const analysis = await analyzeUserData(userData);
      return analysis;
    } catch (err) {
      setError('Помилка аналізу даних');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getInsight,
    generateWorkout,
    generateMeal,
    analyzeUserProgress,
    chatWithCoach,
    generateUserMotivation,
    analyzeUserDataDeep
  };
}
