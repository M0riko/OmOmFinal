import { Article, ArticleCategory, CallToAction, CallToActionType, DEFAULT_ARTICLE_CATEGORIES } from './article-types';

// Экспортируем категории для использования в других файлах
export { DEFAULT_ARTICLE_CATEGORIES };

// Создание Call-to-Action
function createCTA(
  type: CallToActionType,
  title: string,
  titleUk: string,
  description?: string,
  descriptionUk?: string,
  position: 'inline' | 'end' | 'sidebar' = 'end'
): CallToAction {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    titleUk,
    description,
    descriptionUk,
    action: {
      type: 'navigate',
      target: getCTATarget(type)
    },
    position,
    priority: 1,
    isActive: true
  };
}

function getCTATarget(type: CallToActionType): string {
  switch (type) {
    case 'find_recipes': return '/recipes';
    case 'start_workout': return '/training';
    case 'track_nutrition': return '/';
    case 'set_goal': return '/training?tab=goals';
    case 'add_to_shopping': return '/shopping';
    case 'plan_meal': return '/meal-plan';
    case 'track_sleep': return '/';
    case 'join_challenge': return '/';
    default: return '/';
  }
}

// База данных статей
export const ARTICLES_DATABASE: Article[] = [
  {
    id: 'protein-importance',
    title: 'Why Protein is Essential for Muscle Growth',
    titleUk: 'Чому білок такий важливий для росту м\'язів',
    excerpt: 'Understanding the role of protein in muscle building and recovery',
    excerptUk: 'Розуміння ролі білка в нарощуванні м\'язів та відновленні',
    content: `
      <h2>What is Protein?</h2>
      <p>Protein is one of the three macronutrients essential for human health, along with carbohydrates and fats. It's made up of amino acids, which are the building blocks of life.</p>
      
      <h2>Protein and Muscle Growth</h2>
      <p>When you exercise, especially strength training, you create micro-tears in your muscle fibers. Protein provides the amino acids needed to repair and rebuild these fibers, making them stronger and larger.</p>
      
      <h2>How Much Protein Do You Need?</h2>
      <p>For muscle building, aim for 1.6-2.2 grams of protein per kilogram of body weight per day. This ensures your muscles have enough amino acids for optimal growth and recovery.</p>
      
      <h2>Best Protein Sources</h2>
      <ul>
        <li>Lean meats (chicken, turkey, beef)</li>
        <li>Fish and seafood</li>
        <li>Eggs and dairy products</li>
        <li>Legumes and beans</li>
        <li>Nuts and seeds</li>
      </ul>
      
      <h2>Timing Matters</h2>
      <p>Consuming protein within 2 hours after your workout can enhance muscle protein synthesis and recovery.</p>
    `,
    contentUk: `
      <h2>Що таке білок?</h2>
      <p>Білок - це один з трьох макронутрієнтів, необхідних для здоров'я людини, разом з вуглеводами та жирами. Він складається з амінокислот, які є будівельними блоками життя.</p>
      
      <h2>Білок та ріст м'язів</h2>
      <p>Коли ви тренуєтесь, особливо силовими вправами, ви створюєте мікротравми в м'язових волокнах. Білок забезпечує амінокислоти, необхідні для відновлення та перебудови цих волокон, роблячи їх сильнішими та більшими.</p>
      
      <h2>Скільки білка вам потрібно?</h2>
      <p>Для нарощування м'язів націлюйтесь на 1,6-2,2 грами білка на кілограм ваги тіла на день. Це забезпечує вашим м'язам достатньо амінокислот для оптимального росту та відновлення.</p>
      
      <h2>Найкращі джерела білка</h2>
      <ul>
        <li>Нежирне м'ясо (курка, індичка, яловичина)</li>
        <li>Риба та морепродукти</li>
        <li>Яйця та молочні продукти</li>
        <li>Бобові та квасоля</li>
        <li>Горіхи та насіння</li>
      </ul>
      
      <h2>Час має значення</h2>
      <p>Споживання білка протягом 2 годин після тренування може покращити синтез м'язового білка та відновлення.</p>
    `,
    author: 'Dr. Sarah Johnson',
    authorUk: 'Др. Сара Джонсон',
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    category: DEFAULT_ARTICLE_CATEGORIES.find(c => c.id === 'nutrition')!,
    tags: ['protein', 'muscle growth', 'nutrition', 'fitness'],
    readingTime: 8,
    difficulty: 'beginner',
    featured: true,
    imageUrl: '/images/protein-article.jpg',
    imageAlt: 'Protein sources for muscle building',
    imageAltUk: 'Джерела білка для нарощування м\'язів',
    isCurated: false,
    views: 1250,
    likes: 89,
    saves: 156,
    comments: [],
    callToActions: [
      createCTA('find_recipes', 'Find High-Protein Recipes', 'Знайти високобілкові рецепти', 'Discover delicious recipes rich in protein', 'Відкрийте смачні рецепти, багаті на білок'),
      createCTA('track_nutrition', 'Track Your Protein Intake', 'Відстежити споживання білка', 'Monitor your daily protein consumption', 'Контролюйте щоденне споживання білка')
    ],
    relatedArticles: ['meal-timing', 'supplements-guide'],
    isPublished: true,
    isCustom: false
  },
  {
    id: 'beginner-workout-guide',
    title: 'Complete Beginner\'s Guide to Strength Training',
    titleUk: 'Повний путівник для початківців по силовому тренуванню',
    excerpt: 'Everything you need to know to start your strength training journey',
    excerptUk: 'Все, що потрібно знати для початку силового тренування',
    content: `
      <h2>Getting Started</h2>
      <p>Strength training is one of the most effective ways to build muscle, increase bone density, and improve overall health. Here's your complete guide to getting started.</p>
      
      <h2>Basic Principles</h2>
      <ul>
        <li><strong>Progressive Overload:</strong> Gradually increase weight or reps over time</li>
        <li><strong>Proper Form:</strong> Focus on technique before adding weight</li>
        <li><strong>Consistency:</strong> Train regularly, 2-3 times per week minimum</li>
        <li><strong>Recovery:</strong> Allow muscles to rest between sessions</li>
      </ul>
      
      <h2>Essential Exercises</h2>
      <p>Start with these fundamental movements:</p>
      <ul>
        <li>Squats - for legs and glutes</li>
        <li>Push-ups - for chest and arms</li>
        <li>Rows - for back muscles</li>
        <li>Planks - for core strength</li>
      </ul>
      
      <h2>Sample Beginner Program</h2>
      <p><strong>Week 1-2:</strong> 2 sets of 8-10 reps for each exercise</p>
      <p><strong>Week 3-4:</strong> 3 sets of 8-10 reps</p>
      <p><strong>Week 5+:</strong> Add weight or increase difficulty</p>
    `,
    contentUk: `
      <h2>Початок</h2>
      <p>Силове тренування - це один з найефективніших способів нарощування м'язів, підвищення щільності кісток та покращення загального здоров'я. Ось ваш повний путівник для початку.</p>
      
      <h2>Основні принципи</h2>
      <ul>
        <li><strong>Прогресивне навантаження:</strong> Поступово збільшуйте вагу або повторення з часом</li>
        <li><strong>Правильна техніка:</strong> Фокусуйтесь на техніці перед додаванням ваги</li>
        <li><strong>Послідовність:</strong> Тренуйтесь регулярно, мінімум 2-3 рази на тиждень</li>
        <li><strong>Відновлення:</strong> Дозвольте м'язам відпочити між сесіями</li>
      </ul>
      
      <h2>Основні вправи</h2>
      <p>Почніть з цих фундаментальних рухів:</p>
      <ul>
        <li>Присідання - для ніг та сідниць</li>
        <li>Віджимання - для грудей та рук</li>
        <li>Тяги - для м'язів спини</li>
        <li>Планка - для сили кору</li>
      </ul>
      
      <h2>Приклад програми для початківців</h2>
      <p><strong>Тиждень 1-2:</strong> 2 підходи по 8-10 повторень для кожної вправи</p>
      <p><strong>Тиждень 3-4:</strong> 3 підходи по 8-10 повторень</p>
      <p><strong>Тиждень 5+:</strong> Додайте вагу або збільште складність</p>
    `,
    author: 'Mike Trainer',
    authorUk: 'Майк Тренер',
    publishedAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    category: DEFAULT_ARTICLE_CATEGORIES.find(c => c.id === 'training')!,
    tags: ['beginner', 'strength training', 'workout', 'fitness'],
    readingTime: 12,
    difficulty: 'beginner',
    featured: true,
    imageUrl: '/images/beginner-workout.jpg',
    imageAlt: 'Beginner doing strength training exercises',
    imageAltUk: 'Початківець виконує силові вправи',
    isCurated: false,
    views: 2100,
    likes: 145,
    saves: 203,
    comments: [],
    callToActions: [
      createCTA('start_workout', 'Start Your First Workout', 'Почати перше тренування', 'Begin with our beginner-friendly program', 'Почніть з нашої програми для початківців'),
      createCTA('set_goal', 'Set Your Fitness Goals', 'Встановити фітнес-цілі', 'Define what you want to achieve', 'Визначте, чого ви хочете досягти')
    ],
    relatedArticles: ['proper-form', 'recovery-tips'],
    isPublished: true,
    isCustom: false
  },
  {
    id: 'sleep-recovery',
    title: 'The Science of Sleep and Recovery',
    titleUk: 'Наука сну та відновлення',
    excerpt: 'How quality sleep affects your fitness progress and overall health',
    excerptUk: 'Як якісний сон впливає на ваш фітнес-прогрес та загальне здоров\'я',
    content: `
      <h2>Why Sleep Matters</h2>
      <p>Sleep is not just rest - it's when your body repairs, rebuilds, and prepares for the next day. For athletes and fitness enthusiasts, quality sleep is crucial for optimal performance.</p>
      
      <h2>Sleep and Muscle Growth</h2>
      <p>During deep sleep, your body releases growth hormone, which is essential for muscle repair and growth. Poor sleep can significantly hinder your progress in the gym.</p>
      
      <h2>How Much Sleep Do You Need?</h2>
      <ul>
        <li><strong>Adults:</strong> 7-9 hours per night</li>
        <li><strong>Athletes:</strong> 8-10 hours per night</li>
        <li><strong>During intense training:</strong> Consider 9+ hours</li>
      </ul>
      
      <h2>Tips for Better Sleep</h2>
      <ul>
        <li>Maintain a consistent sleep schedule</li>
        <li>Create a cool, dark bedroom environment</li>
        <li>Avoid screens 1 hour before bed</li>
        <li>Limit caffeine after 2 PM</li>
        <li>Consider magnesium supplements</li>
      </ul>
    `,
    contentUk: `
      <h2>Чому сон важливий</h2>
      <p>Сон - це не просто відпочинок, це час, коли ваше тіло відновлюється, перебудовується та готується до наступного дня. Для спортсменів та любителів фітнесу якісний сон критично важливий для оптимальної продуктивності.</p>
      
      <h2>Сон та ріст м'язів</h2>
      <p>Під час глибокого сну ваше тіло виробляє гормон росту, який необхідний для відновлення та росту м'язів. Поганий сон може значно перешкодити вашому прогресу в залі.</p>
      
      <h2>Скільки сну вам потрібно?</h2>
      <ul>
        <li><strong>Дорослі:</strong> 7-9 годин на ніч</li>
        <li><strong>Спортсмени:</strong> 8-10 годин на ніч</li>
        <li><strong>Під час інтенсивних тренувань:</strong> Розгляньте 9+ годин</li>
      </ul>
      
      <h2>Поради для кращого сну</h2>
      <ul>
        <li>Дотримуйтесь постійного графіку сну</li>
        <li>Створіть прохолодне, темне середовище спальні</li>
        <li>Уникайте екранів за 1 годину до сну</li>
        <li>Обмежте кофеїн після 14:00</li>
        <li>Розгляньте добавки магнію</li>
      </ul>
    `,
    author: 'Dr. Sleep Expert',
    authorUk: 'Др. Експерт зі сну',
    publishedAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-08T09:15:00Z',
    category: DEFAULT_ARTICLE_CATEGORIES.find(c => c.id === 'recovery')!,
    tags: ['sleep', 'recovery', 'health', 'performance'],
    readingTime: 6,
    difficulty: 'beginner',
    featured: false,
    imageUrl: '/images/sleep-recovery.jpg',
    imageAlt: 'Person sleeping peacefully',
    imageAltUk: 'Людина мирно спить',
    isCurated: false,
    views: 890,
    likes: 67,
    saves: 98,
    comments: [],
    callToActions: [
      createCTA('track_sleep', 'Track Your Sleep', 'Відстежити свій сон', 'Monitor your sleep patterns', 'Контролюйте свої звички сну')
    ],
    relatedArticles: ['stress-management', 'recovery-nutrition'],
    isPublished: true,
    isCustom: false
  },
  {
    id: 'motivation-tips',
    title: '5 Ways to Stay Motivated on Your Fitness Journey',
    titleUk: '5 способів залишатися мотивованим у фітнес-подорожі',
    excerpt: 'Practical strategies to maintain motivation and consistency in your fitness routine',
    excerptUk: 'Практичні стратегії для підтримки мотивації та послідовності у фітнес-рутині',
    content: `
      <h2>1. Set SMART Goals</h2>
      <p>Specific, Measurable, Achievable, Relevant, and Time-bound goals give you clear direction and milestones to celebrate.</p>
      
      <h2>2. Track Your Progress</h2>
      <p>Keep a journal of your workouts, measurements, and achievements. Seeing progress, even small wins, can boost motivation significantly.</p>
      
      <h2>3. Find Your Why</h2>
      <p>Connect your fitness goals to deeper values - health, confidence, energy, or setting an example for loved ones.</p>
      
      <h2>4. Create Accountability</h2>
      <p>Share your goals with friends, join a fitness community, or work with a trainer. External accountability increases commitment.</p>
      
      <h2>5. Celebrate Small Wins</h2>
      <p>Don't wait for major milestones. Celebrate every workout completed, every healthy meal, every week of consistency.</p>
    `,
    contentUk: `
      <h2>1. Встановіть SMART цілі</h2>
      <p>Конкретні, вимірювані, досяжні, релевантні та часово обмежені цілі дають вам чіткий напрямок та етапи для святкування.</p>
      
      <h2>2. Відстежуйте свій прогрес</h2>
      <p>Ведіть щоденник своїх тренувань, вимірювань та досягнень. Бачення прогресу, навіть маленьких перемог, може значно підвищити мотивацію.</p>
      
      <h2>3. Знайдіть свою "чому"</h2>
      <p>Пов'яжіть свої фітнес-цілі з глибшими цінностями - здоров'ям, впевненістю, енергією або прикладом для близьких.</p>
      
      <h2>4. Створіть відповідальність</h2>
      <p>Поділіться своїми цілями з друзями, приєднайтесь до фітнес-спільноти або працюйте з тренером. Зовнішня відповідальність збільшує прихильність.</p>
      
      <h2>5. Святкуйте маленькі перемоги</h2>
      <p>Не чекайте великих досягнень. Святкуйте кожне завершене тренування, кожен здоровий прийом їжі, кожен тиждень послідовності.</p>
    `,
    author: 'Motivation Coach',
    authorUk: 'Тренер з мотивації',
    publishedAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-01-05T16:45:00Z',
    category: DEFAULT_ARTICLE_CATEGORIES.find(c => c.id === 'motivation')!,
    tags: ['motivation', 'mindset', 'goals', 'consistency'],
    readingTime: 5,
    difficulty: 'beginner',
    featured: false,
    imageUrl: '/images/motivation.jpg',
    imageAlt: 'Motivated person working out',
    imageAltUk: 'Мотивована людина тренується',
    isCurated: false,
    views: 1560,
    likes: 112,
    saves: 134,
    comments: [],
    callToActions: [
      createCTA('set_goal', 'Set Your Goals', 'Встановити цілі', 'Define what you want to achieve', 'Визначте, чого ви хочете досягти')
    ],
    relatedArticles: ['goal-setting', 'habit-formation'],
    isPublished: true,
    isCustom: false
  },
  {
    id: 'healthy-recipes',
    title: '5 Quick and Healthy Meal Prep Recipes',
    titleUk: '5 швидких та здорових рецептів для підготовки їжі',
    excerpt: 'Simple, nutritious recipes perfect for meal prep and busy lifestyles',
    excerptUk: 'Прості, поживні рецепти, ідеальні для підготовки їжі та зайнятого способу життя',
    content: `
      <h2>1. Greek Chicken Bowls</h2>
      <p>Marinate chicken breast in olive oil, lemon, and herbs. Serve with quinoa, cucumber, tomatoes, and tzatziki sauce.</p>
      
      <h2>2. Salmon and Sweet Potato</h2>
      <p>Bake salmon fillets with sweet potato wedges. Season with garlic, paprika, and a drizzle of olive oil.</p>
      
      <h2>3. Turkey and Vegetable Stir-fry</h2>
      <p>Quick stir-fry with lean ground turkey, bell peppers, broccoli, and brown rice. Season with soy sauce and ginger.</p>
      
      <h2>4. Quinoa Buddha Bowl</h2>
      <p>Base of quinoa topped with roasted vegetables, chickpeas, avocado, and tahini dressing.</p>
      
      <h2>5. Egg Muffins</h2>
      <p>Whisk eggs with spinach, tomatoes, and cheese. Bake in muffin tins for portable breakfasts.</p>
    `,
    contentUk: `
      <h2>1. Грецькі курчачі мисочки</h2>
      <p>Замаринуйте курячу грудку в оливковій олії, лимоні та травах. Подавайте з кіноа, огірками, помідорами та соусом цацикі.</p>
      
      <h2>2. Лосось та батат</h2>
      <p>Запікайте філе лосося з клинками батату. Приправте часником, паприкою та краплею оливкової олії.</p>
      
      <h2>3. Смажений індик з овочами</h2>
      <p>Швидкий смажений страв з нежирним фаршем індички, болгарським перцем, броколі та бурим рисом. Приправте соєвим соусом та імбиром.</p>
      
      <h2>4. Мисочка Будди з кіноа</h2>
      <p>Основа з кіноа, покрита запеченими овочами, нутом, авокадо та соусом з тахіні.</p>
      
      <h2>5. Яєчні мафіни</h2>
      <p>Збийте яйця зі шпинатом, помідорами та сиром. Запікайте в формах для мафінів для портативних сніданків.</p>
    `,
    author: 'Chef Nutrition',
    authorUk: 'Шеф-нутріціоніст',
    publishedAt: '2024-01-03T11:20:00Z',
    updatedAt: '2024-01-03T11:20:00Z',
    category: DEFAULT_ARTICLE_CATEGORIES.find(c => c.id === 'recipes')!,
    tags: ['recipes', 'meal prep', 'healthy eating', 'nutrition'],
    readingTime: 7,
    difficulty: 'beginner',
    featured: false,
    imageUrl: '/images/meal-prep.jpg',
    imageAlt: 'Healthy meal prep containers',
    imageAltUk: 'Контейнери для здорової підготовки їжі',
    isCurated: false,
    views: 980,
    likes: 78,
    saves: 145,
    comments: [],
    callToActions: [
      createCTA('find_recipes', 'Explore More Recipes', 'Дослідити більше рецептів', 'Discover our full recipe collection', 'Відкрийте нашу повну колекцію рецептів'),
      createCTA('add_to_shopping', 'Add Ingredients to Shopping List', 'Додати інгредієнти в список покупок', 'Get ingredients for these recipes', 'Отримайте інгредієнти для цих рецептів')
    ],
    relatedArticles: ['meal-planning', 'nutrition-basics'],
    isPublished: true,
    isCustom: false
  }
];

