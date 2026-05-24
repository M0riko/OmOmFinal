import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDaily } from "@/hooks/useDaily";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function MealCalendar() {
  const { user } = useAuth();
  const { entries } = useDaily();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const targetCalories = user?.targets?.calories || 2000;

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday
    
    // Create calendar grid
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Get entries for this date
      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date || new Date()).toISOString().split('T')[0];
        return entryDate === dateString;
      });
      
      // Calculate totals for the day
      const dayTotals = dayEntries.reduce((totals, entry) => ({
        calories: totals.calories + entry.calories,
        protein: totals.protein + entry.protein,
        fats: totals.fats + entry.fats,
        carbs: totals.carbs + entry.carbs
      }), { calories: 0, protein: 0, fats: 0, carbs: 0 });
      
      const progress = targetCalories ? (dayTotals.calories / targetCalories) * 100 : 0;
      
      days.push({
        date,
        day,
        entries: dayEntries,
        totals: dayTotals,
        progress: Math.min(progress, 100),
        isToday: dateString === new Date().toISOString().split('T')[0],
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0))
      });
    }
    
    return days;
  }, [currentDate, entries, targetCalories]);

  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];

  const dayNames = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 80) return "bg-blue-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getProgressIntensity = (progress: number) => {
    if (progress >= 100) return "opacity-100";
    if (progress >= 80) return "opacity-90";
    if (progress >= 60) return "opacity-70";
    if (progress >= 40) return "opacity-50";
    return "opacity-30";
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Календар прийомів їжі</h3>
              <p className="text-xs text-muted-foreground">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateMonth('prev')}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={goToToday}
              className="h-7 px-2 text-xs"
            >
              Сьогодні
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateMonth('next')}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Day names header */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dayNames.map((dayName) => (
            <div key={dayName} className="text-center text-xs font-medium text-muted-foreground py-1">
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarData.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-8" />;
            }

            const { date, day: dayNumber, entries, totals, progress, isToday, isPast } = day;
            
            return (
              <div
                key={index}
                className={cn(
                  "relative h-8 flex items-center justify-center rounded-md cursor-pointer transition-all duration-300 hover:scale-105",
                  "border hover:border-primary/30",
                  isToday 
                    ? "bg-primary/10 border-primary/50 shadow-md" 
                    : "bg-muted/20 border-muted/30 hover:bg-muted/40",
                  isPast && !isToday && "opacity-60"
                )}
                title={`${dayNumber} ${monthNames[currentDate.getMonth()]} - ${totals.calories} ккал`}
              >
                {/* Day number */}
                <span className={cn(
                  "text-xs font-medium",
                  isToday ? "text-primary font-bold" : "text-foreground"
                )}>
                  {dayNumber}
                </span>
                
                {/* Progress indicator */}
                {entries.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-muted/30 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getProgressColor(progress),
                        getProgressIntensity(progress)
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                
                {/* Entry count badge */}
                {entries.length > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">
                      {entries.length}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-2 border-t border-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>100%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>80%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>60%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span>40%+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>&lt;40%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="w-3 h-3" />
            <span>До {targetCalories} ккал</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
