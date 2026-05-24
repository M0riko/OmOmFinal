import { Brain, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, BarChart3, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";

interface AIInsight {
  id: string;
  type: "positive" | "warning" | "recommendation" | "prediction";
  title: string;
  message: string;
  data?: any;
  confidence: number;
  icon: any;
  color: string;
  bgColor: string;
}

interface AIAnalyticsPanelProps {
  userData?: any;
  timeRange?: "week" | "month" | "quarter" | "year";
}

export function AIAnalyticsPanel({ userData, timeRange = "month" }: AIAnalyticsPanelProps) {
  const { t } = useI18n();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      const generatedInsights: AIInsight[] = [
        {
          id: "1",
          type: "positive",
          title: "Відмінний прогрес!",
          message: "Твоя вага знижується стабільно на 0.5кг на тиждень. Продовжуй у тому ж дусі!",
          confidence: 95,
          icon: TrendingUp,
          color: "from-green-500 to-green-600",
          bgColor: "from-green-500/10 to-green-500/5"
        },
        {
          id: "2",
          type: "warning",
          title: "Увага до харчування",
          message: "Споживання білку нижче рекомендованого на 15%. Додай більше білкових продуктів.",
          confidence: 88,
          icon: AlertTriangle,
          color: "from-yellow-500 to-orange-500",
          bgColor: "from-yellow-500/10 to-orange-500/5"
        },
        {
          id: "3",
          type: "recommendation",
          title: "Оптимізація тренувань",
          message: "Збільш інтенсивність кардіо на 20% для кращого спалювання калорій.",
          confidence: 82,
          icon: Target,
          color: "from-blue-500 to-blue-600",
          bgColor: "from-blue-500/10 to-blue-500/5"
        },
        {
          id: "4",
          type: "prediction",
          title: "Прогноз досягнення цілі",
          message: "При поточному темпі ти досягнеш цільової ваги через 8 тижнів.",
          confidence: 90,
          icon: BarChart3,
          color: "from-purple-500 to-purple-600",
          bgColor: "from-purple-500/10 to-purple-500/5"
        }
      ];
      
      setInsights(generatedInsights);
      setIsAnalyzing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [timeRange, userData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-400";
    if (confidence >= 80) return "text-yellow-400";
    if (confidence >= 70) return "text-orange-400";
    return "text-red-400";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return "Висока";
    if (confidence >= 80) return "Середня";
    if (confidence >= 70) return "Низька";
    return "Дуже низька";
  };

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center animate-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{t("aiDataAnalysis")}</h3>
                <p className="text-sm text-muted-foreground">Аналізую твої показники...</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/30 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{t("aiDataAnalysis")}</h3>
              <p className="text-sm text-muted-foreground">Персональні інсайти на основі твоєї статистики</p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">{t("aiActive")}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Insights */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`p-6 bg-gradient-to-r border-2 shadow-lg ${insight.bgColor} border-primary/20`}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center ${insight.color}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{insight.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConfidenceColor(insight.confidence)}`}
                        >
                          {getConfidenceLabel(insight.confidence)} ({insight.confidence}%)
                        </Badge>
                      </div>
                      <p className="text-foreground">{insight.message}</p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t("aiConfidence")}</span>
                      <span>{insight.confidence}%</span>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${insight.color}`}
                        style={{ width: `${insight.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span>{t("updatedJustNow")}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {insight.type === "positive" && "Позитивний тренд"}
                      {insight.type === "warning" && "Потребує уваги"}
                      {insight.type === "recommendation" && "Рекомендація"}
                      {insight.type === "prediction" && "Прогноз"}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Аналіз завершено</h4>
              <p className="text-sm text-muted-foreground">
                {t("aiAnalyzed")} {insights.length} {t("aspects")} {t("yourProgress")}
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>Період: {timeRange}</span>
              <span>•</span>
              <span>Середня впевненість: {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
