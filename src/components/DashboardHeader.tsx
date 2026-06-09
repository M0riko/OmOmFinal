import { HugeiconsIcon } from '@hugeicons/react';
import { Notification03Icon, UserIcon, FireIcon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useDaily } from "@/hooks/useDaily";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const getDaysPlural = (days: number) => {
  if (days % 10 === 1 && days % 100 !== 11) return `${days} день`;
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return `${days} дні`;
  return `${days} днів`;
};

export function DashboardHeader() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  let todayLabel = new Date().toLocaleDateString("uk-UA", { 
    day: "numeric", 
    month: "long",
    weekday: "long"
  });
  // Capitalize first letter
  todayLabel = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);
  
  const { streakDays = 0 } = useDaily ? useDaily() : { streakDays: 3 }; // fallback if useDaily not imported, wait, let's import useDaily
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("hello")}, <span className="text-primary">
              {user?.name || t("guest")}
            </span>
          </h1>
          {streakDays > 0 && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15">
              <HugeiconsIcon icon={FireIcon} size={14} className="mr-1" />
              {getDaysPlural(streakDays)}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          {todayLabel}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              className="relative rounded-full w-11 h-11 hover:bg-muted/50"
            >
              <HugeiconsIcon icon={Notification03Icon} size={22} strokeWidth={1.5} />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Сповіщення</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <span className="font-medium text-sm">Виконано ціль по воді! 💧</span>
              <span className="text-xs text-muted-foreground">Щойно</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <span className="font-medium text-sm">Нове досягнення розблоковано 🏆</span>
              <span className="text-xs text-muted-foreground">2 години тому</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <span className="font-medium text-sm">Час для перекусу 🍎</span>
              <span className="text-xs text-muted-foreground">Сьогодні</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full w-11 h-11 hover:bg-muted/50"
          onClick={() => navigate("/profile")}
        >
          <HugeiconsIcon icon={UserIcon} size={22} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
