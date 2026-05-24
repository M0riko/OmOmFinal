import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Play, 
  Plus, 
  Dumbbell, 
  Target, 
  Clock, 
  Users,
  Star,
  Eye,
  BookOpen,
  Zap,
  Heart,
  TrendingUp
} from "lucide-react";
import { useState, useMemo } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { Exercise, MuscleGroup, Equipment, ExerciseType, Difficulty } from "@/lib/workout-types";
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS, EXERCISE_TYPE_LABELS, DIFFICULTY_LABELS } from "@/lib/workout-types";

interface ExerciseLibraryProps {
  onSelectExercise?: (exercise: Exercise) => void;
  showAddButton?: boolean;
}

export function ExerciseLibrary({ onSelectExercise, showAddButton = true }: ExerciseLibraryProps) {
  const { allExercises, addCustomExercise } = useWorkouts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);

  // Фильтрация упражнений
  const filteredExercises = useMemo(() => {
    let filtered = allExercises;

    // Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exercise => 
        exercise.name.toLowerCase().includes(query) ||
        exercise.nameUk.toLowerCase().includes(query) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Фильтр по мышечной группе
    if (selectedMuscleGroup !== "all") {
      filtered = filtered.filter(exercise => 
        exercise.primaryMuscleGroup === selectedMuscleGroup ||
        exercise.secondaryMuscleGroups.includes(selectedMuscleGroup as MuscleGroup)
      );
    }

    // Фильтр по оборудованию
    if (selectedEquipment !== "all") {
      filtered = filtered.filter(exercise => exercise.equipment === selectedEquipment);
    }

    // Фильтр по сложности
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    return filtered;
  }, [allExercises, searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty]);

  // Группировка упражнений по мышечным группам
  const exercisesByMuscleGroup = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    filteredExercises.forEach(exercise => {
      const group = exercise.primaryMuscleGroup;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(exercise);
    });
    return groups;
  }, [filteredExercises]);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetails(true);
  };

  const handleAddToWorkout = (exercise: Exercise) => {
    onSelectExercise?.(exercise);
    setShowExerciseDetails(false);
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getEquipmentIcon = (equipment: Equipment) => {
    switch (equipment) {
      case 'barbell': return <Dumbbell className="w-4 h-4" />;
      case 'dumbbell': return <Dumbbell className="w-4 h-4" />;
      case 'bodyweight': return <Users className="w-4 h-4" />;
      case 'machine': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и поиск */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">Бібліотека вправ</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Пошук вправ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {showAddButton && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Додати вправу
          </Button>
        )}
      </div>

      {/* Фильтры */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="М'язова група" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі групи</SelectItem>
              {Object.entries(MUSCLE_GROUP_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Обладнання" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі типи</SelectItem>
              {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Складність" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі рівні</SelectItem>
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Список упражнений */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Всі вправи ({filteredExercises.length})</TabsTrigger>
          {Object.entries(exercisesByMuscleGroup).map(([group, exercises]) => (
            <TabsTrigger key={group} value={group}>
              {MUSCLE_GROUP_LABELS[group as MuscleGroup]} ({exercises.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{exercise.nameUk}</h3>
                      <p className="text-sm text-muted-foreground">{exercise.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getEquipmentIcon(exercise.equipment)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {MUSCLE_GROUP_LABELS[exercise.primaryMuscleGroup]}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                      {DIFFICULTY_LABELS[exercise.difficulty]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {EXERCISE_TYPE_LABELS[exercise.exerciseType]}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.descriptionUk}
                  </p>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectExercise(exercise)}
                      className="gap-2"
                    >
                      <Eye className="w-3 h-3" />
                      Деталі
                    </Button>
                    {onSelectExercise && (
                      <Button
                        size="sm"
                        onClick={() => handleAddToWorkout(exercise)}
                        className="gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        Додати
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {Object.entries(exercisesByMuscleGroup).map(([group, exercises]) => (
          <TabsContent key={group} value={group} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{exercise.nameUk}</h3>
                        <p className="text-sm text-muted-foreground">{exercise.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getEquipmentIcon(exercise.equipment)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                        {DIFFICULTY_LABELS[exercise.difficulty]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {EXERCISE_TYPE_LABELS[exercise.exerciseType]}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {exercise.descriptionUk}
                    </p>

                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectExercise(exercise)}
                        className="gap-2"
                      >
                        <Eye className="w-3 h-3" />
                        Деталі
                      </Button>
                      {onSelectExercise && (
                        <Button
                          size="sm"
                          onClick={() => handleAddToWorkout(exercise)}
                          className="gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          Додати
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Детали упражнения */}
      <Dialog open={showExerciseDetails} onOpenChange={setShowExerciseDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedExercise?.nameUk}</DialogTitle>
          </DialogHeader>
          
          {selectedExercise && (
            <div className="space-y-6">
              {/* Основная информация */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {MUSCLE_GROUP_LABELS[selectedExercise.primaryMuscleGroup]}
                </Badge>
                <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                  {DIFFICULTY_LABELS[selectedExercise.difficulty]}
                </Badge>
                <Badge variant="secondary">
                  {EXERCISE_TYPE_LABELS[selectedExercise.exerciseType]}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {getEquipmentIcon(selectedExercise.equipment)}
                  {EQUIPMENT_LABELS[selectedExercise.equipment]}
                </Badge>
              </div>

              {/* Описание */}
              <div>
                <h4 className="font-semibold mb-2">Опис</h4>
                <p className="text-muted-foreground">{selectedExercise.descriptionUk}</p>
              </div>

              {/* Инструкции */}
              <div>
                <h4 className="font-semibold mb-2">Інструкції</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {selectedExercise.instructionsUk.map((instruction, index) => (
                    <li key={index} className="text-sm">{instruction}</li>
                  ))}
                </ol>
              </div>

              {/* Советы */}
              {selectedExercise.tipsUk.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Поради</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedExercise.tipsUk.map((tip, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Вторичные мышечные группы */}
              {selectedExercise.secondaryMuscleGroups.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Додаткові м'язові групи</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.secondaryMuscleGroups.map((group) => (
                      <Badge key={group} variant="outline">
                        {MUSCLE_GROUP_LABELS[group]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Действия */}
              <div className="flex gap-3 pt-4 border-t">
                {onSelectExercise && (
                  <Button onClick={() => handleAddToWorkout(selectedExercise)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Додати до тренування
                  </Button>
                )}
                <Button variant="outline" className="gap-2">
                  <Star className="w-4 h-4" />
                  Додати в улюблені
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
