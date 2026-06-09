import { HugeiconsIcon } from '@hugeicons/react';
import { FireIcon, Award02Icon, Target02Icon, ChartIncreaseIcon, ArrowRight01Icon, Rocket01Icon, CheckmarkBadge01Icon, FlashIcon } from '@hugeicons/core-free-icons';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAchievements } from "@/hooks/useAchievements";
import { getDaysPlural } from "./DashboardHeader";

interface MotivationBannerProps {
  streakDays?: number;
  todayProgress?: number;
  achievementsCount?: number;
}

export function MotivationBanner({ 
  streakDays = 3, 
  todayProgress = 75,
  achievementsCount
}: MotivationBannerProps) {
  const navigate = useNavigate();
  const { achievements } = useAchievements();
  
  const actualAchievementsCount = achievementsCount ?? achievements.length;
  
  const getMotivationMessage = () => {
    if (streakDays >= 7) {
      return {
        title: "Непереможна серія!",
        icon: FireIcon,
        message: `Ви на серії ${streakDays} днів! Продовжуйте в тому ж дусі!`,
        accentClass: "bg-primary/5 border-primary/15",
        iconBg: "bg-primary/10",
        iconColor: "text-primary"
      };
    } else if (streakDays >= 3) {
      return {
        title: "Ви на серії!",
        icon: FireIcon,
        message: `${getDaysPlural(streakDays)} поспіль! Тримайте ритм!`,
        accentClass: "bg-warning/5 border-warning/15",
        iconBg: "bg-warning/10",
        iconColor: "text-warning"
      };
    } else if (todayProgress >= 100) {
      return {
        title: "Мета досягнута!",
        icon: CheckmarkBadge01Icon,
        message: "Ви виконали денну норму калорій! Відмінна робота!",
        accentClass: "bg-success/5 border-success/15",
        iconBg: "bg-success/10",
        iconColor: "text-success"
      };
    } else if (todayProgress >= 80) {
      return {
        title: "Майже готово!",
        icon: FlashIcon,
        message: "Ви на 80% від мети! Ще трохи і мета буде досягнута!",
        accentClass: "bg-secondary/5 border-secondary/15",
        iconBg: "bg-secondary/10",
        iconColor: "text-secondary"
      };
    } else {
      return {
        title: "Початок дня!",
        icon: Rocket01Icon,
        message: "Кожен день - це нова можливість стати краще!",
        accentClass: "bg-primary/5 border-primary/15",
        iconBg: "bg-primary/10",
        iconColor: "text-primary"
      };
    }
  };
  
  const motivation = getMotivationMessage();
  
  return (
    <Card className={`p-6 ${motivation.accentClass} border shadow-card rounded-2xl transition-all duration-300`}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${motivation.iconBg} flex items-center justify-center flex-shrink-0`}>
            <HugeiconsIcon icon={motivation.icon} size={24} className={motivation.iconColor} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              {motivation.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {motivation.message}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            {streakDays > 0 && (
              <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full">
                <HugeiconsIcon icon={FireIcon} size={14} className="mr-1" />
                {getDaysPlural(streakDays)}
              </Badge>
            )}
            
            {actualAchievementsCount > 0 && (
              <Badge variant="outline" className="text-xs rounded-full">
                <HugeiconsIcon icon={Award02Icon} size={14} className="mr-1" />
                {actualAchievementsCount} досягнень
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-8 rounded-full"
              onClick={() => navigate("/profile")}
            >
              <HugeiconsIcon icon={Award02Icon} size={14} className="mr-1" />
              Досягнення
            </Button>
            
            <Button 
              size="sm" 
              className="bg-primary text-primary-foreground border-0 text-xs h-8 rounded-full hover:bg-primary/90 transition-all duration-200"
              onClick={() => navigate("/meal-plan")}
            >
              <HugeiconsIcon icon={ChartIncreaseIcon} size={14} className="mr-1" />
              План
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
