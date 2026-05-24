import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Award,
  Zap,
  Flame,
  Dumbbell,
  Trophy,
  Star
} from "lucide-react";
import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { WorkoutGoal, WorkoutGoalType, Difficulty } from "@/lib/workout-types";
import { WORKOUT_GOAL_LABELS, DIFFICULTY_LABELS } from "@/lib/workout-types";
import { allExercises } from "@/hooks/useWorkouts";

interface WorkoutGoalsTrackerProps {
  onAddGoal?: (goal: WorkoutGoal) => void;
}

export function WorkoutGoalsTracker({ onAddGoal }: WorkoutGoalsTrackerProps) {
  const { 
    workoutGoals, 
    allExercises,
    addWorkoutGoal, 
    updateWorkoutGoal, 
    removeWorkoutGoal 
  } = useWorkouts();
  
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<WorkoutGoal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<WorkoutGoal>>({
    name: '',
    nameUk: '',
    description: '',
    descriptionUk: '',
    targetValue: 0,
    currentValue: 0,
    unit: 'кг',
    targetDate: '',
    priority: 'medium'
  });

  // Фильтрация целей
  const activeGoals = workoutGoals.filter(goal => !goal.isCompleted);
  const completedGoals = workoutGoals.filter(goal => goal.isCompleted);

  // Прогресс к цели
  const getGoalProgress = (goal: WorkoutGoal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  // Дни до цели
  const getDaysToGoal = (goal: WorkoutGoal) => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Приоритет цвета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Иконка для типа цели
  const getGoalIcon = (goalType: WorkoutGoalType) => {
    switch (goalType) {
      case 'strength': return <Dumbbell className="w-5 h-5" />;
      case 'muscle_gain': return <TrendingUp className="w-5 h-5" />;
      case 'weight_loss': return <Flame className="w-5 h-5" />;
      case 'endurance': return <Zap className="w-5 h-5" />;
      case 'flexibility': return <Target className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  // Сохранение цели
  const handleSaveGoal = () => {
    if (!newGoal.nameUk || !newGoal.targetValue || !newGoal.targetDate) {
      alert('Заповніть всі обов\'язкові поля');
      return;
    }

    const goal: WorkoutGoal = {
      id: editingGoal?.id || crypto.randomUUID(),
      name: newGoal.name || newGoal.nameUk,
      nameUk: newGoal.nameUk,
      description: newGoal.description || '',
      descriptionUk: newGoal.descriptionUk || '',
      targetValue: newGoal.targetValue,
      currentValue: newGoal.currentValue || 0,
      unit: newGoal.unit || 'кг',
      exerciseId: newGoal.exerciseId,
      exerciseName: newGoal.exerciseName,
      targetDate: newGoal.targetDate,
      isCompleted: false,
      priority: newGoal.priority || 'medium'
    };

    if (editingGoal) {
      updateWorkoutGoal(goal.id, goal);
    } else {
      addWorkoutGoal(goal);
    }

    setShowAddGoal(false);
    setEditingGoal(null);
    setNewGoal({
      name: '',
      nameUk: '',
      description: '',
      descriptionUk: '',
      targetValue: 0,
      currentValue: 0,
      unit: 'кг',
      targetDate: '',
      priority: 'medium'
    });
  };

  // Редактирование цели
  const handleEditGoal = (goal: WorkoutGoal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      nameUk: goal.nameUk,
      description: goal.description,
      descriptionUk: goal.descriptionUk,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit,
      exerciseId: goal.exerciseId,
      exerciseName: goal.exerciseName,
      targetDate: goal.targetDate,
      priority: goal.priority
    });
    setShowAddGoal(true);
  };

  // Обновление прогресса
  const handleUpdateProgress = (goalId: string, newValue: number) => {
    updateWorkoutGoal(goalId, { currentValue: newValue });
  };

  // Завершение цели
  const handleCompleteGoal = (goalId: string) => {
    updateWorkoutGoal(goalId, { 
      isCompleted: true, 
      completedDate: new Date().toISOString() 
    });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Цілі тренувань</h2>
          <p className="text-muted-foreground">
            Встановлюйте та відстежуйте свої фітнес-цілі
          </p>
        </div>
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Додати ціль
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Редагувати ціль' : 'Додати нову ціль'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Назва цілі</label>
                  <Input
                    value={newGoal.nameUk}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, nameUk: e.target.value }))}
                    placeholder="Наприклад: Підтягнутися 10 разів"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Пріоритет</label>
                  <Select value={newGoal.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низький</SelectItem>
                      <SelectItem value="medium">Середній</SelectItem>
                      <SelectItem value="high">Високий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Опис</label>
                <Input
                  value={newGoal.descriptionUk}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, descriptionUk: e.target.value }))}
                  placeholder="Детальний опис цілі"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Цільове значення</label>
                  <Input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Поточне значення</label>
                  <Input
                    type="number"
                    value={newGoal.currentValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Одиниця</label>
                  <Select value={newGoal.unit} onValueChange={(value) => setNewGoal(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="кг">кг</SelectItem>
                      <SelectItem value="раз">раз</SelectItem>
                      <SelectItem value="хв">хвилин</SelectItem>
                      <SelectItem value="см">см</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Дата досягнення</label>
                <Input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                  Скасувати
                </Button>
                <Button onClick={handleSaveGoal}>
                  {editingGoal ? 'Оновити' : 'Додати'} ціль
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Активные цели */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Активні цілі ({activeGoals.length})</h3>
        
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const progress = getGoalProgress(goal);
              const daysLeft = getDaysToGoal(goal);
              const isOverdue = daysLeft < 0;
              const isNearDeadline = daysLeft <= 7 && daysLeft >= 0;

              return (
                <Card key={goal.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getGoalIcon(goal.exerciseId as WorkoutGoalType || 'general_fitness')}
                        </div>
                        <div>
                          <h4 className="font-semibold">{goal.nameUk}</h4>
                          <p className="text-sm text-muted-foreground">{goal.descriptionUk}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority === 'high' ? 'Високий' : 
                           goal.priority === 'medium' ? 'Середній' : 'Низький'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleEditGoal(goal)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Прогрес</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-center text-sm font-medium">
                        {Math.round(progress)}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={`text-sm ${
                          isOverdue ? 'text-red-600' : 
                          isNearDeadline ? 'text-orange-600' : 'text-muted-foreground'
                        }`}>
                          {isOverdue ? `Просрочено на ${Math.abs(daysLeft)} днів` :
                           daysLeft === 0 ? 'Сьогодні' :
                           daysLeft === 1 ? 'Завтра' :
                           `Залишилось ${daysLeft} днів`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0"
                          className="w-20 h-8"
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            handleUpdateProgress(goal.id, value);
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleCompleteGoal(goal.id)}
                          disabled={progress < 100}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Немає активних цілей</h3>
                <p className="text-muted-foreground">
                  Встановіть цілі, щоб відстежувати свій прогрес
                </p>
              </div>
              <Button onClick={() => setShowAddGoal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Додати першу ціль
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Завершенные цели */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Досягнуті цілі ({completedGoals.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{goal.nameUk}</h4>
                        <p className="text-sm text-muted-foreground">{goal.descriptionUk}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Досягнуто
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Результат</span>
                      <span className="text-sm font-bold text-green-600">
                        {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Дата досягнення</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.completedDate ? new Date(goal.completedDate).toLocaleDateString('uk-UA') : 'Невідомо'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
