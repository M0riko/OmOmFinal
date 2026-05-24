import { Brain, TrendingUp, Target, Zap, Heart, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAI } from "@/hooks/useAI";
import { useAuth } from "@/hooks/useAuth";
import { useDaily } from "@/hooks/useDaily";

interface AIInsight {
  id: string;
  type: "tip" | "motivation" | "warning" | "achievement";
  title: string;
  message: string;
  action?: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface AIInsightsCardProps {
  userData?: any;
  onActionClick?: (action: string) => void;
}

export function AIInsightsCard({ userData, onActionClick }: AIInsightsCardProps) {
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);
  const { t } = useI18n();
  const { getInsight, isLoading, error } = useAI();
  const { user } = useAuth();
  const { totals } = useDaily();

  // Отримання AI поради
  const generateInsight = async (): Promise<AIInsight | null> => {
    const userDataForAI = {
      calories: totals.calories || 0,
      water: (totals as any).water || 0,
      sleep: (user as any)?.sleep || 7,
      weight: (user as any)?.weight,
      goals: (user as any)?.goals || [],
      activity: (user as any)?.activity,
      age: (user as any)?.age,
      gender: (user as any)?.gender
    };

    const aiInsight = await getInsight(userDataForAI);
    
    if (aiInsight) {
      // Конвертуємо AI відповідь в наш формат
      const insight: AIInsight = {
        id: Date.now().toString(),
        type: aiInsight.type,
        title: aiInsight.title,
        message: aiInsight.message,
        action: aiInsight.type === 'tip' ? t("viewRecipes") : 
                aiInsight.type === 'motivation' ? t("viewProgress") :
                aiInsight.type === 'warning' ? t("addWater") : t("viewStatistics"),
        icon: aiInsight.type === 'tip' ? Lightbulb :
              aiInsight.type === 'motivation' ? TrendingUp :
              aiInsight.type === 'warning' ? Heart : Target,
        color: aiInsight.type === 'tip' ? "from-yellow-500 to-orange-500" :
               aiInsight.type === 'motivation' ? "from-green-500 to-emerald-500" :
               aiInsight.type === 'warning' ? "from-blue-500 to-cyan-500" : "from-purple-500 to-violet-500",
        bgColor: aiInsight.type === 'tip' ? "from-yellow-500/10 to-orange-500/10" :
                 aiInsight.type === 'motivation' ? "from-green-500/10 to-emerald-500/10" :
                 aiInsight.type === 'warning' ? "from-blue-500/10 to-cyan-500/10" : "from-purple-500/10 to-violet-500/10"
      };
      return insight;
    }
    
    return null;
  };

  useEffect(() => {
    // Отримуємо AI пораду
    const loadInsight = async () => {
      const insight = await generateInsight();
      setCurrentInsight(insight);
    };
    
    loadInsight();
  }, [totals.calories, totals.water, user?.sleep, user?.weight, user?.goals]);

  const handleActionClick = () => {
    if (currentInsight?.action && onActionClick) {
      onActionClick(currentInsight.action);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
              <div className="h-3 bg-muted/30 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!currentInsight) return null;

  const IconComponent = currentInsight.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`p-6 bg-gradient-to-r border-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${currentInsight.bgColor} border-primary/20`}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center ${currentInsight.color}`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">{currentInsight.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t("yourAIAssistant")}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-foreground font-medium">{currentInsight.message}</p>
            
            {currentInsight.action && (
              <Button 
                onClick={handleActionClick}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <TrendingUp className="w-4 h-4" />
                {currentInsight.action}
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("updatedJustNow")}</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>{t("aiActive")}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
