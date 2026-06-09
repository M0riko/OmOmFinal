// GitHub Models AI Integration
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.github.ai/inference";
const MODEL_NAME = "Llama-3.2-11B-Vision-Instruct";

function getGithubToken() {
  return import.meta.env.VITE_GITHUB_TOKEN || '';
}

function getClient() {
  return ModelClient(
    endpoint,
    new AzureKeyCredential(getGithubToken() || "dummy_key_to_prevent_crash")
  );
}

async function generateAIContent(prompt: string, jsonMode: boolean = false): Promise<string> {
  const token = getGithubToken();
  if (!token) {
    throw new Error('Ключ API не знайдено. Будь ласка, налаштуйте VITE_GITHUB_TOKEN у .env.');
  }

  const client = getClient();

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: jsonMode ? "You must return valid JSON only." : "" },
        { role: "user", content: prompt }
      ],
      model: MODEL_NAME,
      response_format: jsonMode ? { type: "json_object" } : undefined
    }
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  return response.body.choices[0].message.content || "";
}

async function generateGroqContent(prompt: string, jsonMode: boolean = false) {
  const text = await generateAIContent(prompt, jsonMode);
  return { text };
}
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
      
      // Експоненційна затримка з jitter - довший інтервал для 429
      const currentInitialDelay = isRateLimit ? 3000 : initialDelay;
      const delay = currentInitialDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`AI запит: Спроба ${attempt}/${maxRetries} не вдалася (Статус: ${statusCode}). Чекаємо ${delay}мс...`);
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
  const token = getGithubToken();
  if (!token) {
    return {
      type: 'tip',
      title: 'Підказка',
      message: 'Задайте VITE_GITHUB_TOKEN у .env для отримання AI порад.',
      emoji: 'tip'
    };
  }
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
      return await generateGroqContent(prompt);
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
    // Повертаємо fallback замість помилки, щоб не ламати UI
    const fallbacks = [
      { type: "motivation", title: "Рухайтесь вперед!", message: "Кожен крок наближає вас до цілі. Продовжуйте в тому ж дусі!", emoji: "💪" },
      { type: "tip", title: "Пийте воду", message: "Не забувайте про гідратацію — це ключ до гарного самопочуття.", emoji: "💧" },
      { type: "tip", title: "Здоровий сон", message: "7-8 годин сну допоможуть вам відновитися для нових звершень.", emoji: "🌙" }
    ] as any;
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// Функція для генерації плану тренувань
export async function generateWorkoutPlan(goals: string[], userLevel: string = 'початківець'): Promise<WorkoutPlan> {
  const token = getGithubToken();
  if (!token) {
    return {
      name: "Базове тренування",
      duration: 30,
      exercises: [],
      description: "Оновіть ключ API для генерації персоналізованого плану тренувань."
    };
  }
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
      return await generateGroqContent(prompt);
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const workoutPlan = JSON.parse(text);
    return workoutPlan;
  } catch (error: any) {
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
                      
    if (statusCode !== 429 && statusCode !== 503) {
      console.error('Помилка генерації плану тренувань:', error);
    }
    
    if (statusCode === 429) {
      throw new Error('Наразі занадто багато запитів до AI. Спробуй через кілька секунд.');
    } else if (statusCode === 503) {
      throw new Error('AI сервіс тимчасово недоступний. Спробуй через хвилину.');
    }
    
    throw new Error('Не вдалося згенерувати план тренувань. Спробуйте ще раз!');
  }
}

