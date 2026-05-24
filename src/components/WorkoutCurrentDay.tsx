import { Play, Clock, Target, CheckCircle, Plus, Dumbbell, Activity, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Workout {
  id: string;
  name: string;
  type: "strength" | "cardio" | "flexibility" | "sports";
  duration: number;
  exercises: number;
  isCompleted: boolean;
  progress?: number;
}

interface WorkoutCurrentDayProps {
  todayWorkout?: Workout;
  onStartWorkout: () => void;
  onAddWorkout: () => void;
  onViewWorkout: (workout: Workout) => void;
}

export function WorkoutCurrentDay({
  todayWorkout,
  onStartWorkout,
  onAddWorkout,
  onViewWorkout
}: WorkoutCurrentDayProps) {
  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case "strength": return "from-blue-500 to-blue-600";
      case "cardio": return "from-red-500 to-red-600";
      case "flexibility": return "from-green-500 to-green-600";
      case "sports": return "from-purple-500 to-purple-600";
      default: return "from-gray-500 to-gray-600";
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

  const getWorkoutTypeLabel = (type: string) => {
    switch (type) {
      case "strength": return "Силове";
      case "cardio": return "Кардіо";
      case "flexibility": return "Гнучкість";
      case "sports": return "Спорт";
      default: return "Тренування";
    }
  };

  if (!todayWorkout) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 text-center bg-card/30 backdrop-blur-sm border-2 border-muted/30 shadow-lg">
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-muted-foreground" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">
                Немає тренування на сьогодні
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Час створити план тренувань або додати нове тренування до календаря
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={onAddWorkout}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Додати тренування
              </Button>
              
              <Button 
                onClick={onStartWorkout}
                variant="outline"
                className="gap-2 border-2 hover:bg-muted/50"
              >
                <Play className="w-4 h-4" />
                Почати зараз
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg",
                getWorkoutTypeColor(todayWorkout.type)
              )}>
                {(() => {
                  const IconComponent = getWorkoutTypeIcon(todayWorkout.type);
                  return <IconComponent className="w-6 h-6 text-white" />;
                })()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {todayWorkout.name}
                </h3>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  {getWorkoutTypeLabel(todayWorkout.type)}
                </Badge>
              </div>
            </div>
            
            {todayWorkout.isCompleted && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Завершено</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{todayWorkout.duration} хв</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>{todayWorkout.exercises} вправ</span>
            </div>
          </div>

          {/* Progress */}
          {todayWorkout.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Прогрес</span>
                <span className="font-medium">{todayWorkout.progress}%</span>
              </div>
              <Progress value={todayWorkout.progress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!todayWorkout.isCompleted ? (
              <Button 
                onClick={onStartWorkout}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                <Play className="w-4 h-4" />
                Почати тренування
              </Button>
            ) : (
              <Button 
                onClick={() => onViewWorkout(todayWorkout)}
                className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Переглянути результат
              </Button>
            )}
            
            <Button 
              onClick={() => onViewWorkout(todayWorkout)}
              variant="outline"
              className="border-2 hover:bg-muted/50"
            >
              Деталі
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
