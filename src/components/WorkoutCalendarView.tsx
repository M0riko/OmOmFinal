import { ChevronLeft, ChevronRight, Dumbbell, Clock, Target, Activity, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WorkoutEvent {
  id: string;
  date: string;
  type: "strength" | "cardio" | "flexibility" | "sports";
  name: string;
  duration: number;
  isCompleted: boolean;
}

interface WorkoutCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  workouts: WorkoutEvent[];
  onWorkoutClick: (workout: WorkoutEvent) => void;
}

export function WorkoutCalendarView({
  currentDate,
  onDateChange,
  workouts,
  onWorkoutClick
}: WorkoutCalendarViewProps) {
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];

  const getWorkoutsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return workouts.filter(workout => workout.date === dateStr);
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case "strength": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cardio": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "flexibility": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "sports": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case "strength": return Dumbbell;
      case "cardio": return Activity;
      case "flexibility": return Heart;
      case "sports": return Target;
      default: return Dumbbell;
    }
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(new Date(year, month - 1, 1))}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(new Date(year, month + 1, 1))}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dayWorkouts = getWorkoutsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={cn(
                  "min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                  isCurrentMonthDay 
                    ? "bg-card/50 border-muted/30 hover:border-primary/30" 
                    : "bg-muted/20 border-muted/20",
                  isTodayDate && "ring-2 ring-primary/50 bg-primary/5"
                )}
                onClick={() => onDateChange(date)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentMonthDay ? "text-foreground" : "text-muted-foreground",
                  isTodayDate && "text-primary font-bold"
                )}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayWorkouts.slice(0, 2).map((workout) => {
                    const IconComponent = getWorkoutTypeIcon(workout.type);
                    return (
                      <div
                        key={workout.id}
                        className={cn(
                          "text-xs p-1 rounded border cursor-pointer transition-all duration-200 hover:scale-105",
                          getWorkoutTypeColor(workout.type),
                          workout.isCompleted && "opacity-60"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onWorkoutClick(workout);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <IconComponent className="w-3 h-3" />
                          <span className="truncate">{workout.name}</span>
                        </div>
                      </div>
                    );
                  })}
                  {dayWorkouts.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayWorkouts.length - 2} більше
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30" />
            <span className="text-muted-foreground">Силові</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
            <span className="text-muted-foreground">Кардіо</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
            <span className="text-muted-foreground">Гнучкість</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/30" />
            <span className="text-muted-foreground">Спорт</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
