import { Play, Target, BookOpen, Coffee, Plus, Dumbbell, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface WorkoutQuickActionsProps {
  onStartWorkout: () => void;
  onSetGoal: () => void;
  onOpenLibrary: () => void;
  onTakeRest: () => void;
  onAddWorkout: () => void;
}

export function WorkoutQuickActions({
  onStartWorkout,
  onSetGoal,
  onOpenLibrary,
  onTakeRest,
  onAddWorkout
}: WorkoutQuickActionsProps) {
  const actions = [
    {
      id: "start",
      title: "Почати тренування",
      description: "Швидкий старт",
      icon: Play,
      color: "from-primary to-primary/80",
      bgColor: "from-primary/10 to-primary/5",
      borderColor: "border-primary/30",
      action: onStartWorkout
    },
    {
      id: "goal",
      title: "Встановити ціль",
      description: "Нова мета",
      icon: Target,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-500/10 to-orange-500/5",
      borderColor: "border-orange-500/30",
      action: onSetGoal
    },
    {
      id: "library",
      title: "Бібліотека вправ",
      description: "База вправ",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/10 to-blue-500/5",
      borderColor: "border-blue-500/30",
      action: onOpenLibrary
    },
    {
      id: "rest",
      title: "Відпочинок",
      description: "Відновитися",
      icon: Coffee,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-500/10 to-green-500/5",
      borderColor: "border-green-500/30",
      action: onTakeRest
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Швидкі дії</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <motion.div
                key={action.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className={`
                    h-20 w-full gap-3 justify-start p-4 border-2 transition-all duration-300 
                    hover:scale-105 hover:shadow-lg cursor-pointer
                    ${action.bgColor} ${action.borderColor}
                  `}
                  onClick={action.action}
                >
                  <div className={`
                    w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg
                    ${action.color}
                  `}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm text-foreground">
                      {action.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Action */}
        <div className="pt-4 border-t border-muted/30">
          <Button
            onClick={onAddWorkout}
            className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Створити нове тренування
          </Button>
        </div>
      </div>
    </Card>
  );
}
