import { Brain, TrendingUp, TrendingDown, Target, Award, Calendar, Sparkles, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";

interface WeeklySummary {
  id: string;
  week: string;
  achievements: Array<{
    title: string;
    description: string;
    icon: any;
    color: string;
  }>;
  improvements: Array<{
    area: string;
    suggestion: string;
    priority: "high" | "medium" | "low";
  }>;
  nextWeekGoals: Array<{
    goal: string;
    target: string;
    category: string;
  }>;
  overallScore: number;
  motivation: string;
  insights: string;
}

interface AIWeeklySummaryProps {
  userData?: any;
  onViewDetails?: () => void;
}

export function AIWeeklySummary({ userData, onViewDetails }: AIWeeklySummaryProps) {
  const { t } = useI18n();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      const generatedSummary: WeeklySummary = {
        id: "1",
        week: `${t("weekTitle")} 15-21 січня`,
        achievements: [
          {
            title: "Цель по калориям",
            description: `${t("completedDays")} 6 ${t("ofDays")} 7 ${t("days")}`,
            icon: Target,
            color: "from-green-500 to-green-600"
          },
          {
            title: "Тренировки",
            description: "4 тренировки за неделю",
            icon: Award,
            color: "from-blue-500 to-blue-600"
          },
          {
            title: "Вода",
            description: "Средний показатель 2.1л/день",
            icon: TrendingUp,
            color: "from-cyan-500 to-cyan-600"
          }
        ],
        improvements: [
          {
            area: "Сон",
            suggestion: "Увеличить среднюю продолжительность сна до 7.5 часов",
            priority: "high"
          },
          {
            area: "Белки",
            suggestion: "Добавить больше белковых продуктов в рацион",
            priority: "medium"
          },
          {
            area: "Кардио",
            suggestion: "Включить 2 кардио-сессии в неделю",
            priority: "low"
          }
        ],
        nextWeekGoals: [
          {
            goal: "Снижение веса",
            target: "0.5 кг",
            category: "Питание"
          },
          {
            goal: "Силовые тренировки",
            target: "3 сессии",
            category: "Тренировки"
          },
          {
            goal: "Качество сна",
            target: "7.5 часов",
            category: "Восстановление"
          }
        ],
        overallScore: 78,
        motivation: "Отличная работа на этой неделе! Вы показали стабильный прогресс и дисциплину. Продолжайте в том же духе!",
        insights: "Ваш прогресс стабилен. Основные области для улучшения: сон и потребление белка. Рекомендую сосредоточиться на этих аспектах на следующей неделе."
      };
      
      setSummary(generatedSummary);
      setIsGenerating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [userData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Отлично";
    if (score >= 60) return "Хорошо";
    if (score >= 40) return "Удовлетворительно";
    return "Требует улучшения";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  if (isGenerating) {
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
                <h3 className="text-lg font-semibold text-foreground">{t("weekAnalysis")}</h3>
                <p className="text-sm text-muted-foreground">Анализирую ваши достижения...</p>
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

  if (!summary) return null;

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
              <h3 className="text-lg font-semibold text-foreground">{t("weekAnalysis")}</h3>
              <p className="text-sm text-muted-foreground">{summary.week}</p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">{t("aiActive")}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Общая оценка недели</h4>
            </div>
            
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full bg-muted/20"></div>
              <div 
                className={`absolute inset-2 rounded-full bg-gradient-to-r ${getScoreColor(summary.overallScore)} flex items-center justify-center`}
                style={{ 
                  background: `conic-gradient(from 0deg, ${getScoreColor(summary.overallScore).includes('green') ? '#10b981' : getScoreColor(summary.overallScore).includes('yellow') ? '#f59e0b' : '#ef4444'} 0deg, ${getScoreColor(summary.overallScore).includes('green') ? '#10b981' : getScoreColor(summary.overallScore).includes('yellow') ? '#f59e0b' : '#ef4444'} ${summary.overallScore * 3.6}deg, #374151 ${summary.overallScore * 3.6}deg)` 
                }}
              >
                <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{summary.overallScore}</div>
                    <div className="text-xs text-muted-foreground">из 100</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Badge className={`${getScoreColor(summary.overallScore)} text-white`}>
                {getScoreLabel(summary.overallScore)}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-foreground">Достижения недели</h4>
            </div>
            
            <div className="grid gap-3">
              {summary.achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r flex items-center justify-center ${achievement.color}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground">{achievement.title}</h5>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Improvements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-foreground">Области для улучшения</h4>
            </div>
            
            <div className="space-y-3">
              {summary.improvements.map((improvement, index) => (
                <div key={index} className="p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-foreground">{improvement.area}</h5>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(improvement.priority)}`}
                    >
                      {improvement.priority === "high" && "Высокий приоритет"}
                      {improvement.priority === "medium" && "Средний приоритет"}
                      {improvement.priority === "low" && "Низкий приоритет"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{improvement.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Next Week Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-foreground">Цели на следующую неделю</h4>
            </div>
            
            <div className="grid gap-3">
              {summary.nextWeekGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div>
                    <h5 className="font-medium text-foreground">{goal.goal}</h5>
                    <p className="text-sm text-muted-foreground">{goal.category}</p>
                  </div>
                  <Badge variant="outline" className="text-primary">
                    {goal.target}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Motivation & Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Мотивация и инсайты</h4>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="text-sm text-foreground font-medium">Мотивация:</p>
                <p className="text-sm text-muted-foreground mt-1">{summary.motivation}</p>
              </div>
              
              <div className="p-3 bg-muted/10 rounded-lg">
                <p className="text-sm text-foreground font-medium">{t("aiInsight")}</p>
                <p className="text-sm text-muted-foreground mt-1">{summary.insights}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Button 
          onClick={onViewDetails}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <BarChart3 className="w-4 h-4" />
          Подробная статистика
        </Button>
      </motion.div>
    </div>
  );
}
