import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDaily } from "@/hooks/useDaily";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MealCalendar() {
  const { user } = useAuth();
  const { entries: todayEntries } = useDaily();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const [allEntries, setAllEntries] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('omomo_auth_token');
    const API_BASE = import.meta.env.PROD
      ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost') ? import.meta.env.VITE_API_BASE_URL : '')
      : (import.meta.env.VITE_API_BASE_URL || '');
      
    if (token) {
      fetch(`${API_BASE}/api/meals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.meals) setAllEntries(data.meals);
      })
      .catch(console.error);
    }
  }, []);

  const entries = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const pastEntries = allEntries.filter(e => {
        const d = new Date(e.date || new Date()).toISOString().split('T')[0];
        return d !== today;
    });
    return [...pastEntries, ...todayEntries];
  }, [allEntries, todayEntries]);
  
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
        calories: totals.calories + (entry.calories || 0),
        protein: totals.protein + (entry.protein || 0),
        fats: totals.fats + (entry.fats || 0),
        carbs: totals.carbs + (entry.carbs || 0)
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
                onClick={() => setSelectedDay(day)}
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

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? `${selectedDay.day} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` : 'Деталі дня'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <div className="font-bold text-orange-500">{selectedDay.totals.calories}</div>
                  <div className="text-xs text-muted-foreground">Ккал</div>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <div className="font-bold text-blue-500">{selectedDay.totals.protein}г</div>
                  <div className="text-xs text-muted-foreground">Білки</div>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <div className="font-bold text-yellow-500">{selectedDay.totals.fats}г</div>
                  <div className="text-xs text-muted-foreground">Жири</div>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <div className="font-bold text-green-500">{selectedDay.totals.carbs}г</div>
                  <div className="text-xs text-muted-foreground">Вуглеводи</div>
                </div>
              </div>

              {selectedDay.entries.length > 0 ? (
                <div className="space-y-3 mt-4">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Прийоми їжі</h4>
                  {selectedDay.entries.map((entry: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Flame className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{entry.name || 'Прийом їжі'}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.protein}г Б • {entry.fats}г Ж • {entry.carbs}г В
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-orange-500 text-sm">
                        {entry.calories} ккал
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Немає записів за цей день</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
