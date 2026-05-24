import { Coffee, Sun, Moon, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealSelectorProps {
  selectedMeal: "breakfast" | "lunch" | "dinner" | "snack";
  onMealChange: (meal: "breakfast" | "lunch" | "dinner" | "snack") => void;
}

export function MealSelector({ selectedMeal, onMealChange }: MealSelectorProps) {
  const meals = [
    { 
      key: "breakfast" as const, 
      label: "Сніданок", 
      icon: Coffee, 
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    { 
      key: "lunch" as const, 
      label: "Обід", 
      icon: Sun, 
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700"
    },
    { 
      key: "dinner" as const, 
      label: "Вечеря", 
      icon: Moon, 
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    { 
      key: "snack" as const, 
      label: "Перекус", 
      icon: Apple, 
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    }
  ];

  return (
    <div className="flex gap-2 p-1 bg-muted/20 rounded-2xl">
      {meals.map((meal) => {
        const IconComponent = meal.icon;
        const isSelected = selectedMeal === meal.key;
        
        return (
          <Button
            key={meal.key}
            variant="ghost"
            size="sm"
            onClick={() => onMealChange(meal.key)}
            className={`
              flex-1 h-12 flex items-center justify-center gap-2 px-3 rounded-xl
              transition-all duration-300 hover:scale-105
              ${isSelected 
                ? `bg-gradient-to-r ${meal.color} text-white shadow-lg` 
                : `${meal.bgColor} ${meal.textColor} hover:bg-gradient-to-r hover:${meal.color} hover:text-white`
              }
            `}
          >
            <IconComponent className="w-4 h-4" />
            <span className="text-sm font-medium">{meal.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
