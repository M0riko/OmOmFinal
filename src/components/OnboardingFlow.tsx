import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Target, 
  Scale, 
  Activity, 
  Calculator,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  TrendingDown,
  Minus,
  TrendingUp,
  Globe,
  Bell,
  Settings,
  Heart,
  Dumbbell,
  Utensils,
  Moon,
  Sun,
  Monitor,
  PartyPopper,
  Zap,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
  initialData?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
}

interface OnboardingData {
  name: string;
  goal: "weight_loss" | "weight_maintenance" | "weight_gain";
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  calculatedCalories: number;
  
  // Детальні цілі
  targetWeight?: number;
  workoutDaysPerWeek?: number;
  workoutDuration?: number;
  dietaryPreferences?: string[];
  
  // Налаштування
  language: "uk" | "en";
  theme: "light" | "dark" | "system";
  units: {
    weight: "kg" | "lbs";
    height: "cm" | "ft";
    temperature: "celsius" | "fahrenheit";
  };
  
  // Сповіщення
  notifications: {
    workoutReminders: boolean;
    mealReminders: boolean;
    waterReminders: boolean;
    weeklyReports: boolean;
    achievements: boolean;
  };
  
  // Час сповіщень
  reminderTimes: {
    workout: string;
    meals: string;
    water: string;
  };
}

