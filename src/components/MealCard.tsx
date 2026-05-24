import { Clock, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MealCardProps {
  name: string;
  time: string;
  calories: number;
  macros: string;
}

export function MealCard({ name, time, calories, macros }: MealCardProps) {
  return (
    <Card className="p-4 hover:shadow-elevated transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h4>
        <Badge variant="outline" className="gap-1">
          <Clock className="w-3 h-3" />
          {time}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-accent">
          <Flame className="w-4 h-4" />
          <span className="font-medium">{calories} ккал</span>
        </div>
        <span className="text-muted-foreground">{macros}</span>
      </div>
    </Card>
  );
}