// Функція для генерації детального рецепту
export async function generateDetailedRecipe(
  mealType: string,
  targetCalories: number,
  dietType: string = "всі"
): Promise<any> {
  const token = getGithubToken();
  if (!token) {
    throw new Error("No API token");
  }
  
  const prompt = `
  Створи детальний рецепт для прийому їжі: ${mealType}.
  Вимоги:
  - Тип дієти: ${dietType}
  - Цільові калорії: близько ${targetCalories} ккал (похибка +-50 ккал).
  
  Поверни відповідь ТІЛЬКИ у форматі JSON:
  {
    "title": "Назва страви",
    "readyInMinutes": 20,
    "servings": 1,
    "nutrition": {
      "calories": 400,
      "protein": 30,
      "fat": 15,
      "carbs": 40
    },
    "ingredients": [
      {
        "name": "Назва інгредієнта",
        "amount": 100,
        "unit": "г"
      }
    ],
    "instructions": [
      "Крок 1",
      "Крок 2"
    ]
  }
  `;

  try {
    const client = getClient();
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "Ти професійний кухар і дієтолог. Ти відповідаєш ТІЛЬКИ валідним JSON масивом або об'єктом, без маркдауну та зайвого тексту." },
          { role: "user", content: prompt }
        ],
        model: MODEL_NAME,
        temperature: 0.7,
        max_tokens: 1500
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body?.error?.message || "Помилка AI");
    }

    let text = response.body.choices[0].message.content;
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (text.includes('```')) {
      text = text.replace(/```\n?/g, '').trim();
    }
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Recipe Generation error:", error);
    throw error;
  }
}


// Функція для генерації плану харчування
export async function generateMealPlan(goals: string[], targetCalories: number = 2000): Promise<MealPlan> {
  const token = getGithubToken();
  if (!token) {
    return {
      name: "Базовий план харчування",
      meals: [],
      totalCalories: targetCalories
    };
  }
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
      return await generateGroqContent(prompt);
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const mealPlan = JSON.parse(text);
    return mealPlan;
  } catch (error: any) {
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
                      
    if (statusCode !== 429 && statusCode !== 503) {
      console.error('Помилка генерації плану харчування:', error);
    }
    
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
  const token = getGithubToken();
  if (!token) {
    return "Оновіть ключ API для отримання детального аналізу вашого прогресу від AI.";
  }
  try {
    const prompt = `
    Проаналізуй статистику користувача та дай короткий аналіз українською мовою:
    
    Статистика:
    ${JSON.stringify(stats, null, 2)}
    
    Відповідь має бути короткою (максимум 150 символів) та мотиваційною українською мовою.
    `;

    const response = await retryWithBackoff(async () => {
      return await generateGroqContent(prompt);
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    return text.trim();
  } catch (error: any) {
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
                      
    if (statusCode !== 429 && statusCode !== 503) {
      console.error('Помилка аналізу прогресу:', error);
    }
    
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
  const token = getGithubToken();
  if (!token) {
    return "AI-Коуч наразі недоступний. Будь ласка, задайте ключ VITE_GITHUB_TOKEN у конфігурації.";
  }
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
      return await generateGroqContent(prompt);
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
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
                      
    if (statusCode !== 429 && statusCode !== 503) {
      console.error('Помилка чату з AI коучем:', error);
    }
    
    // Повертаємо зрозуміле повідомлення про помилку
    if (statusCode === 429) {
      return 'Наразі занадто багато запитів до AI (перевищено ліміт). Спробуй через кілька секунд або продовжуй без AI-порад.';
    } else if (statusCode === 503) {
      return 'AI сервіс тимчасово недоступний. Спробуй через хвилину.';
    }
    
    return 'Вибачте, виникла помилка під час зв\'язку з AI. Спробуйте ще раз!';
  }
}

// Функція для глибокого аналізу даних користувача
export async function analyzeUserData(userData: any): Promise<string> {
  const token = getGithubToken();
  if (!token) {
    return "Додайте ключ VITE_GITHUB_TOKEN, щоб отримати персоналізований аналіз ваших даних.";
  }
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
      return await generateGroqContent(prompt);
    });
    
    let text = response.text;
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    return text.trim();
  } catch (error: any) {
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
                      
    if (statusCode !== 429 && statusCode !== 503) {
      console.error('Помилка аналізу даних:', error);
    }
    
    if (statusCode === 429) {
      return "Ваші дані виглядають чудово! Продовжуйте дотримуватись плану (AI-аналіз наразі недоступний через ліміт запитів).";
    } else if (statusCode === 503) {
      return "AI-сервіс тимчасово недоступний, але ваші показники в нормі!";
    }
    
    return "Не вдалося проаналізувати дані через технічну помилку, але ви на правильному шляху!";
  }
}

// Функція для генерації мотиваційних повідомлень
export async function generateMotivation(userProgress: any): Promise<string> {
  const token = getGithubToken();
  if (!token) {
    return "Продовжуйте в тому ж дусі! Ви на правильному шляху.";
  }
  try {
    const prompt = `
    Створи мотиваційне повідомлення українською мовою на основі прогресу користувача:
    
    Прогрес: ${JSON.stringify(userProgress, null, 2)}
    
    Повідомлення має бути коротким (максимум 100 символів), мотиваційним. НЕ використовуй емодзі — використовуй текст.
    `;

    const response = await retryWithBackoff(async () => {
      return await generateGroqContent(prompt);
    });
    
    let text = response.text;
    // Видаляємо markdown блоки якщо є
    if (text.includes('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    return text.trim();
  } catch (error: any) {
    const statusCode = error?.status || 
                      error?.statusCode || 
                      error?.response?.status || 
                      error?.response?.statusCode ||
                      (error?.message?.includes('429') ? 429 : null) ||
                      (error?.message?.includes('503') ? 503 : null);
                      
    if (statusCode !== 429 && statusCode !== 503) {
      console.error('Помилка генерації мотивації:', error);
    }
    
    if (statusCode === 429 || statusCode === 503) {
      return "Продовжуйте в тому ж дусі! Ви на правильному шляху!";
    }
    
    return "Кожен крок наближає вас до мети!";
  }
}

// JSON parsing helper with fallback candidate search
async function generateJsonContent<T>(prompt: string): Promise<T> {
  const responseText = await retryWithBackoff(async () => {
    return await generateAIContent(prompt, true);
  });
  
  let text = responseText.trim();
  // Strip code block markers if the model included them
  if (text.includes('```json')) {
    text = text.split('```json')[1].split('```')[0].trim();
  } else if (text.includes('```')) {
    text = text.split('```')[1].split('```')[0].trim();
  }
  
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to parse JSON from AI response. Raw text:', responseText);
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    
    let jsonCandidate = "";
    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      jsonCandidate = text.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      jsonCandidate = text.substring(firstBracket, lastBracket + 1);
    }
    
    if (jsonCandidate) {
      try {
        return JSON.parse(jsonCandidate) as T;
      } catch (innerError) {
        console.error('Candidate JSON parsing failed:', jsonCandidate);
      }
    }
    
    throw new Error('Не вдалося розпізнати відповідь AI як JSON. Спробуйте ще раз.');
  }
}

