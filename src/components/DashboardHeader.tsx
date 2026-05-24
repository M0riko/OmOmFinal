import { HugeiconsIcon } from '@hugeicons/react';
import { Notification03Icon, UserIcon, FireIcon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const todayLabel = new Date().toLocaleDateString("uk-UA", { 
    day: "numeric", 
    month: "long",
    weekday: "long"
  });
  
  const streakDays = 3;
  
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
              {streakDays} {t("days")}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          {todayLabel}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className="relative rounded-full w-11 h-11 hover:bg-muted/50"
        >
          <HugeiconsIcon icon={Notification03Icon} size={22} strokeWidth={1.5} />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full"></div>
        </Button>
        
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
