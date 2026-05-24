import { ChevronLeft, ChevronRight, Calendar, Dumbbell, Activity, Heart, Coffee } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface ActivityData {
  date: string;
  activity: "workout" | "rest" | "light" | "none";
  intensity: number; // 0-5
}

interface ProfileActivityCalendarProps {
  activityData: ActivityData[];
  onDateClick?: (date: string) => void;
}

export function ProfileActivityCalendar({ activityData, onDateClick }: ProfileActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getActivityColor = (activity: string, intensity: number) => {
    switch (activity) {
      case "workout":
        if (intensity >= 4) return "bg-red-500";
        if (intensity >= 2) return "bg-orange-500";
        return "bg-yellow-500";
      case "light":
        return "bg-blue-500";
      case "rest":
        return "bg-purple-500";
      default:
        return "bg-muted";
    }
  };

  const getActivityIcon = (activity: string, intensity: number) => {
    switch (activity) {
      case "workout":
        if (intensity >= 4) return Dumbbell;
        if (intensity >= 2) return Activity;
        return Activity;
      case "light":
        return Heart;
      case "rest":
        return Coffee;
      default:
        return null;
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const activity = activityData.find(a => a.date === dateStr);
      days.push({
        day,
        date: dateStr,
        activity: activity?.activity || "none",
        intensity: activity?.intensity || 0
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const days = getDaysInMonth(currentMonth);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Календарь активности</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-8" />;
              }

              const isToday = day.date === new Date().toISOString().split('T')[0];
              const activityColor = getActivityColor(day.activity, day.intensity);
              const ActivityIcon = getActivityIcon(day.activity, day.intensity);

              return (
                <motion.div
                  key={day.date}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-110 ${
                    day.activity === "none" 
                      ? "bg-muted/30 text-muted-foreground hover:bg-muted/50" 
                      : `${activityColor} text-white hover:opacity-80`
                  } ${isToday ? "ring-2 ring-primary" : ""}`}
                  onClick={() => onDateClick?.(day.date)}
                  title={`${day.date} - ${day.activity} (${day.intensity}/5)`}
                >
                  {ActivityIcon ? (
                    <ActivityIcon className="w-3 h-3" />
                  ) : (
                    <span>{day.day}</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-muted/20">
            <span className="text-sm text-muted-foreground">Легенда:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Интенсивная</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-xs text-muted-foreground">Умеренная</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-xs text-muted-foreground">Легкая</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-xs text-muted-foreground">Отдых</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
