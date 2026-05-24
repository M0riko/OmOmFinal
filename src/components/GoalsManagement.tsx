import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Save, 
  Calculator, 
  Activity, 
  Utensils, 
  Droplets, 
  Moon,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface GoalsManagementProps {
  user: any;
  onUpdateUser: (data: any) => void;
}

export function GoalsManagement({ user, onUpdateUser }: GoalsManagementProps) {
  // Основная цель
  const [mainGoal, setMainGoal] = useState<"weight_loss" | "weight_maintenance" | "weight_gain">("weight_loss");
  
  // Настройки веса
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);
  const [weightChangeRate, setWeightChangeRate] = useState(0.5); // кг в неделю
  
  // Цели по питанию
  const [calories, setCalories] = useState(user?.targets?.calories || 2000);
  const [protein, setProtein] = useState(user?.targets?.protein || 120);
  const [fats, setFats] = useState(user?.targets?.fats || 65);
  const [carbs, setCarbs] = useState(user?.targets?.carbs || 250);
  
  // Цели по активности
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(4);
  const [stepsPerDay, setStepsPerDay] = useState(10000);
  const [runningPerWeek, setRunningPerWeek] = useState(20); // км
  
  // Цели по привычкам
  const [waterGlasses, setWaterGlasses] = useState(8);
  const [sleepHours, setSleepHours] = useState(7);

  const activityLevels = {
    sedentary: { label: "Малорухливий", multiplier: 1.2 },
    light: { label: "Легка активність", multiplier: 1.375 },
    moderate: { label: "Помірна активність", multiplier: 1.55 },
    active: { label: "Висока активність", multiplier: 1.725 },
    very_active: { label: "Дуже висока активність", multiplier: 1.9 }
  };

  const calculateRecommendedCalories = () => {
    // Упрощенный расчет BMR (Mifflin-St Jeor Equation)
    const age = 25; // Должно браться из профиля
    const height = 170; // Должно браться из профиля
    const bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5; // Мужская формула
    const activityMultiplier = activityLevels.moderate.multiplier;
    
    let recommendedCalories = Math.round(bmr * activityMultiplier);
    
    // Корректировка в зависимости от цели
    switch (mainGoal) {
      case "weight_loss":
        recommendedCalories -= 500; // Дефицит 500 ккал в день
        break;
      case "weight_gain":
        recommendedCalories += 500; // Профицит 500 ккал в день
        break;
      // Для поддержания веса оставляем как есть
    }
    
    setCalories(recommendedCalories);
    toast.success(`Рекомендована норма: ${recommendedCalories} ккал`);
  };

  const calculateMacros = () => {
    // Расчет макронутриентов на основе калорий
    const proteinCalories = calories * 0.25; // 25% от калорий
    const fatCalories = calories * 0.25; // 25% от калорий
    const carbCalories = calories * 0.5; // 50% от калорий
    
    setProtein(Math.round(proteinCalories / 4)); // 4 ккал на грамм белка
    setFats(Math.round(fatCalories / 9)); // 9 ккал на грамм жира
    setCarbs(Math.round(carbCalories / 4)); // 4 ккал на грамм углеводов
    
    toast.success("Макронутриенти розраховані!");
  };

  const saveGoals = () => {
    const goalsData = {
      mainGoal,
      weight: { current: currentWeight, target: targetWeight, changeRate: weightChangeRate },
      nutrition: { calories, protein, fats, carbs },
      activity: { workoutsPerWeek, stepsPerDay, runningPerWeek },
      habits: { waterGlasses, sleepHours }
    };
    
    onUpdateUser({ 
      name: user?.name, 
      email: user?.email, 
      targets: { calories, protein, fats, carbs },
      goals: goalsData
    });
    
    toast.success("Цілі збережено!");
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case "weight_loss": return <TrendingDown className="w-5 h-5 text-red-500" />;
      case "weight_gain": return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "weight_maintenance": return <Minus className="w-5 h-5 text-blue-500" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case "weight_loss": return "Схуднення";
      case "weight_gain": return "Набір маси";
      case "weight_maintenance": return "Підтримка ваги";
      default: return "Не вибрано";
    }
  };

  return (
    <div className="space-y-6">
      {/* Основная цель */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Основна мета</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Ваша мета</Label>
            <Select value={mainGoal} onValueChange={(value: any) => setMainGoal(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    Схуднення
                  </div>
                </SelectItem>
                <SelectItem value="weight_maintenance">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-blue-500" />
                    Підтримка ваги
                  </div>
                </SelectItem>
                <SelectItem value="weight_gain">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Набір маси
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {mainGoal && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              {getGoalIcon(mainGoal)}
              <span className="font-medium">{getGoalLabel(mainGoal)}</span>
              <Badge variant="outline" className="ml-auto">
                {mainGoal === "weight_loss" && `-${weightChangeRate} кг/тиждень`}
                {mainGoal === "weight_gain" && `+${weightChangeRate} кг/тиждень`}
                {mainGoal === "weight_maintenance" && "Підтримка"}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Настройки веса */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Налаштування ваги</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Поточна вага (кг)</Label>
            <Input 
              value={currentWeight} 
              onChange={(e) => setCurrentWeight(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Бажана вага (кг)</Label>
            <Input 
              value={targetWeight} 
              onChange={(e) => setTargetWeight(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Темп зміни (кг/тиждень)</Label>
            <Select value={weightChangeRate.toString()} onValueChange={(value) => setWeightChangeRate(Number(value))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">0.25 кг</SelectItem>
                <SelectItem value="0.5">0.5 кг</SelectItem>
                <SelectItem value="0.75">0.75 кг</SelectItem>
                <SelectItem value="1">1 кг</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {currentWeight && targetWeight && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Прогрес до цілі</span>
              <span>{Math.abs(currentWeight - targetWeight).toFixed(1)} кг залишилось</span>
            </div>
            <Progress 
              value={Math.min(100, (Math.abs(currentWeight - targetWeight) / Math.abs(currentWeight - targetWeight)) * 100)} 
              className="h-2 mt-2"
            />
          </div>
        )}
      </Card>

      {/* Цели по питанию */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Цілі по харчуванню</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={calculateRecommendedCalories} size="sm">
              <Calculator className="w-4 h-4 mr-2" />
              Розрахувати калорії
            </Button>
            <Button variant="outline" onClick={calculateMacros} size="sm">
              <Calculator className="w-4 h-4 mr-2" />
              Розрахувати макро
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium">Калорії на день</Label>
            <Input 
              value={calories} 
              onChange={(e) => setCalories(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Білки (г)</Label>
            <Input 
              value={protein} 
              onChange={(e) => setProtein(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Жири (г)</Label>
            <Input 
              value={fats} 
              onChange={(e) => setFats(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Вуглеводи (г)</Label>
            <Input 
              value={carbs} 
              onChange={(e) => setCarbs(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Цели по активности */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Цілі по активності</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Тренування на тиждень
            </Label>
            <Input 
              value={workoutsPerWeek} 
              onChange={(e) => setWorkoutsPerWeek(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Кроків на день
            </Label>
            <Input 
              value={stepsPerDay} 
              onChange={(e) => setStepsPerDay(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Біг на тиждень (км)
            </Label>
            <Input 
              value={runningPerWeek} 
              onChange={(e) => setRunningPerWeek(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Цели по привычкам */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Цілі по звичках</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Склянок води на день
            </Label>
            <Input 
              value={waterGlasses} 
              onChange={(e) => setWaterGlasses(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Годин сну на ніч
            </Label>
            <Input 
              value={sleepHours} 
              onChange={(e) => setSleepHours(Number(e.target.value) || 0)} 
              type="number"
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Кнопка сохранения */}
      <div className="flex justify-end">
        <Button onClick={saveGoals} className="gap-2">
          <Save className="w-4 h-4" />
          Зберегти всі цілі
        </Button>
      </div>
    </div>
  );
}
