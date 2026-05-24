import { Lightbulb, TrendingUp, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MealPlanSummaryBannerProps {
  hasPlan: boolean;
  completionPercentage: number;
  streakDays?: number;
}

export function MealPlanSummaryBanner({ 
  hasPlan, 
  completionPercentage, 
  streakDays = 0 
}: MealPlanSummaryBannerProps) {
  const getAdviceMessage = () => {
    if (!hasPlan) {
      return {
        title: "Пора створити свій план!",
        message: "Персоналізований план харчування допоможе досягти ваших цілей",
        color: "from-purple-500 to-pink-500",
        bgColor: "from-purple-500/10 to-pink-500/10",
        borderColor: "border-purple-500/30",
        icon: Target
      };
    } else if (completionPercentage < 30) {
      return {
        title: "Почніть з малого!",
        message: "Додайте кілька страв до свого плану, щоб почати рух до мети",
        color: "from-green-500 to-emerald-500",
        bgColor: "from-green-500/10 to-emerald-500/10",
        borderColor: "border-green-500/30",
        icon: TrendingUp
      };
    } else if (completionPercentage < 70) {
      return {
        title: "Ви на правильному шляху!",
        message: "Продовжуйте додавати страви, щоб завершити свій план",
        color: "from-blue-500 to-cyan-500",
        bgColor: "from-blue-500/10 to-cyan-500/10",
        borderColor: "border-blue-500/30",
        icon: TrendingUp
      };
    } else {
      return {
        title: "Відмінна робота!",
        message: "Ваш план майже готовий! Залишилось трохи до повного виконання",
        color: "from-yellow-500 to-orange-500",
        bgColor: "from-yellow-500/10 to-orange-500/10",
        borderColor: "border-yellow-500/30",
        icon: Lightbulb
      };
    }
  };

  const advice = getAdviceMessage();

  return (
    <Card className={`p-6 bg-gradient-to-br border-2 shadow-lg ${advice.bgColor} ${advice.borderColor}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${advice.color} flex items-center justify-center shadow-lg`}>
            <advice.icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">
              {advice.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {advice.message}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {hasPlan && (
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {completionPercentage}%
              </div>
              <div className="text-xs text-muted-foreground mb-2">Прогрес</div>
              <Progress value={completionPercentage} className="w-20 h-2" />
            </div>
          )}
          
          {streakDays > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {streakDays}
              </div>
              <div className="text-xs text-muted-foreground">днів поспіль</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
