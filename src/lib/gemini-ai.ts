// Google Gemini AI Integration
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC5Hl1YYhs99b0Ms0fNtzR1_gRTxCoF-Iw';
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

const ai = new GoogleGenAI({ 
  apiKey: GEMINI_API_KEY 
});


// Функція для retry з експоненційною затримкою
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Визначаємо статус код помилки (різні формати помилок)
      const statusCode = error?.status || 
                        error?.statusCode || 
                        error?.response?.status || 
                        error?.response?.statusCode ||
                        (error?.message?.includes('429') ? 429 : null) ||
                        (error?.message?.includes('503') ? 503 : null);
      
      const isRateLimit = statusCode === 429;
      const isServiceUnavailable = statusCode === 503;
      
      // Якщо це не 429 або 503 - викидаємо помилку одразу
      if (!isRateLimit && !isServiceUnavailable) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Експоненційна затримка з jitter
      const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms (Status: ${statusCode})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Інтерфейси для типізації
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

interface AIInsight {
  type: 'tip' | 'warning' | 'motivation' | 'achievement';
  title: string;
  message: string;
  emoji: string;
}

// Функція для отримання щоденної поради AI
export async function getDailyInsight(userData: UserData): Promise<AIInsight> {
  try {
    const prompt = `
    Проаналізуй дані користувача та дай коротку мотиваційну пораду українською мовою:
    
    Дані користувача:
    - Калорії сьогодні: ${userData.calories}
    - Вода: ${userData.water}л
    - Сон: ${userData.sleep}г
    - Вага: ${userData.weight || 'не вказано'}кг
    - Цілі: ${userData.goals?.join(', ') || 'не вказано'}
    
    Відповідь у форматі JSON:
    {
      "type": "tip|warning|motivation|achievement",
      "title": "Короткий заголовок",
      "message": "Порада українською мовою (максимум 100 символів)",
      "emoji": "тип іконки (tip, warning, motivation, achievement)"
    }
    `;

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    });
    
    // Парсимо JSON відповідь (видаляємо markdown блоки якщо є)
    let jsonText = response.text;
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    const insight = JSON.parse(jsonText);
    return insight;
    } catch (error: any) {
    console.error('Помилка отримання AI поради:', error);
    
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
    
    if (statusCode === 429) {
      throw new Error('Наразі занадто багато запитів до AI. Спробуйте через кілька секунд.');
    } else if (statusCode === 503) {
      throw new Error('AI сервіс тимчасово недоступний. Спробуйте через хвилину.');
    }
    
    throw new Error('Не вдалося отримати AI пораду. Спробуйте ще раз.');
  }
}

// Функція для генерації плану тренувань
export async function generateWorkoutPlan(goals: string[], userLevel: string = 'початківець'): Promise<WorkoutPlan> {
  try {
    const prompt = `
    Створи план тренувань українською мовою для користувача з цілями: ${goals.join(', ')} та рівнем: ${userLevel}
    
    Відповідь у форматі JSON:
    {
      "name": "Назва тренування",
      "duration": 45,
      "exercises": [
        {
          "name": "Назва вправи",
          "sets": 3,
          "reps": "10-12",
          "rest": 60
        }
      ],
      "description": "Опис тренування українською мовою"
    }
    `;

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const workoutPlan = JSON.parse(text);
    return workoutPlan;
  } catch (error: any) {
    console.error('Помилка генерації плану тренувань:', error);
    
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
    
    if (statusCode === 429) {
      throw new Error('Наразі занадто багато запитів до AI. Спробуй через кілька секунд.');
    } else if (statusCode === 503) {
      throw new Error('AI сервіс тимчасово недоступний. Спробуй через хвилину.');
    }
    
    throw new Error('Не вдалося згенерувати план тренувань. Спробуйте ще раз!');
  }
}

// Функція для генерації плану харчування
export async function generateMealPlan(goals: string[], targetCalories: number = 2000): Promise<MealPlan> {
  try {
    const prompt = `
    Створи план харчування українською мовою для користувача з цілями: ${goals.join(', ')} та цільовими калоріями: ${targetCalories}
    
    Відповідь у форматі JSON:
    {
      "name": "Назва плану",
    "meals": [
      {
          "type": "сніданок|обід|вечеря|перекус",
          "name": "Назва страви",
          "calories": 400,
          "description": "Опис страви українською мовою"
        }
      ],
      "totalCalories": 2000
    }
    `;

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const mealPlan = JSON.parse(text);
    return mealPlan;
  } catch (error: any) {
    console.error('Помилка генерації плану харчування:', error);
    
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
    
    if (statusCode === 429) {
      throw new Error('Наразі занадто багато запитів до AI. Спробуй через кілька секунд.');
    } else if (statusCode === 503) {
      throw new Error('AI сервіс тимчасово недоступний. Спробуй через хвилину.');
    }
    
    throw new Error('Не вдалося згенерувати план харчування. Спробуйте ще раз!');
  }
}

