import { cn } from "@/lib/utils";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

interface WeekCalendarProps {
  weeklyPlan?: { [date: string]: any };
}

export function WeekCalendar({ weeklyPlan = {} }: WeekCalendarProps) {
  const jsDay = new Date().getDay(); // 0=Sun..6=Sat
  const today = (jsDay + 6) % 7; // shift so 0=Mon

  // Get current week dates
  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const monday = new Date(today.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();

  const getDayCalories = (date: string) => {
    const dayMeals = weeklyPlan[date];
    if (!dayMeals) return 0;

    return Object.values(dayMeals).flat().reduce((total: number, meal: any) => {
      return total + (meal.calories || 0);
    }, 0);
  };

  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 min-w-0">
      {weekDays.map((day, index) => {
        const isToday = index === today;
        const date = weekDates[index];
        const calories = getDayCalories(date);
        
        return (
          <button
            key={index}
            type="button"
            className={cn(
              "min-w-[64px] sm:min-w-[84px] px-3 py-3 sm:py-4 rounded-2xl text-center transition-all duration-200",
              "border bg-card hover:bg-muted",
              isToday && "bg-primary text-primary-foreground border-transparent shadow-glow"
            )}
          >
            <p className={cn("text-xs sm:text-sm font-medium mb-1", isToday ? "text-primary-foreground/90" : "text-muted-foreground")}>{day}</p>
            <div className="leading-none">
              <span className={cn("text-base sm:text-lg font-bold", isToday ? "text-primary-foreground" : "text-foreground")}>{calories}</span>
              <span className={cn("ml-1 text-[10px] sm:text-xs", isToday ? "text-primary-foreground/90" : "text-muted-foreground")}>ккал</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
