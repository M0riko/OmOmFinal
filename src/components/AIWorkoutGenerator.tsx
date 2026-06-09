import { Dumbbell, Target, Clock, Zap, Play, Settings, Brain, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";

interface WorkoutPlan {
  id: string;
  name: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  focus: string[];
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest: number;
  }>;
  calories: number;
  description: string;
}

interface AIWorkoutGeneratorProps {
  userGoals?: string[];
  userLevel?: string;
  availableTime?: number;
  onStartWorkout?: (workout: WorkoutPlan) => void;
}

export function AIWorkoutGenerator({ 
  userGoals = ["Схуднення", "Сила"], 
  userLevel = "intermediate", 
  availableTime = 45,
  onStartWorkout 
}: AIWorkoutGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<WorkoutPlan | null>(null);
  const { t } = useI18n();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userGoals);

  const goalOptions = [
    "Схуднення", "Набір м'язової маси", "Сила", "Витривалість", 
    "Гнучкість", "Загальна фізична підготовка", "Рельєф"
  ];

  const generateWorkout = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const workout: WorkoutPlan = {
        id: "1",
        name: "Персональне тренування",
        duration: availableTime,
        difficulty: userLevel as any,
        focus: selectedGoals,
        exercises: [
          { name: "Присідання", sets: 3, reps: "12-15", rest: 60 },
          { name: "Віджимання", sets: 3, reps: "8-12", rest: 60 },
          { name: "Планка", sets: 3, reps: "30-45 сек", rest: 45 },
          { name: "Випади", sets: 3, reps: "10-12 на ногу", rest: 60 },
          { name: "Берпі", sets: 3, reps: "8-10", rest: 90 }
        ],
        calories: Math.round(availableTime * 8),
        description: `Тренування створено на основі ваших цілей: ${selectedGoals.join(", ")}. Оптимальне навантаження для ${userLevel} рівня.`
      };
      
      setGeneratedWorkout(workout);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{t("aiWorkoutGenerator")}</h3>
              <p className="text-sm text-muted-foreground">{t("creatingPersonalProgram")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-medium">{t("aiActive")}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Goals Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Оберіть цілі тренування</h4>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((goal) => (
                <Badge
                  key={goal}
                  variant={selectedGoals.includes(goal) ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedGoals.includes(goal) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary/10"
                  }`}
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button 
          onClick={generateWorkout}
          disabled={isGenerating || selectedGoals.length === 0}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Генерую тренування...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Створити персональне тренування
            </>
          )}
        </Button>
      </motion.div>

      {/* Generated Workout */}
      {generatedWorkout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{generatedWorkout.name}</h4>
                  <p className="text-sm text-muted-foreground">{generatedWorkout.description}</p>
                </div>
                <Badge className={getDifficultyColor(generatedWorkout.difficulty)}>
                  {generatedWorkout.difficulty}
                </Badge>
              </div>

              {/* Workout Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Час</p>
                  <p className="font-semibold text-foreground">{generatedWorkout.duration} хв</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Калорії</p>
                  <p className="font-semibold text-foreground">{generatedWorkout.calories}</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Вправи</p>
                  <p className="font-semibold text-foreground">{generatedWorkout.exercises.length}</p>
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-3">
                <h5 className="font-semibold text-foreground">Вправи:</h5>
                {generatedWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} підходи по {exercise.reps}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Відпочинок</p>
                      <p className="font-medium text-foreground">{exercise.rest}с</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Button */}
              <Button 
                onClick={() => onStartWorkout?.(generatedWorkout)}
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Play className="w-4 h-4" />
                Почати тренування
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