// Interface declarations
export interface MealPlanRequest {
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  mealsPerDay: number;
  dietaryPreferences: string[];
  allergies: string[];
  availableIngredients: string[];
  budget: 'low' | 'medium' | 'high';
  cookingTime: 'quick' | 'moderate' | 'extensive';
}

export interface GeneratedMealPlan {
  day: string;
  meals: Array<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    scheduledTime: string;
    recipe: {
      title: string;
      description: string;
      cookingTime: number;
      servings: number;
      difficulty: string;
      ingredients: Array<{
        name: string;
        amount: number;
        unit: string;
        isAvailable: boolean;
      }>;
      instructions: string[];
      nutrition: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
      };
    };
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export interface ProductAnalysisRequest {
  productName: string;
  category?: string;
  brand?: string;
}

export interface ProductAnalysis {
  category: string;
  description: string;
  storageAdvice: string;
  estimatedExpiry: string;
  nutritionTips: string[];
  healthBenefits: string[];
  warnings: string[];
  alternatives: string[];
}

export interface RecipeRequest {
  ingredients: string[];
  dietaryPreferences: string[];
  allergies: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  targetCalories: number;
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    isAvailable: boolean;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  cookingTime: number;
  servings: number;
  difficulty: string;
  tips?: string[];
  substitutions?: Array<{
    original: string;
    substitute: string;
    reason: string;
  }>;
}

