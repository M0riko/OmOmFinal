import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Clock, 
  Dumbbell, 
  Target,
  Save,
  Play,
  Edit,
  Copy,
  MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { Exercise, WorkoutExercise, ExerciseSet, WorkoutDay, WorkoutProgram, Difficulty, WorkoutGoalType } from "@/lib/workout-types";
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, WORKOUT_GOAL_LABELS } from "@/lib/workout-types";
import { ExerciseLibrary } from "./ExerciseLibrary";

interface WorkoutConstructorProps {
  onSaveWorkout?: (workout: WorkoutDay) => void;
  onSaveProgram?: (program: WorkoutProgram) => void;
  initialWorkout?: WorkoutDay;
  initialProgram?: WorkoutProgram;
}

export function WorkoutConstructor({ 
  onSaveWorkout, 
  onSaveProgram, 
  initialWorkout,
  initialProgram 
}: WorkoutConstructorProps) {
  const { allExercises } = useWorkouts();
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showSetEditor, setShowSetEditor] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number>(-1);
  
  // Состояние тренировки
  const [workout, setWorkout] = useState<WorkoutDay>(initialWorkout || {
    id: crypto.randomUUID(),
    name: 'Нова тренування',
    nameUk: 'Нова тренування',
    description: '',
    exercises: [],
    estimatedDuration: 45,
    difficulty: 'beginner',
    targetMuscleGroups: [],
    isCustom: true
  });

  // Состояние программы
  const [isCreatingProgram, setIsCreatingProgram] = useState(!!initialProgram);
  const [program, setProgram] = useState<WorkoutProgram>(initialProgram || {
    id: crypto.randomUUID(),
    name: 'Нова програма',
    nameUk: 'Нова програма',
    description: '',
    descriptionUk: '',
    duration: 4,
    frequency: 3,
    difficulty: 'beginner',
    goal: 'general_fitness',
    days: [],
    isCustom: true,
    tags: []
  });

  // Добавление упражнения
  const handleAddExercise = (exercise: Exercise) => {
    const workoutExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exercise,
      sets: [{
        id: crypto.randomUUID(),
        reps: 10,
        weight: 0,
        restTime: 90,
        isCompleted: false
      }],
      order: workout.exercises.length
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, workoutExercise],
      targetMuscleGroups: [...new Set([...prev.targetMuscleGroups, exercise.primaryMuscleGroup])]
    }));

    setShowExerciseLibrary(false);
  };

  // Удаление упражнения
  const handleRemoveExercise = (exerciseId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  // Добавление подхода
  const handleAddSet = (exerciseId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId 
          ? {
              ...ex,
              sets: [...ex.sets, {
                id: crypto.randomUUID(),
                reps: 10,
                weight: 0,
                restTime: 90,
                isCompleted: false
              }]
            }
          : ex
      )
    }));
  };

  // Удаление подхода
  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId 
          ? {
              ...ex,
              sets: ex.sets.filter(set => set.id !== setId)
            }
          : ex
      )
    }));
  };

  // Редактирование подхода
  const handleEditSet = (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId 
          ? {
              ...ex,
              sets: ex.sets.map(set => 
                set.id === setId ? { ...set, ...updates } : set
              )
            }
          : ex
      )
    }));
  };

  // Сохранение тренировки
  const handleSaveWorkout = () => {
    if (workout.exercises.length === 0) {
      alert('Додайте хоча б одну вправу');
      return;
    }

    onSaveWorkout?.(workout);
  };

  // Сохранение программы
  const handleSaveProgram = () => {
    if (program.days.length === 0) {
      alert('Додайте хоча б один день тренування');
      return;
    }

    onSaveProgram?.(program);
  };

  // Добавление дня в программу
  const handleAddDayToProgram = () => {
    const newDay: WorkoutDay = {
      ...workout,
      id: crypto.randomUUID(),
      name: `День ${program.days.length + 1}`,
      nameUk: `День ${program.days.length + 1}`
    };

    setProgram(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }));

    // Сбрасываем тренировку для следующего дня
    setWorkout({
      id: crypto.randomUUID(),
      name: 'Нова тренування',
      nameUk: 'Нова тренування',
      description: '',
      exercises: [],
      estimatedDuration: 45,
      difficulty: 'beginner',
      targetMuscleGroups: [],
      isCustom: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isCreatingProgram ? 'Конструктор програми' : 'Конструктор тренування'}
          </h2>
          <p className="text-muted-foreground">
            {isCreatingProgram 
              ? 'Створіть власну програму тренувань' 
              : 'Створіть власну тренування'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreatingProgram(!isCreatingProgram)}>
            {isCreatingProgram ? 'Тренування' : 'Програма'}
          </Button>
          <Button onClick={isCreatingProgram ? handleSaveProgram : handleSaveWorkout} className="gap-2">
            <Save className="w-4 h-4" />
            Зберегти
          </Button>
        </div>
      </div>

      {isCreatingProgram ? (
        /* Конструктор программы */
        <div className="space-y-6">
          {/* Настройки программы */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Налаштування програми</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Назва програми</label>
                <Input 
                  value={program.nameUk}
                  onChange={(e) => setProgram(prev => ({ ...prev, nameUk: e.target.value }))}
                  placeholder="Назва програми"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Тривалість (тижнів)</label>
                <Input 
                  type="number"
                  value={program.duration}
                  onChange={(e) => setProgram(prev => ({ ...prev, duration: parseInt(e.target.value) || 4 }))}
                  min="1"
                  max="52"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Частота (разів на тиждень)</label>
                <Input 
                  type="number"
                  value={program.frequency}
                  onChange={(e) => setProgram(prev => ({ ...prev, frequency: parseInt(e.target.value) || 3 }))}
                  min="1"
                  max="7"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Складність</label>
                <Select value={program.difficulty} onValueChange={(value: Difficulty) => setProgram(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Мета</label>
                <Select value={program.goal} onValueChange={(value: WorkoutGoalType) => setProgram(prev => ({ ...prev, goal: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WORKOUT_GOAL_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Опис</label>
              <Input 
                value={program.descriptionUk}
                onChange={(e) => setProgram(prev => ({ ...prev, descriptionUk: e.target.value }))}
                placeholder="Опис програми"
              />
            </div>
          </Card>

          {/* Дни программы */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Дні тренувань ({program.days.length})</h3>
              <Button onClick={handleAddDayToProgram} className="gap-2">
                <Plus className="w-4 h-4" />
                Додати день
              </Button>
            </div>

            {program.days.map((day, index) => (
              <Card key={day.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{day.nameUk}</h4>
                    <p className="text-sm text-muted-foreground">
                      {day.exercises.length} вправ • {day.estimatedDuration} хв
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {day.targetMuscleGroups.map(group => (
                    <Badge key={group} variant="outline">
                      {MUSCLE_GROUP_LABELS[group]}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Конструктор тренировки */
        <div className="space-y-6">
          {/* Настройки тренировки */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Налаштування тренування</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Назва тренування</label>
                <Input 
                  value={workout.nameUk}
                  onChange={(e) => setWorkout(prev => ({ ...prev, nameUk: e.target.value }))}
                  placeholder="Назва тренування"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Тривалість (хвилин)</label>
                <Input 
                  type="number"
                  value={workout.estimatedDuration}
                  onChange={(e) => setWorkout(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 45 }))}
                  min="10"
                  max="180"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Складність</label>
                <Select value={workout.difficulty} onValueChange={(value: Difficulty) => setWorkout(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Опис</label>
              <Input 
                value={workout.description}
                onChange={(e) => setWorkout(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опис тренування"
              />
            </div>
          </Card>

          {/* Упражнения */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Вправи ({workout.exercises.length})</h3>
              <Dialog open={showExerciseLibrary} onOpenChange={setShowExerciseLibrary}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Додати вправу
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Виберіть вправу</DialogTitle>
                  </DialogHeader>
                  <ExerciseLibrary onSelectExercise={handleAddExercise} showAddButton={false} />
                </DialogContent>
              </Dialog>
            </div>

            {workout.exercises.map((exercise, index) => (
              <Card key={exercise.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{exercise.exercise.nameUk}</h4>
                        <p className="text-sm text-muted-foreground">
                          {MUSCLE_GROUP_LABELS[exercise.exercise.primaryMuscleGroup]} • 
                          {exercise.sets.length} підходів
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveExercise(exercise.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Подходы */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Підходи</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddSet(exercise.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="font-medium">Підхід</div>
                      <div className="font-medium">Повторення</div>
                      <div className="font-medium">Вага (кг)</div>
                      <div className="font-medium">Відпочинок (с)</div>
                    </div>

                    {exercise.sets.map((set, setIndex) => (
                      <div key={set.id} className="grid grid-cols-4 gap-2">
                        <div className="flex items-center">
                          <span className="text-sm">{setIndex + 1}</span>
                        </div>
                        <Input 
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleEditSet(exercise.id, set.id, { reps: parseInt(e.target.value) || 0 })}
                          className="h-8"
                        />
                        <Input 
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleEditSet(exercise.id, set.id, { weight: parseFloat(e.target.value) || 0 })}
                          className="h-8"
                        />
                        <div className="flex items-center gap-1">
                          <Input 
                            type="number"
                            value={set.restTime}
                            onChange={(e) => handleEditSet(exercise.id, set.id, { restTime: parseInt(e.target.value) || 0 })}
                            className="h-8 flex-1"
                          />
                          {exercise.sets.length > 1 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveSet(exercise.id, set.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}

            {workout.exercises.length === 0 && (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Немає вправ</h3>
                    <p className="text-muted-foreground">
                      Додайте вправи, щоб створити тренування
                    </p>
                  </div>
                  <Button onClick={() => setShowExerciseLibrary(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Додати першу вправу
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
