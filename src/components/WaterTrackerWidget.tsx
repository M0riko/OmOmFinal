import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface WaterTrackerWidgetProps {
  dailyGoal?: number; // в литрах
}

export function WaterTrackerWidget({ dailyGoal = 2.0 }: WaterTrackerWidgetProps) {
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [glasses, setGlasses] = useState<boolean[]>(new Array(8).fill(false));

  // Загружаем данные из localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`water_intake_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      setWaterIntake(data.waterIntake);
      setGlasses(data.glasses);
    }
  }, []);

  // Сохраняем данные в localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`water_intake_${today}`, JSON.stringify({
      waterIntake,
      glasses
    }));
  }, [waterIntake, glasses]);

  const glassSize = dailyGoal / 8; // размер одного стакана в литрах
  const progress = (waterIntake / dailyGoal) * 100;

  const addWater = () => {
    if (waterIntake < dailyGoal) {
      const newIntake = Math.min(waterIntake + glassSize, dailyGoal);
      setWaterIntake(newIntake);
      
      // Обновляем стаканы с анимацией
      const newGlasses = [...glasses];
      const glassIndex = Math.floor(newIntake / glassSize);
      for (let i = 0; i < glassIndex; i++) {
        newGlasses[i] = true;
      }
      setGlasses(newGlasses);
      
      // Анимация для последнего заполненного стакана
      const lastGlassIndex = glassIndex - 1;
      if (lastGlassIndex >= 0) {
        const glassElement = document.getElementById(`glass-${lastGlassIndex}`);
        if (glassElement) {
          glassElement.style.transform = 'scale(1.2)';
          setTimeout(() => {
            glassElement.style.transform = 'scale(1)';
          }, 200);
        }
      }
    }
  };

  const removeWater = () => {
    if (waterIntake > 0) {
      const newIntake = Math.max(waterIntake - glassSize, 0);
      setWaterIntake(newIntake);
      
      // Обновляем стаканы
      const newGlasses = [...glasses];
      const glassIndex = Math.floor(newIntake / glassSize);
      for (let i = glassIndex; i < glasses.length; i++) {
        newGlasses[i] = false;
      }
      setGlasses(newGlasses);
    }
  };

  const toggleGlass = (index: number) => {
    const newGlasses = [...glasses];
    newGlasses[index] = !newGlasses[index];
    setGlasses(newGlasses);
    
    // Пересчитываем общее потребление
    const filledGlasses = newGlasses.filter(Boolean).length;
    setWaterIntake(filledGlasses * glassSize);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">Вода</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {waterIntake.toFixed(1)} / {dailyGoal} л
        </Badge>
      </div>

      {/* Прогресс бар */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Прогресс</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Стаканы */}
      <div className="mb-4">
        <div className="grid grid-cols-4 gap-2">
          {glasses.map((isFilled, index) => (
            <button
              key={index}
              id={`glass-${index}`}
              onClick={() => toggleGlass(index)}
              className={`w-8 h-8 rounded-lg border-2 transition-all duration-300 ${
                isFilled 
                  ? 'bg-blue-500 border-blue-500 text-white shadow-lg' 
                  : 'bg-background border-border hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <Droplets className="w-4 h-4 mx-auto" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Нажмите на стакан, чтобы отметить
        </p>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={removeWater}
          disabled={waterIntake === 0}
          className="flex-1 gap-1"
        >
          <Minus className="w-3 h-3" />
          Убрать
        </Button>
        <Button 
          size="sm" 
          onClick={addWater}
          disabled={waterIntake >= dailyGoal}
          className="flex-1 gap-1"
        >
          <Plus className="w-3 h-3" />
          Добавить
        </Button>
      </div>

      {/* Мотивационные сообщения */}
      {progress >= 100 && (
        <div className="mt-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm text-center">
          Отлично! Цель по воде достигнута!
        </div>
      )}
      {progress >= 75 && progress < 100 && (
        <div className="mt-3 p-2 bg-blue-100 text-blue-700 rounded-lg text-sm text-center">
          Почти у цели! Осталось немного
        </div>
      )}
      {progress < 25 && (
        <div className="mt-3 p-2 bg-orange-100 text-orange-700 rounded-lg text-sm text-center">
          Не забывайте пить воду!
        </div>
      )}
    </Card>
  );
}