export function OnboardingFlow({ onComplete, onSkip, initialData }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({
    name: initialData?.name || "",
    language: "uk",
    theme: "system",
    units: {
      weight: "kg",
      height: "cm", 
      temperature: "celsius"
    },
    notifications: {
      workoutReminders: true,
      mealReminders: true,
      waterReminders: true,
      weeklyReports: true,
      achievements: true
    },
    reminderTimes: {
      workout: "18:00",
      meals: "12:00",
      water: "09:00"
    }
  });

  const totalSteps = 8;

  // Завантаження збереженого прогресу
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem("omom_onboarding_progress");
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setData(prev => ({ ...prev, ...parsed.data }));
        setCurrentStep(parsed.step || 1);
      }
    } catch (error) {
      console.error("Error loading onboarding progress:", error);
    }
  }, []);

  // Збереження прогресу
  useEffect(() => {
    try {
      localStorage.setItem("omom_onboarding_progress", JSON.stringify({
        step: currentStep,
        data: data
      }));
    } catch (error) {
      console.error("Error saving onboarding progress:", error);
    }
  }, [currentStep, data]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // На последнем шаге рассчитываем калории и завершаем
      const calculatedCalories = calculateCalories(data as OnboardingData);
      const finalData = { ...data, calculatedCalories } as OnboardingData;
      
      // Очищаем сохраненный прогресс
      localStorage.removeItem("omom_onboarding_progress");
      
      onComplete(finalData);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateCalories = (userData: OnboardingData) => {
    // Упрощенный расчет BMR (Mifflin-St Jeor Equation)
    const { gender, age, height, weight, activityLevel } = userData;
    
    let bmr;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    let calories = Math.round(bmr * activityMultipliers[activityLevel]);

    // Корректировка в зависимости от цели
    switch (userData.goal) {
      case "weight_loss":
        calories -= 500; // Дефицит 500 ккал в день
        break;
      case "weight_gain":
        calories += 500; // Профицит 500 ккал в день
        break;
      // Для поддержания веса оставляем как есть
    }

    return Math.max(1200, calories); // Минимум 1200 ккал
  };

  const activityLevels = {
    sedentary: { label: "Малорухливий", description: "Сидяча робота, мало фізичної активності" },
    light: { label: "Легка активність", description: "Легкі фізичні вправи 1-3 дні на тиждень" },
    moderate: { label: "Помірна активність", description: "Помірні фізичні вправи 3-5 днів на тиждень" },
    active: { label: "Висока активність", description: "Інтенсивні фізичні вправи 6-7 днів на тиждень" },
    very_active: { label: "Дуже висока активність", description: "Дуже інтенсивні фізичні вправи, фізична робота" }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case "weight_loss": return <TrendingDown className="w-6 h-6 text-red-500" />;
      case "weight_gain": return <TrendingUp className="w-6 h-6 text-green-500" />;
      case "weight_maintenance": return <Minus className="w-6 h-6 text-blue-500" />;
      default: return <Target className="w-6 h-6" />;
    }
  };

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case "weight_loss": return "Схуднути";
      case "weight_gain": return "Набрати м'язову масу";
      case "weight_maintenance": return "Підтримувати вагу";
      default: return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <PartyPopper className="w-5 h-5" />
                Вітаємо в SLKY!
              </h2>
              <p className="text-sm text-muted-foreground">
                Давайте налаштуємо ваш профіль, щоб SLKY став вашим персональним помічником. 
                Це займе всього хвилину.
              </p>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Порада:</strong> Ви можете пропустити будь-який крок і налаштувати профіль пізніше
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Як до вас звертатися?</Label>
              <Input
                id="name"
                placeholder="Введіть ваше ім'я"
                value={data.name || ""}
                onChange={(e) => updateData({ name: e.target.value })}
                className="h-12 text-base"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Ваша головна мета</h2>
              <p className="text-sm text-muted-foreground">
                Це допоможе нам персоналізувати ваш досвід
              </p>
            </div>
            
            <RadioGroup 
              value={data.goal || ""} 
              onValueChange={(value: any) => updateData({ goal: value })}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="weight_loss" id="weight_loss" className="mt-1" />
                <div className="flex items-start gap-3 flex-1">
                  <TrendingDown className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <Label htmlFor="weight_loss" className="text-base font-medium cursor-pointer">
                      Схуднути
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">Створити дефіцит калорій для зниження ваги</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="weight_maintenance" id="weight_maintenance" />
                <div className="flex items-center gap-3 flex-1">
                  <Minus className="w-6 h-6 text-blue-500" />
                  <div>
                    <Label htmlFor="weight_maintenance" className="text-base font-medium cursor-pointer">
                      Підтримувати вагу
                    </Label>
                    <p className="text-sm text-muted-foreground">Зберігати поточну вагу та форму</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="weight_gain" id="weight_gain" />
                <div className="flex items-center gap-3 flex-1">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <div>
                    <Label htmlFor="weight_gain" className="text-base font-medium cursor-pointer">
                      Набрати м'язову масу
                    </Label>
                    <p className="text-sm text-muted-foreground">Створити профіцит калорій для росту м'язів</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Основні параметри</h2>
              <p className="text-muted-foreground">
                Щоб розрахувати вашу персональну норму калорій, нам потрібно знати трохи більше про вас
              </p>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300">
                  🔒 <strong>Приватність:</strong> Всі дані зберігаються локально на вашому пристрої
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Стать</Label>
                <RadioGroup 
                  value={data.gender || ""} 
                  onValueChange={(value: any) => updateData({ gender: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Чоловік</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Жінка</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Вік</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  min="13"
                  max="120"
                  value={data.age || ""}
                  onChange={(e) => updateData({ age: Number(e.target.value) || 0 })}
                />
                {data.age && (data.age < 13 || data.age > 120) && (
                  <p className="text-sm text-destructive">Вік повинен бути від 13 до 120 років</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">Зріст (см)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  min="100"
                  max="250"
                  value={data.height || ""}
                  onChange={(e) => updateData({ height: Number(e.target.value) || 0 })}
                />
                {data.height && (data.height < 100 || data.height > 250) && (
                  <p className="text-sm text-destructive">Зріст повинен бути від 100 до 250 см</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Вага (кг)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  min="30"
                  max="300"
                  value={data.weight || ""}
                  onChange={(e) => updateData({ weight: Number(e.target.value) || 0 })}
                />
                {data.weight && (data.weight < 30 || data.weight > 300) && (
                  <p className="text-sm text-destructive">Вага повинна бути від 30 до 300 кг</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Рівень активності</h2>
              <p className="text-muted-foreground">
                Розкажіть про вашу активність протягом дня (без урахування тренувань)
              </p>
            </div>
            
            <RadioGroup 
              value={data.activityLevel || ""} 
              onValueChange={(value: any) => updateData({ activityLevel: value })}
              className="space-y-3"
            >
              {Object.entries(activityLevels).map(([key, level]) => (
                <div key={key} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={key} id={key} />
                  <div className="flex-1">
                    <Label htmlFor={key} className="text-base font-medium cursor-pointer">
                      {level.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <Target className="w-6 h-6" />
                Детальні цілі
              </h2>
              <p className="text-muted-foreground">
                Давайте встановимо конкретні цілі для вашого прогресу
              </p>
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> <strong>Опціонально:</strong> Ці налаштування можна змінити в будь-який час</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {data.goal === "weight_loss" || data.goal === "weight_gain" ? (
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">
                    {data.goal === "weight_loss" ? "Цільова вага (кг)" : "Бажана вага (кг)"}
                  </Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    placeholder={data.goal === "weight_loss" ? "65" : "75"}
                    min="30"
                    max="300"
                    value={data.targetWeight || ""}
                    onChange={(e) => updateData({ targetWeight: Number(e.target.value) || undefined })}
                  />
                  {data.targetWeight && (data.targetWeight < 30 || data.targetWeight > 300) && (
                    <p className="text-sm text-destructive">Цільова вага повинна бути від 30 до 300 кг</p>
                  )}
                  {data.targetWeight && data.weight && data.goal === "weight_loss" && data.targetWeight >= data.weight && (
                    <p className="text-sm text-destructive">Цільова вага повинна бути меншою за поточну</p>
                  )}
                  {data.targetWeight && data.weight && data.goal === "weight_gain" && data.targetWeight <= data.weight && (
                    <p className="text-sm text-destructive">Цільова вага повинна бути більшою за поточну</p>
                  )}
                </div>
              ) : null}
              
              <div className="space-y-2">
                <Label>Тренування на тиждень</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">0</span>
                  <Slider
                    value={[data.workoutDaysPerWeek || 3]}
                    onValueChange={(value) => updateData({ workoutDaysPerWeek: value[0] })}
                    max={7}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">7</span>
                </div>
                <div className="text-center">
                  <Badge variant="outline">{data.workoutDaysPerWeek || 3} днів на тиждень</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Тривалість тренування (хвилин)</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">15</span>
                  <Slider
                    value={[data.workoutDuration || 45]}
                    onValueChange={(value) => updateData({ workoutDuration: value[0] })}
                    max={120}
                    min={15}
                    step={15}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">120</span>
                </div>
                <div className="text-center">
                  <Badge variant="outline">{data.workoutDuration || 45} хвилин</Badge>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Налаштування 🌐</h2>
              <p className="text-muted-foreground">
                Персоналізуйте досвід використання додатку
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Мова</Label>
                <Select 
                  value={data.language || "uk"} 
                  onValueChange={(value: "uk" | "en") => updateData({ language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uk">🇺🇦 Українська</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Тема</Label>
                <RadioGroup 
                  value={data.theme || "system"} 
                  onValueChange={(value: "light" | "dark" | "system") => updateData({ theme: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Світла
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Темна
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Системна
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Одиниці вимірювання</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Вага</Label>
                    <Select 
                      value={data.units?.weight || "kg"} 
                      onValueChange={(value: "kg" | "lbs") => updateData({ 
                        units: { ...data.units, weight: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">кг</SelectItem>
                        <SelectItem value="lbs">фунти</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Зріст</Label>
                    <Select 
                      value={data.units?.height || "cm"} 
                      onValueChange={(value: "cm" | "ft") => updateData({ 
                        units: { ...data.units, height: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">см</SelectItem>
                        <SelectItem value="ft">фути</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Сповіщення 🔔</h2>
              <p className="text-muted-foreground">
                Налаштуйте сповіщення для кращого досвіду
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-base">Нагадування про тренування</Label>
                      <p className="text-sm text-muted-foreground">Щоденні нагадування про тренування</p>
                    </div>
                  </div>
                  <Switch
                    checked={data.notifications?.workoutReminders || false}
                    onCheckedChange={(checked) => updateData({
                      notifications: { ...data.notifications, workoutReminders: checked }
                    })}
                  />
                </div>
                
                {data.notifications?.workoutReminders && (
                  <div className="ml-8">
                    <Label className="text-sm">Час нагадування</Label>
                    <Input
                      type="time"
                      value={data.reminderTimes?.workout || "18:00"}
                      onChange={(e) => updateData({
                        reminderTimes: { ...data.reminderTimes, workout: e.target.value }
                      })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="text-base">Нагадування про їжу</Label>
                    <p className="text-sm text-muted-foreground">Нагадування про прийоми їжі</p>
                  </div>
                </div>
                <Switch
                  checked={data.notifications?.mealReminders || false}
                  onCheckedChange={(checked) => updateData({
                    notifications: { ...data.notifications, mealReminders: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="text-base">Нагадування про воду</Label>
                    <p className="text-sm text-muted-foreground">Регулярні нагадування пити воду</p>
                  </div>
                </div>
                <Switch
                  checked={data.notifications?.waterReminders || false}
                  onCheckedChange={(checked) => updateData({
                    notifications: { ...data.notifications, waterReminders: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="text-base">Тижневі звіти</Label>
                    <p className="text-sm text-muted-foreground">Щотижневі звіти про прогрес</p>
                  </div>
                </div>
                <Switch
                  checked={data.notifications?.weeklyReports || false}
                  onCheckedChange={(checked) => updateData({
                    notifications: { ...data.notifications, weeklyReports: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="text-base">Досягнення</Label>
                    <p className="text-sm text-muted-foreground">Сповіщення про нові досягнення</p>
                  </div>
                </div>
                <Switch
                  checked={data.notifications?.achievements || false}
                  onCheckedChange={(checked) => updateData({
                    notifications: { ...data.notifications, achievements: checked }
                  })}
                />
              </div>
            </div>
          </div>
        );

      case 8:
        const calculatedCalories = data.goal && data.gender && data.age && data.height && data.weight && data.activityLevel 
          ? calculateCalories(data as OnboardingData)
          : 0;

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                Готово!
              </h2>
              <p className="text-muted-foreground">
                Ваш профіль налаштовано! Ось що ми розрахували:
              </p>
            </div>
            
            <Card className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Calculator className="w-8 h-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{calculatedCalories}</span>
                <span className="text-lg text-muted-foreground">ккал/день</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Мета: <Badge variant="outline">{getGoalLabel(data.goal || "")}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Рівень активності: <Badge variant="outline">{activityLevels[data.activityLevel as keyof typeof activityLevels]?.label}</Badge>
                </div>
                {data.workoutDaysPerWeek && (
                  <div className="text-sm text-muted-foreground">
                    Тренування: <Badge variant="outline">{data.workoutDaysPerWeek} днів/тиждень</Badge>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Ви завжди зможете змінити ці налаштування в профілі.
              </p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.name && data.name.trim().length > 0;
      case 2: return data.goal;
      case 3: return data.gender && data.age && data.age >= 13 && data.age <= 120 && data.height && data.height >= 100 && data.height <= 250 && data.weight && data.weight >= 30 && data.weight <= 300;
      case 4: return data.activityLevel;
      case 5: {
        // Валідація цільової ваги, якщо вона вказана
        if (data.goal === "weight_loss" || data.goal === "weight_gain") {
          if (data.targetWeight) {
            if (data.targetWeight < 30 || data.targetWeight > 300) return false;
            if (data.weight) {
              if (data.goal === "weight_loss" && data.targetWeight >= data.weight) return false;
              if (data.goal === "weight_gain" && data.targetWeight <= data.weight) return false;
            }
          }
        }
        return true; // Детальні цілі - опціональні
      }
      case 6: return true; // Налаштування - мають значення за замовчуванням
      case 7: return true; // Сповіщення - мають значення за замовчуванням
      case 8: return true; // Фінальний крок
      default: return false;
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Мобильный заголовок */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Налаштування профілю</h1>
          <span className="text-sm text-muted-foreground">Крок {currentStep} з {totalSteps}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-3">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <button
              key={step}
              onClick={() => {
                // Позволяем переходить только к уже пройденным шагам или следующему
                if (step <= currentStep || step === currentStep + 1) {
                  setCurrentStep(step);
                }
              }}
              className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                step <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : step === currentStep + 1
                  ? 'bg-primary/20 text-primary border border-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
              disabled={step > currentStep + 1}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-100px)]">
        <Card className="w-full max-w-md p-6">

        {/* Контент шага */}
        {renderStep()}

          {/* Кнопки навигации */}
          <div className="flex flex-col gap-3 mt-8">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  className="gap-2 h-12 text-base flex-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={onSkip}
                className={`h-12 text-base ${currentStep > 1 ? 'flex-1' : 'flex-1'}`}
              >
                Пропустити
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1 gap-2 h-12 text-base"
              >
                <span>{currentStep === totalSteps ? "Почати!" : "Далі"}</span>
                {currentStep < totalSteps && <ArrowRight className="w-4 h-4" />}
                {currentStep === totalSteps && <CheckCircle className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Дополнительная информация */}
            {currentStep === 1 && (
              <p className="text-xs text-muted-foreground text-center">
                Це займе лише кілька хвилин
              </p>
            )}
            {currentStep === totalSteps && (
              <p className="text-xs text-muted-foreground text-center">
                Ви завжди зможете змінити ці налаштування пізніше
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
