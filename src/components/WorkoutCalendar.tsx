import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  Plus, 
  Play, 
  CheckCircle, 
  Clock, 
  Dumbbell, 
  Target,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import { useState, useMemo } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { PlannedWorkout, CompletedWorkout, WorkoutProgram } from "@/lib/workout-types";
import { WorkoutConstructor } from "./WorkoutConstructor";
import { LiveWorkoutMode } from "./LiveWorkoutMode";

interface WorkoutCalendarProps {
  onStartWorkout?: (workout: PlannedWorkout) => void;
}

export function WorkoutCalendar({ onStartWorkout }: WorkoutCalendarProps) {
  const { 
    plannedWorkouts, 
    completedWorkouts, 
    allPrograms, 
    getWorkoutsByDate,
    planWorkoutFromProgram,
    startWorkout,
    removePlannedWorkout
  } = useWorkouts();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showWorkoutConstructor, setShowWorkoutConstructor] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout | null>(null);
  const [showLiveMode, setShowLiveMode] = useState(false);

  // Генерация календаря
  const calendarDays = useMemo(() => {
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
    
    return days;
  }, [currentDate]);

  // Получение тренировок для конкретной даты
  const getWorkoutsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return getWorkoutsByDate(dateString);
  };

  // Навигация по месяцам
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Проверка, является ли дата сегодняшней
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Проверка, является ли дата выбранной
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Проверка, есть ли тренировки на дату
  const hasWorkouts = (date: Date) => {
    const workouts = getWorkoutsForDate(date);
    return workouts.planned.length > 0 || workouts.completed.length > 0;
  };

  // Начало тренировки
  const handleStartWorkout = (workout: PlannedWorkout) => {
    setSelectedWorkout(workout);
    setShowLiveMode(true);
    startWorkout(workout.id);
  };

  // Планирование тренировки из программы
  const handlePlanFromProgram = (program: WorkoutProgram, dayIndex: number, date: Date) => {
    const day = program.days[dayIndex];
    if (day) {
      planWorkoutFromProgram(program.id, day.id, date.toISOString());
    }
  };

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="space-y-6">
      {/* Заголовок и навигация */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Календар тренувань</h2>
          <p className="text-muted-foreground">
            Плануйте та відстежуйте свої тренування
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddWorkout} onOpenChange={setShowAddWorkout}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Додати тренування
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Додати тренування</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddWorkout(false);
                      setShowWorkoutConstructor(true);
                    }}
                    className="h-20 gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Створити нову</div>
                      <div className="text-sm text-muted-foreground">Власна тренування</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 gap-2"
                  >
                    <Calendar className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">З програми</div>
                      <div className="text-sm text-muted-foreground">Готові програми</div>
                    </div>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Календарь */}
      <Card className="p-6">
        {/* Навигация по месяцам */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Дни календаря */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const workouts = getWorkoutsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isTodayDate = isToday(date);
            const isSelectedDate = isSelected(date);
            const hasWorkoutsOnDate = hasWorkouts(date);

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                  ${isTodayDate ? 'ring-2 ring-primary' : ''}
                  ${isSelectedDate ? 'bg-primary/10' : ''}
                  hover:bg-muted/50
                `}
                onClick={() => setSelectedDate(date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {date.getDate()}
                  </span>
                  {hasWorkoutsOnDate && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                
                {/* Мини-список тренировок */}
                <div className="space-y-1">
                  {workouts.planned.slice(0, 2).map(workout => (
                    <div
                      key={workout.id}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1 py-0.5 rounded truncate"
                    >
                      {workout.name}
                    </div>
                  ))}
                  {workouts.completed.slice(0, 1).map(workout => (
                    <div
                      key={workout.id}
                      className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1 py-0.5 rounded truncate flex items-center gap-1"
                    >
                      <CheckCircle className="w-2 h-2" />
                      Завершено
                    </div>
                  ))}
                  {(workouts.planned.length + workouts.completed.length) > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{(workouts.planned.length + workouts.completed.length) - 3} ще
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Детали выбранной даты */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {selectedDate.toLocaleDateString('uk-UA', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Сьогодні
          </Button>
        </div>

        {(() => {
          const workouts = getWorkoutsForDate(selectedDate);
          const allWorkouts = [...workouts.planned, ...workouts.completed];

          if (allWorkouts.length === 0) {
            return (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-semibold mb-2">Немає тренувань</h4>
                <p className="text-muted-foreground mb-4">
                  На цю дату не заплановано тренувань
                </p>
                <Button onClick={() => setShowAddWorkout(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Додати тренування
                </Button>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {/* Запланированные тренировки */}
              {workouts.planned.map(workout => (
                <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{workout.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {workout.exercises.length} вправ • ~45 хв
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStartWorkout(workout)}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Почати
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Завершенные тренировки */}
              {workouts.completed.map(workout => (
                <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{workout.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Завершено • {workout.duration} хв • {workout.totalVolume} кг
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Завершено
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </Card>

      {/* Конструктор тренировок */}
      {showWorkoutConstructor && (
        <Dialog open={showWorkoutConstructor} onOpenChange={setShowWorkoutConstructor}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Конструктор тренування</DialogTitle>
            </DialogHeader>
            <WorkoutConstructor 
              onSaveWorkout={(workout) => {
                // Здесь можно добавить логику сохранения тренировки
                setShowWorkoutConstructor(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Live режим */}
      {showLiveMode && selectedWorkout && (
        <Dialog open={showLiveMode} onOpenChange={setShowLiveMode}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <LiveWorkoutMode
              workout={selectedWorkout}
              onComplete={() => {
                setShowLiveMode(false);
                setSelectedWorkout(null);
              }}
              onCancel={() => {
                setShowLiveMode(false);
                setSelectedWorkout(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