export interface NutritionAdviceRequest {
  dailyNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  targetNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  recentMeals: Array<{
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    mealType: string;
  }>;
  userGoals: string[];
  dietaryRestrictions: string[];
}

export interface NutritionAdvice {
  summary: string;
  recommendations: string[];
  warnings: string[];
  motivationalMessage: string;
  nextMealSuggestions: string[];
  macroOptimization: {
    protein: string;
    carbs: string;
    fats: string;
  };
}

// getOpenAIService implementation
export function getOpenAIService() {
  return {
    generateMealPlan: async (request: MealPlanRequest): Promise<GeneratedMealPlan[]> => {
      const prompt = `
Ви — AI-дієтолог та шеф-кухар. Створіть тижневий план харчування українською мовою на основі наступного запиту:
Калорійність: ${request.targetCalories} ккал, Білки: ${request.targetProtein}г, Жири: ${request.targetFat}г, Вуглеводи: ${request.targetCarbs}г.
Прийомів їжі на день: ${request.mealsPerDay}.
Дієтичні вподобання: ${request.dietaryPreferences.join(', ') || 'немає'}.
Алергії: ${request.allergies.join(', ') || 'немає'}.
Доступні інгредієнти в холодильнику: ${request.availableIngredients.join(', ') || 'немає'}.
Бюджет: ${request.budget} (low/medium/high).
Час приготування: ${request.cookingTime} (quick/moderate/extensive).

Поверніть план як валідний JSON масив об'єктів без будь-якого додаткового тексту чи markdown розмітки. Масив повинен містити плани для 7 днів тижня (Понеділок, Вівторок, Середа, Четвер, П'ятниця, Субота, Неділя).
Кожен день повинен точно відповідати наступній структурі JSON:
[
  {
    "day": "Понеділок",
    "meals": [
      {
        "mealType": "breakfast",
        "scheduledTime": "08:00",
        "recipe": {
          "title": "Назва страви",
          "description": "Опис страви",
          "cookingTime": 20,
          "servings": 1,
          "difficulty": "легко",
          "ingredients": [
            { "name": "Назва інгредієнту", "amount": 100, "unit": "г", "isAvailable": true }
          ],
          "instructions": ["Крок 1...", "Крок 2..."],
          "nutrition": { "calories": 400, "protein": 30, "fat": 10, "carbs": 50 }
        }
      }
    ],
    "totalNutrition": { "calories": 2000, "protein": 150, "fat": 65, "carbs": 250 }
  }
]
Враховуйте наявні в холодильнику інгредієнти: якщо інгредієнт є у списку доступних, встановлюйте "isAvailable": true, інакше false.
`;
      return await generateJsonContent<GeneratedMealPlan[]>(prompt);
    },

    analyzeProduct: async (request: ProductAnalysisRequest): Promise<ProductAnalysis> => {
      const prompt = `
Ви — AI-експерт з харчових продуктів. Проаналізуйте наступний продукт українською мовою:
Назва: ${request.productName}
Категорія: ${request.category || 'не вказано'}
Бренд: ${request.brand || 'не вказано'}

Поверніть аналіз як валідний JSON об'єкт без будь-якого додаткового тексту чи markdown розмітки.
Об'єкт повинен точно відповідати наступній структурі JSON:
{
  "category": "Категорія продукту",
  "description": "Детальний опис продукту, його харчова цінність та особливості",
  "storageAdvice": "Поради щодо зберігання (де зберігати, температура тощо)",
  "estimatedExpiry": "Орієнтовний термін придатності",
  "nutritionTips": ["Порада з харчування 1", "Порада з харчування 2"],
  "healthBenefits": ["Користь для здоров'я 1", "Користь для здоров'я 2"],
  "warnings": ["Попередження або протипоказання 1"],
  "alternatives": ["Більш корисна альтернатива 1", "Альтернатива 2"]
}
`;
      return await generateJsonContent<ProductAnalysis>(prompt);
    },

    generateRecipe: async (request: RecipeRequest): Promise<GeneratedRecipe> => {
      const prompt = `
Ви — AI-шеф-кухар. Створіть докладний рецепт страви українською мовою на основі наступного запиту:
Тип прийому їжі: ${request.mealType}
Цільові калорії: ${request.targetCalories} ккал
Максимальний час приготування: ${request.cookingTime} хв
Складність: ${request.difficulty}
Кухня: ${request.cuisine || 'будь-яка'}
Дієтичні вподобання: ${request.dietaryPreferences.join(', ') || 'немає'}
Алергії: ${request.allergies.join(', ') || 'немає'}
Використовуйте як основу ці вибрані інгредієнти: ${request.ingredients.join(', ')}

Поверніть рецепт як валідний JSON об'єкт без будь-якого додаткового тексту чи markdown розмітки.
Об'єкт повинен точно відповідати наступній структурі JSON:
{
  "title": "Назва рецепту",
  "description": "Опис страви та її смакових якостей",
  "ingredients": [
    { "name": "Назва інгредієнту", "amount": 100, "unit": "г", "isAvailable": true }
  ],
  "instructions": ["Крок 1...", "Крок 2..."],
  "nutrition": { "calories": 450, "protein": 25, "fat": 15, "carbs": 50 },
  "cookingTime": 30,
  "servings": 2,
  "difficulty": "середня",
  "tips": ["Корисна порада 1", "Порада 2"],
  "substitutions": [
    { "original": "інгредієнт", "substitute": "замінник", "reason": "причина заміни" }
  ]
}
Для інгредієнтів зі списку запиту встановлюйте "isAvailable": true, для інших, які потрібно додати (сіль, вода, додаткові овочі тощо), встановлюйте "isAvailable": false.
`;
      return await generateJsonContent<GeneratedRecipe>(prompt);
    },

    getNutritionAdvice: async (request: NutritionAdviceRequest): Promise<NutritionAdvice> => {
      const prompt = `
Ви — AI-дієтолог. Проаналізуйте сьогоднішнє харчування користувача та його цілі українською мовою:
Сьогодні спожито: Калорії: ${request.dailyNutrition.calories} ккал, Білки: ${request.dailyNutrition.protein}г, Жири: ${request.dailyNutrition.fat}г, Вуглеводи: ${request.dailyNutrition.carbs}г.
Цільові показники: Калорії: ${request.targetNutrition.calories} ккал, Білки: ${request.targetNutrition.protein}г, Жири: ${request.targetNutrition.fat}г, Вуглеводи: ${request.targetNutrition.carbs}г.
Останні прийоми їжі: ${JSON.stringify(request.recentMeals)}
Цілі користувача: ${request.userGoals.join(', ')}
Дієтичні обмеження: ${request.dietaryRestrictions.join(', ') || 'немає'}

Поверніть аналіз та поради як валідний JSON об'єкт без будь-якого додаткового тексту чи markdown розмітки.
Об'єкт повинен точно відповідати наступній структурі JSON:
{
  "summary": "Загальне резюме харчування за день, оцінка балансу макронутриєнтів",
  "recommendations": ["Рекомендація 1", "Рекомендація 2"],
  "warnings": ["Попередження 1"],
  "motivationalMessage": "Мотиваційне підбадьорення для користувача",
  "nextMealSuggestions": ["Пропозиція страви на наступний прийом їжі 1", "Пропозиція 2"],
  "macroOptimization": {
    "protein": "Порада щодо білків",
    "carbs": "Порада щодо вуглеводів",
    "fats": "Порада щодо жирів"
  }
}
`;
      return await generateJsonContent<NutritionAdvice>(prompt);
    }
  };
}

// Експорт всіх функцій
export default {
  getDailyInsight,
  generateWorkoutPlan,
  generateMealPlan,
  analyzeProgress,
  chatWithAICoach,
  generateMotivation,
  getOpenAIService
};