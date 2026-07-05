import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Brain, 
  Sparkles, 
  Mic, 
  MicOff, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle, 
  Circle,
  Dumbbell,
  Utensils,
  BarChart3,
  Sparkles as SparklesIcon,
  Plus,
  X,
  Zap,
  Flame,
  Heart,
  Trophy,
  Save,
  Loader2,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAI } from "@/hooks/useAI";
import { useAuth } from "@/hooks/useAuth";
import { useDaily } from "@/hooks/useDaily";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  messageType?: "advice" | "analytics" | "support" | "system" | "default";
}

interface AICoachChatProps {
  onClose?: () => void;
}

export function AICoachChat({ onClose }: AICoachChatProps) {
  const { t } = useI18n();
  const { chatWithCoach, analyzeUserDataDeep } = useAI();
  const { user } = useAuth();
  const { totals } = useDaily();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [apiStatus, setApiStatus] = useState<"online" | "rate-limited" | "unavailable">("online");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Генеруємо персоналізоване привітання при завантаженні
  useEffect(() => {
    const generateWelcomeMessage = async () => {
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: "welcome",
          type: "ai",
          content: `Привіт${user?.name ? `, ${user.name}` : ''}! Я твій AI-Коуч з SLKY.

- Готовий допомогти тобі досягти твоїх цілей у харчуванні та фітнесі
- Проаналізую твої дані та дам персоналізовані поради
- Допоможу з плануванням харчування, тренувань та звичок

Що тебе цікавить сьогодні?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    };

    generateWelcomeMessage();
  }, [user, messages.length]);

  const quickQuestions = [
    "Як прискорити схуднення?",
    "Які вправи для пресу?",
    "Скільки води пити на день?",
    "Як набрати м'язову масу?",
    "Що їсти перед тренуванням?",
    "Як покращити сон?",
    "Проаналізуй мій прогрес",
    "Дай пораду по харчуванню",
    "Як мотивувати себе?",
    "Що змінити в раціоні?"
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Отримуємо відповідь від AI
    try {
      setApiStatus("online");
      const aiResponse = await generateAIResponse(content);
      
      
      // Визначаємо тип повідомлення на основі контенту
      let messageType: "advice" | "analytics" | "support" | "system" | "default" = "default";
      const lowerContent = content.toLowerCase();
      const lowerResponse = aiResponse.toLowerCase();
      
      if (lowerResponse.includes("прогрес") || lowerResponse.includes("статистика") || lowerResponse.includes("аналіз") || lowerContent.includes("прогрес")) {
        messageType = "analytics";
      } else if (lowerResponse.includes("підтрим") || lowerResponse.includes("мотивац") || lowerResponse.includes("пам'ятай") || lowerContent.includes("важко")) {
        messageType = "support";
      } else if (lowerResponse.includes("спробуй") || lowerResponse.includes("порад") || lowerResponse.includes("рекоменд") || lowerContent.includes("як") || lowerContent.includes("що")) {
        messageType = "advice";
      } else if (lowerResponse.includes("оновлюю") || lowerResponse.includes("зберігаю") || lowerResponse.includes("зачекай")) {
        messageType = "system";
      } else if (lowerResponse.includes("занадто багато") || lowerResponse.includes("тимчасово недоступний")) {
        messageType = "system";
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
        messageType
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Помилка отримання відповіді AI:', error);
      
      const statusCode = error?.status || 
                        error?.statusCode || 
                        error?.response?.status || 
                        error?.response?.statusCode ||
                        (error?.message?.includes('429') ? 429 : null) ||
                        (error?.message?.includes('503') ? 503 : null);
      
      if (statusCode === 429) {
        setApiStatus("rate-limited");
      } else if (statusCode === 503) {
        setApiStatus("unavailable");
      } else {
        setApiStatus("unavailable");
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: error?.message || "Вибачте, виникла помилка. Спробуйте ще раз!",
        timestamp: new Date(),
        messageType: "system"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    // Збираємо повний контекст користувача
    const context = {
      user: {
        name: user?.name || 'Користувач',
        age: (user as any)?.age,
        gender: (user as any)?.gender,
        weight: (user as any)?.weight,
        height: (user as any)?.height,
        goals: (user as any)?.goals || [],
        targets: user?.targets || {},
        activityLevel: (user as any)?.activityLevel,
        // Додаткові дані з профілю
        targetWeight: (user as any)?.targetWeight,
        workoutDaysPerWeek: (user as any)?.workoutDaysPerWeek,
        workoutDuration: (user as any)?.workoutDuration
      },
      daily: {
        calories: totals.calories || 0,
        water: (totals as any).water || 0,
        protein: totals.protein || 0,
        carbs: totals.carbs || 0,
        fats: totals.fats || 0,
        sleep: (user as any)?.sleep || 7,
        // Додаткові щоденні дані
        meals: (totals as any)?.meals || [],
        workouts: (totals as any)?.workouts || []
      },
      stats: {
        // Статистика за період
        weeklyProgress: (totals as any)?.weeklyProgress || {},
        monthlyProgress: (totals as any)?.monthlyProgress || {},
        achievements: (totals as any)?.achievements || [],
        streak: (totals as any)?.streak || 0
      },
      // Історія повідомлень для контексту
      conversationHistory: messages.slice(-5).map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    };

    const response = await chatWithCoach(userInput, context);
    return response || "Вибачте, виникла помилка. Спробуйте ще раз!";
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
    setShowQuickQuestions(false); // Приховуємо питання після натискання
  };

  const handleDeepAnalysis = async () => {
    setIsTyping(true);
    
    try {
      const analysis = await analyzeUserDataDeep({
        user: {
          name: user?.name || 'Користувач',
          age: (user as any)?.age,
          gender: (user as any)?.gender,
          weight: (user as any)?.weight,
          height: (user as any)?.height,
          goals: (user as any)?.goals || [],
          targets: user?.targets || {},
          activityLevel: (user as any)?.activityLevel,
          targetWeight: (user as any)?.targetWeight,
          workoutDaysPerWeek: (user as any)?.workoutDaysPerWeek,
          workoutDuration: (user as any)?.workoutDuration
        },
        daily: {
          calories: totals.calories || 0,
          water: (totals as any).water || 0,
          protein: totals.protein || 0,
          carbs: totals.carbs || 0,
          fats: totals.fats || 0,
          sleep: (user as any)?.sleep || 7
        }
      });

      if (analysis) {
        const analysisMessage: Message = {
          id: Date.now().toString(),
          type: "ai",
          content: analysis,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, analysisMessage]);
      }
    } catch (error) {
      console.error('Помилка глибокого аналізу:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: "Вибачте, не вдалося провести аналіз. Спробуйте ще раз!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Here you would integrate with speech recognition API
  };

  const quickActions = [
    { icon: Dumbbell, label: "Тренування", action: () => handleSendMessage("Дай план тренувань на сьогодні") },
    { icon: Utensils, label: "Харчування", action: () => handleSendMessage("Порадь що їсти сьогодні") },
    { icon: BarChart3, label: "Прогрес", action: () => handleDeepAnalysis() },
    { icon: SparklesIcon, label: "Звички", action: () => handleSendMessage("Допоможи сформувати звичку") },
    { icon: MessageCircle, label: "Чат", action: () => setShowQuickActions(false) },
  ];

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 shadow-lg mb-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center relative flex-shrink-0"
              animate={{ 
                boxShadow: [
                  "0 0 20px hsl(var(--primary) / 0.3)",
                  "0 0 30px hsl(var(--primary) / 0.5)",
                  "0 0 20px hsl(var(--primary) / 0.3)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{t("aiCoachTitle")}</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">{t("yourAIAssistant")}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {apiStatus === "online" ? (
                <>
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-success"
                    animate={{ 
                      opacity: [1, 0.5, 1],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity 
                    }}
                  />
                  <span className="text-xs text-success font-medium flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span className="hidden sm:inline">Онлайн</span>
                  </span>
                </>
              ) : apiStatus === "rate-limited" ? (
                <>
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-warning"
                    animate={{ 
                      opacity: [1, 0.5, 1],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity 
                    }}
                  />
                  <span className="text-xs text-warning font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span className="hidden sm:inline">Завантажено</span>
                  </span>
                </>
              ) : (
                <>
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-destructive"
                    animate={{ 
                      opacity: [1, 0.5, 1],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity 
                    }}
                  />
                  <span className="text-xs text-destructive font-medium flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    <span className="hidden sm:inline">Недоступний</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-background">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-2 sm:gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "ai" && (
                <motion.div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center flex-shrink-0 relative"
                  animate={{ 
                    boxShadow: [
                      "0 0 15px hsl(var(--primary) / 0.3)",
                      "0 0 25px hsl(var(--primary) / 0.5)",
                      "0 0 15px hsl(var(--primary) / 0.3)"
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </motion.div>
              )}
              
              <div className={`max-w-[85%] sm:max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                <Card className={`p-3 sm:p-4 border ${
                  message.type === "user" 
                    ? "bg-primary text-primary-foreground border-primary/30 shadow-lg" 
                    : message.messageType === "advice"
                    ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-lg"
                    : message.messageType === "analytics"
                    ? "bg-gradient-to-r from-info/5 to-info/10 border-info/20 shadow-lg"
                    : message.messageType === "support"
                    ? "bg-gradient-to-r from-success/5 to-success/10 border-success/20 shadow-lg"
                    : message.messageType === "system"
                    ? "bg-muted/50 border-muted/30"
                    : "bg-card border-border shadow-lg"
                }`}>
                  <div className="text-xs sm:text-sm whitespace-pre-line text-card-foreground">
                    {/* Іконка типу повідомлення */}
                    {message.messageType && message.type === "ai" && (
                      <div className="flex items-center gap-2 mb-2">
                        {message.messageType === "advice" && <Target className="w-4 h-4 text-primary" />}
                        {message.messageType === "analytics" && <BarChart3 className="w-4 h-4 text-info" />}
                        {message.messageType === "support" && <Heart className="w-4 h-4 text-success" />}
                        {message.messageType === "system" && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                      </div>
                    )}
                    
                    {message.content.split('\n').map((line, index) => {
                      // Обробляємо структуровані відповіді AI
                      const trimmedLine = line.trim();
                      let icon = null;
                      let text = trimmedLine;
                      
                      if (trimmedLine.startsWith('- Висновок:') || trimmedLine.startsWith('Висновок:')) {
                        icon = <Circle className="w-3 h-3 inline mr-1 text-primary" />;
                      } else if (trimmedLine.startsWith('- Аналіз:') || trimmedLine.startsWith('Аналіз:')) {
                        icon = <Target className="w-3 h-3 inline mr-1 text-info" />;
                      } else if (trimmedLine.startsWith('- Рекомендації:') || trimmedLine.startsWith('Рекомендації:')) {
                        icon = <Lightbulb className="w-3 h-3 inline mr-1 text-warning" />;
                      } else if (trimmedLine.startsWith('- Додатково:') || trimmedLine.startsWith('Додатково:') || trimmedLine.startsWith('- Прогноз:') || trimmedLine.startsWith('Прогноз:')) {
                        icon = <TrendingUp className="w-3 h-3 inline mr-1 text-success" />;
                      } else if (trimmedLine.startsWith('- ')) {
                        icon = <CheckCircle className="w-3 h-3 inline mr-1 text-primary" />;
                        text = trimmedLine.substring(2);
                      }
                      
                      if (icon || trimmedLine.startsWith('- Висновок') || trimmedLine.startsWith('- Аналіз') || trimmedLine.startsWith('- Рекомендації') || trimmedLine.startsWith('- Додатково') || trimmedLine.startsWith('- Прогноз')) {
                        return (
                          <div key={index} className="mb-2 flex items-start gap-2">
                            {icon}
                            <span className={`${icon ? 'font-semibold text-foreground' : 'text-card-foreground'}`}>{text}</span>
                          </div>
                        );
                      }
                      return <div key={index} className="mb-1 text-card-foreground">{line}</div>;
                    })}
                  </div>
                </Card>
                <p className={`text-xs mt-1 px-1 ${
                  message.type === "user" ? "text-muted-foreground" : "text-muted-foreground"
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              
              {message.type === "user" && (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border-2 border-primary/30">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 sm:gap-3 justify-start"
          >
            <motion.div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 15px hsl(var(--primary) / 0.3)",
                  "0 0 25px hsl(var(--primary) / 0.5)",
                  "0 0 15px hsl(var(--primary) / 0.3)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </motion.div>
            <Card className="p-2 sm:p-3 bg-muted/50 border border-muted/30">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-xs text-muted-foreground">{t("aiTyping")}</span>
              </div>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && showQuickQuestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-2 sm:p-4"
        >
          <Card className="p-3 sm:p-4 bg-muted/20 border border-muted/30">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{t("popularQuestions")}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 sm:px-3"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Deep Analysis Button */}
      {messages.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-2 sm:px-4 pb-2"
        >
          <Button
            onClick={handleDeepAnalysis}
            disabled={isTyping}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
          >
            <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">{isTyping ? "Аналізую..." : "Глибокий аналіз моїх даних"}</span>
            <span className="sm:hidden">{isTyping ? "Аналіз..." : "Аналіз даних"}</span>
          </Button>
        </motion.div>
      )}

      {/* Quick Actions Floating Button */}
      <motion.div
        className="absolute bottom-20 sm:bottom-24 right-2 sm:right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4 space-y-2"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={action.action}
                    size="sm"
                    className="w-full justify-start gap-2 bg-card border border-border text-card-foreground hover:bg-muted shadow-lg text-xs sm:text-sm"
                  >
                    <action.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          onClick={() => setShowQuickActions(!showQuickActions)}
          size="icon"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary shadow-lg hover:shadow-xl transition-all"
        >
          {showQuickActions ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          ) : (
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          )}
        </Button>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-2 sm:p-4 bg-background"
      >
        <Card className="p-2 sm:p-3 bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg">
          <div className="flex gap-1.5 sm:gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("askQuestionPlaceholder")}
              className="flex-1 rounded-lg sm:rounded-xl text-sm sm:text-base"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={toggleListening}
              className={`rounded-lg sm:rounded-xl h-9 w-9 sm:h-10 sm:w-10 ${
                isListening 
                  ? "bg-destructive/10 text-destructive border-destructive/50 hover:bg-destructive/20" 
                  : ""
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </Button>
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              className="rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 shadow-lg disabled:opacity-50 h-9 w-9 sm:h-10 sm:w-10"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
