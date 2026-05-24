import { Target, Flame, Zap, Utensils, Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useDaily } from "@/hooks/useDaily";

export function RecommendationBanner() {
  const { user } = useAuth();
  const { totals } = useDaily();
  
  const targetCalories = user?.targets?.calories || 2000;
  const targetProtein = user?.targets?.protein || 120;
  
  const remainingCalories = Math.max(0, targetCalories - totals.calories);
  const remainingProtein = Math.max(0, targetProtein - totals.protein);
  
  const getRecommendationMessage = () => {
    if (remainingCalories > 500) {
      return {
        title: "Ще багато калорій залишилось",
        message: `Рекомендуємо додати ${remainingCalories} ккал до раціону`,
        color: "from-orange-500 to-red-500",
        bgColor: "bg-gradient-to-r from-orange-500/10 to-red-500/10",
        borderColor: "border-orange-500/30",
        icon: Utensils
      };
    } else if (remainingCalories > 200) {
      return {
        title: "Майже досягли мети!",
        message: `Залишилось ${remainingCalories} ккал до денної норми`,
        color: "from-blue-500 to-purple-500",
        bgColor: "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
        borderColor: "border-blue-500/30",
        icon: TrendingUp
      };
    } else if (remainingCalories > 0) {
      return {
        title: "Мета майже досягнута!",
        message: `Залишилось всього ${remainingCalories} ккал`,
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-gradient-to-r from-green-500/10 to-emerald-500/10",
        borderColor: "border-green-500/30",
        icon: Target
      };
    } else {
      return {
        title: "Мета досягнута!",
        message: "Ви виконали денну норму калорій!",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-gradient-to-r from-green-500/10 to-emerald-500/10",
        borderColor: "border-green-500/30",
        icon: Trophy
      };
    }
  };
  
  const recommendation = getRecommendationMessage();

  return (
    <Card className={`p-6 ${recommendation.bgColor} border-2 ${recommendation.borderColor} shadow-lg`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${recommendation.color} flex items-center justify-center shadow-lg`}>
            <recommendation.icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">
              {recommendation.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {recommendation.message}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-card/50 backdrop-blur-sm rounded-xl border border-orange-500/20">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-foreground">
              {remainingCalories} ккал
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-card/50 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-foreground">
              {remainingProtein}г білку
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