// Функція для аналізу прогресу
export async function analyzeProgress(stats: any): Promise<string> {
  try {
    const prompt = `
    Проаналізуй статистику користувача та дай короткий аналіз українською мовою:
    
    Статистика:
    ${JSON.stringify(stats, null, 2)}
    
    Відповідь має бути короткою (максимум 150 символів) та мотиваційною українською мовою.
    `;

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    return text.trim();
  } catch (error: any) {
    console.error('Помилка аналізу прогресу:', error);
    
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
    
    if (statusCode === 429) {
      throw new Error('Наразі занадто багато запитів до AI. Спробуй через кілька секунд.');
    } else if (statusCode === 503) {
      throw new Error('AI сервіс тимчасово недоступний. Спробуй через хвилину.');
    }
    
    throw new Error('Не вдалося проаналізувати прогрес. Спробуйте ще раз!');
  }
}

// Функція для чату з AI коучем
export async function chatWithAICoach(message: string, context?: any): Promise<string> {
  try {
    // Збираємо контекст користувача
    const userContext = context ? `
    КОНТЕКСТ КОРИСТУВАЧА:
    - Профіль: ${context.user?.name || 'Не вказано'}, ${context.user?.age || 'Не вказано'} років, ${context.user?.gender || 'Не вказано'}
    - Цілі: ${context.user?.goals || 'Не вказано'}
    - Поточні цілі КБЖУ: ${context.user?.targets ? JSON.stringify(context.user.targets) : 'Не вказано'}
    - Щоденні дані: ${context.daily ? JSON.stringify(context.daily) : 'Не вказано'}
    - Статистика: ${context.stats ? JSON.stringify(context.stats) : 'Не вказано'}
    ` : '';

    const prompt = `
    Ти — персональний AI-Коуч, експерт зі здорового способу життя, харчування, фітнесу та психологічної підтримки.

    ТВОЯ ГОЛОВНА МЕТА:
    Допомогти користувачу досягти його цілей у фізичній формі, самопочутті та мотивації.

    ТВОЇ КЛЮЧОВІ РОЛІ:

    1. Персональний наставник:
       - Аналізуй дані користувача (вага, зріст, активність, цілі)
       - Давай конкретні поради на основі його профілю
       - Враховуй поточний стан та історію

    2. Мотиваційний психолог:
       - Надихай користувача позитивними повідомленнями
       - Підсилюй самооцінку та впевненість
       - Допомагай долати прокрастинацію та перешкоди
       - Використовуй дружній, позитивний тон

    3. Експерт з харчування:
       - Створюй збалансовані плани харчування
       - Пояснюй принципи БЖВ (білки, жири, вуглеводи)
       - Розказуй про глікемічний індекс та інші важливі аспекти
       - Допомагай з вибором продуктів та стравами

    4. Тренер:
       - Пропонуй персональні тренування
       - Враховуй рівень підготовки, стан здоров'я, доступний час
       - Підбирай вправи під конкретні цілі

    5. Аналітик прогресу:
       - Відстежуй результати та показники
       - Нагадуй про досягнення та успіхи
       - Пропонуй покращення та корекції

    ПРИНЦИПИ СПІЛКУВАННЯ:
    - Використовуй дружній, позитивний і мотивуючий тон, як у спілкуванні з другом-наставником
    - Уникай сухих або надто технічних пояснень
    - Якщо користувач задає запит без контексту — став уточнювальні питання
    - Відповіді мають бути короткі, структуровані, з чіткими порадами (списки, кроки, лайфхаки)
    - Ніколи не "вигадуй" — якщо бракує даних, чесно зазначай це
    - Уникай командного тону ("зроби", "треба") — замість цього: "Спробуй ось так", "Можеш обрати легший варіант"

    ТИПИ ВІДПОВІДЕЙ (адаптуй стиль під контекст):

    1. ЦІЛЬОВА ПОРАДА (коли користувач питає "як", "що", "порадь"):
       - Починай з мотиваційного вступу
       - Давай конкретні практичні кроки
       - Приклад: "Сьогодні ідеальний день, щоб трохи розім'ятись. Почни з 10 присідань або короткої прогулянки — це підніме енергію!"

    2. АНАЛІТИКА ПРОГРЕСУ (коли запитують про прогрес, статистику):
       - Використовуй конкретні числа та дані
       - Порівнюй з попередніми періодами
       - Приклад: "Клас! За останній тиждень ти спалив 1230 ккал. Це на 10% більше, ніж минулого тижня!"

    3. ПІДТРИМКА НАСТРОЮ (коли користувач ділиться емоціями або виникають складнощі):
       - Показуй розуміння та емпатію
       - Нагадуй про досягнення
       - Приклад: "Пам'ятай, навіть якщо день важкий — це частина шляху. Ти вже робиш більше, ніж думаєш."

    4. СИСТЕМНІ ПОВІДОМЛЕННЯ (коли відбувається обробка даних):
       - Коротко та інформативно
       - Приклади: "Оновлюю дані...", "Зберігаю твій прогрес", "Аналізую тренди — зачекай 2 секунди"

    ФОРМАТ ВІДПОВІДІ:
    Використовуй структурований формат з маркерами:
    - Висновок: коротка суть (1-2 речення)
    - Аналіз: факти, причини, зв'язки
    - Рекомендації: чіткі, практичні кроки
    - Додатково: висновок з аналітикою (якщо доречно)

    ТВОЄ ЗАВДАННЯ:
    Зробити так, щоб користувач відчував: "Я можу це зробити. У мене є підтримка."

    ${userContext}

    ПОВІДОМЛЕННЯ КОРИСТУВАЧА: ${message}

    Відповідай українською мовою, структуровано та корисно. Максимум 500 символів.
    НЕ використовуй емодзі — використовуй текст та структуровані маркери.
    `;

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    // Валідація відповіді
    if (!text || text.length < 10) {
      throw new Error('Не вдалося згенерувати відповідь. Спробуйте переформулювати питання.');
    }
    
    return text.trim();
  } catch (error: any) {
    console.error('Помилка чату з AI коучем:', error);
    
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
    
    // Повертаємо зрозуміле повідомлення про помилку
    if (statusCode === 429) {
      throw new Error('Наразі занадто багато запитів до AI. Спробуй через кілька секунд.');
    } else if (statusCode === 503) {
      throw new Error('AI сервіс тимчасово недоступний. Спробуй через хвилину.');
    }
    
    throw new Error('Вибачте, виникла помилка. Спробуйте ще раз!');
  }
}