// Функции для работы с базой данных статей
export function getArticlesByCategory(categoryId: string): Article[] {
  return ARTICLES_DATABASE.filter(article => 
    article.category.id === categoryId && article.isPublished
  );
}

export function getFeaturedArticles(): Article[] {
  return ARTICLES_DATABASE.filter(article => 
    article.featured && article.isPublished
  );
}

export function getRecentArticles(limit: number = 10): Article[] {
  return ARTICLES_DATABASE
    .filter(article => article.isPublished)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function searchArticles(query: string): Article[] {
  const lowerQuery = query.toLowerCase();
  return ARTICLES_DATABASE.filter(article => 
    article.isPublished && (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.titleUk.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery) ||
      article.excerptUk.toLowerCase().includes(lowerQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  );
}

export function getArticleById(id: string): Article | undefined {
  return ARTICLES_DATABASE.find(article => article.id === id);
}

export function getRelatedArticles(articleId: string, limit: number = 3): Article[] {
  const article = getArticleById(articleId);
  if (!article) return [];

  return ARTICLES_DATABASE
    .filter(a => 
      a.id !== articleId && 
      a.isPublished && 
      (a.category.id === article.category.id || 
       a.tags.some(tag => article.tags.includes(tag)))
    )
    .slice(0, limit);
}

export function getArticlesByDifficulty(difficulty: string): Article[] {
  return ARTICLES_DATABASE.filter(article => 
    article.difficulty === difficulty && article.isPublished
  );
}

export function getPopularArticles(limit: number = 10): Article[] {
  return ARTICLES_DATABASE
    .filter(article => article.isPublished)
    .sort((a, b) => (b.views + b.likes + b.saves) - (a.views + a.likes + a.saves))
    .slice(0, limit);
}
