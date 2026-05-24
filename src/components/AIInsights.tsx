import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Target, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AIInsightsProps {
  data: any; // Combined statistics data
}

export function AIInsights({ data }: AIInsightsProps) {
  // Mock AI insights based on data
  const insights = [
    {
      id: "weight",
      type: "success",
      title: "Відмінний прогрес по вазі!",
      description: "Ти втрачаєш вагу стабільно. При поточному темпі досягнеш цілі через 2 місяці.",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-500/5",
      borderColor: "border-green-500/30"
    },
    {
      id: "nutrition",
      type: "warning",
      title: "Збільш споживання білку",
      description: "Твоє споживання білку нижче рекомендованого. Додай більше риби та бобових.",
      icon: AlertTriangle,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-500/10 to-orange-500/5",
      borderColor: "border-orange-500/30"
    },
    {
      id: "workouts",
      type: "info",
      title: "Відмінна активність!",
      description: "Ти тренуєшся частіше, ніж минулого місяця. Продовжуй у тому ж дусі!",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/10 to-blue-500/5",
      borderColor: "border-blue-500/30"
    },
    {
      id: "water",
      type: "tip",
      title: "Порада по гідратації",
      description: "Пий воду рівномірно протягом дня. Встанови нагадування кожні 2 години.",
      icon: Lightbulb,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "from-cyan-500/10 to-cyan-500/5",
      borderColor: "border-cyan-500/30"
    }
  ];

  const predictions = [
    {
      metric: "Вага",
      current: data.weight?.current || 70,
      predicted: (data.weight?.current || 70) - 2,
      timeframe: "через 1 місяць",
      confidence: 85
    },
    {
      metric: "ІМТ",
      current: data.weight?.bmi || 22,
      predicted: (data.weight?.bmi || 22) - 0.5,
      timeframe: "через 1 місяць",
      confidence: 80
    },
    {
      metric: "Тренування",
      current: data.workouts?.thisWeek || 4,
      predicted: (data.workouts?.thisWeek || 4) + 1,
      timeframe: "на наступному тижні",
      confidence: 75
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">AI Аналіз та Рекомендації</h3>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              
              return (
                <motion.div
                  key={insight.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-4 bg-gradient-to-br border-2 shadow-lg ${insight.bgColor} ${insight.borderColor}`}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center ${insight.color}`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Predictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4 bg-muted/20 border border-muted/30">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Прогнози на основі даних</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">{prediction.metric}</p>
                      <div className="flex items-center justify-center gap-2 my-2">
                        <span className="text-lg font-bold text-foreground">{prediction.current}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-lg font-bold text-primary">{prediction.predicted}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{prediction.timeframe}</p>
                      <p className="text-xs text-primary font-medium">
                        Впевненість: {prediction.confidence}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Brain className="w-4 h-4" />
              Отримати персональні рекомендації
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