// Функція для глибокого аналізу даних користувача
export async function analyzeUserData(userData: any): Promise<string> {
  try {
    const prompt = `
    Ти — AI-Коуч, експерт з аналізу даних здоров'я та фітнесу. Проаналізуй дані користувача та дай детальний висновок.

    ДАНІ КОРИСТУВАЧА:
    ${JSON.stringify(userData, null, 2)}

    ПРОВЕДИ АНАЛІЗ:
    1. Оціни поточний стан (харчування, активність, сон)
    2. Вияви проблемні зони та можливості для покращення
    3. Порівняй з цілями користувача
    4. Дай конкретні рекомендації

    ФОРМАТ ВІДПОВІДІ:
    Використовуй структурований формат з маркерами:
    - Висновок: загальна оцінка стану
    - Аналіз: детальний розбір кожної сфери
    - Рекомендації: конкретні кроки для покращення
    - Прогноз: що очікувати при дотриманні порад

    Відповідай українською мовою, структуровано та детально.
    НЕ використовуй емодзі — використовуй текст та структуровані маркери.
    `;

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    });
    
    let text = response.text;
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    return text.trim();
  } catch (error: any) {
    console.error('Помилка аналізу даних:', error);
    
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
    
    if (statusCode === 429) {
      throw new Error('Наразі занадто багато запитів до AI. Спробуй через кілька секунд.');
    } else if (statusCode === 503) {
      throw new Error('AI сервіс тимчасово недоступний. Спробуй через хвилину.');
    }
    
    throw new Error('Вибачте, не вдалося проаналізувати дані. Спробуйте ще раз!');
  }
}

// Функція для генерації мотиваційних повідомлень
export async function generateMotivation(userProgress: any): Promise<string> {
  try {
    const prompt = `
    Створи мотиваційне повідомлення українською мовою на основі прогресу користувача:
    
    Прогрес: ${JSON.stringify(userProgress, null, 2)}
    
    Повідомлення має бути коротким (максимум 100 символів), мотиваційним. НЕ використовуй емодзі — використовуй текст.
    `;

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    return text.trim();
  } catch (error: any) {
    console.error('Помилка генерації мотивації:', error);
    
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
    
    if (statusCode === 429) {
      throw new Error('Наразі занадто багато запитів до AI. Спробуй через кілька секунд.');
    } else if (statusCode === 503) {
      throw new Error('AI сервіс тимчасово недоступний. Спробуй через хвилину.');
    }
    
    throw new Error('Не вдалося згенерувати мотиваційне повідомлення. Спробуйте ще раз!');
  }
}

// Експорт всіх функцій
export default {
  getDailyInsight,
  generateWorkoutPlan,
  generateMealPlan,
  analyzeProgress,
  chatWithAICoach,
  generateMotivation
};