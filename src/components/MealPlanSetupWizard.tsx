import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  Utensils, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  TrendingDown,
  Scale,
  TrendingUp,
  Leaf,
  Sprout,
  Zap,
  Beef,
  Fish,
  Wheat,
  Milk,
  Timer,
  Coins,
  Banknote,
  Gem
} from "lucide-react";
import { MealPlanPreferences } from "@/lib/meal-planner";
import { toast } from "sonner";

interface MealPlanSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (preferences: MealPlanPreferences) => void;
}

const GOALS = [
  { value: "weight_loss", label: "Схуднення", description: "Зниження ваги з збереженням м'язової маси", icon: "TrendingDown" },
  { value: "maintenance", label: "Підтримка", description: "Збереження поточної ваги та здоров'я", icon: "Scale" },
  { value: "weight_gain", label: "Набір маси", description: "Збільшення ваги та м'язової маси", icon: "TrendingUp" }
];

const DIET_TYPES = [
  { value: "standard", label: "Стандартна", description: "Збалансоване харчування", icon: "Utensils" },
  { value: "vegetarian", label: "Вегетаріанська", description: "Без м'яса та риби", icon: "Leaf" },
  { value: "vegan", label: "Веганська", description: "Тільки рослинна їжа", icon: "Sprout" },
  { value: "keto", label: "Кето", description: "Низьковуглеводна дієта", icon: "Zap" },
  { value: "paleo", label: "Палео", description: "Первісна дієта", icon: "Beef" },
  { value: "mediterranean", label: "Середземноморська", description: "Здорове серце", icon: "Fish" },
  { value: "gluten_free", label: "Без глютену", description: "Для чутливих до глютену", icon: "Wheat" },
  { value: "dairy_free", label: "Без молочних", description: "Без лактози", icon: "Milk" }
];

const MEALS_PER_DAY = [
  { value: 3, label: "3 рази на день", description: "Сніданок, обід, вечеря" },
  { value: 4, label: "4 рази на день", description: "+ 1 перекус" },
  { value: 5, label: "5 разів на день", description: "+ 2 перекуси" },
  { value: 6, label: "6 разів на день", description: "Часті невеликі прийоми їжі" }
];

const COOKING_TIMES = [
  { value: "quick", label: "Швидко", description: "До 30 хвилин", icon: "Zap" },
  { value: "moderate", label: "Помірно", description: "30-60 хвилин", icon: "Clock" },
  { value: "extensive", label: "Довго", description: "Понад 60 хвилин", icon: "Timer" }
];

const COOKING_SKILLS = [
  { value: "beginner", label: "Початківець", description: "Прості рецепти" },
  { value: "intermediate", label: "Середній", description: "Середня складність" },
  { value: "advanced", label: "Досвідчений", description: "Складні рецепти" }
];

const BUDGETS = [
  { value: "low", label: "Економний", description: "До 500 грн на тиждень", icon: "Coins" },
  { value: "medium", label: "Середній", description: "500-1000 грн на тиждень", icon: "Banknote" },
  { value: "high", label: "Високий", description: "Понад 1000 грн на тиждень", icon: "Gem" }
];

const COMMON_EXCLUDED_FOODS = [
  "Гриби", "Цибуля", "Часник", "Морепродукти", "Горіхи", "Молочні продукти",
  "Глютен", "Яйця", "Сочевиця", "Квасоля", "Капуста", "Броколі", "Цвітна капуста",
  "Гостра їжа", "Солодощі", "Шоколад", "Кава", "Алкоголь"
];

export function MealPlanSetupWizard({ open, onOpenChange, onComplete }: MealPlanSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<Partial<MealPlanPreferences>>({
    goal: "maintenance",
    dietType: "standard",
    excludedFoods: [],
    mealsPerDay: 3,
    cookingTime: "moderate",
    cookingSkill: "intermediate",
    budget: "medium"
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      TrendingDown,
      Scale,
      TrendingUp,
      Utensils,
      Leaf,
      Sprout,
      Zap,
      Beef,
      Fish,
      Wheat,
      Milk,
      Timer,
      Coins,
      Banknote,
      Gem
    };
    return iconMap[iconName] || Target;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      if (preferences.goal && preferences.dietType && preferences.mealsPerDay && 
          preferences.cookingTime && preferences.cookingSkill && preferences.budget) {
        onComplete(preferences as MealPlanPreferences);
        onOpenChange(false);
        setCurrentStep(1);
        setPreferences({
          goal: "maintenance",
          dietType: "standard",
          excludedFoods: [],
          mealsPerDay: 3,
          cookingTime: "moderate",
          cookingSkill: "intermediate",
          budget: "medium"
        });
      } else {
        toast.error("Будь ласка, заповніть всі обов'язкові поля");
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExcludedFoodToggle = (food: string) => {
    setPreferences(prev => ({
      ...prev,
      excludedFoods: prev.excludedFoods?.includes(food)
        ? prev.excludedFoods.filter(f => f !== food)
        : [...(prev.excludedFoods || []), food]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Ваша мета</h3>
              <p className="text-muted-foreground">Оберіть основну мету вашого плану харчування</p>
            </div>
            
            <div className="grid gap-4">
              {GOALS.map((goal) => (
                <Card
                  key={goal.value}
                  className={`p-4 cursor-pointer transition-all ${
                    preferences.goal === goal.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setPreferences(prev => ({ ...prev, goal: goal.value as any }))}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {React.createElement(getIconComponent(goal.icon), { className: "w-6 h-6 text-primary" })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{goal.label}</h4>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    {preferences.goal === goal.value && (
                      <Badge variant="default">Обрано</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Utensils className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Тип дієти</h3>
              <p className="text-muted-foreground">Оберіть підходящий тип харчування</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {DIET_TYPES.map((diet) => (
                <Card
                  key={diet.value}
                  className={`p-4 cursor-pointer transition-all ${
                    preferences.dietType === diet.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setPreferences(prev => ({ ...prev, dietType: diet.value as any }))}
                >
                  <div className="text-center">
                    <div className="p-2 bg-primary/10 rounded-lg mx-auto mb-2 w-fit">
                      {React.createElement(getIconComponent(diet.icon), { className: "w-6 h-6 text-primary" })}
                    </div>
                    <h4 className="font-semibold text-sm">{diet.label}</h4>
                    <p className="text-xs text-muted-foreground">{diet.description}</p>
                    {preferences.dietType === diet.value && (
                      <Badge variant="default" className="mt-2">Обрано</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Продукти-виключення</h3>
              <p className="text-muted-foreground">Оберіть продукти, які ви не їсте (алергени, нелюбимі)</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {COMMON_EXCLUDED_FOODS.map((food) => (
                  <div
                    key={food}
                    className="flex items-center space-x-2 p-2 rounded border cursor-pointer hover:bg-muted/50"
                    onClick={() => handleExcludedFoodToggle(food)}
                  >
                    <Checkbox
                      checked={preferences.excludedFoods?.includes(food) || false}
                      onChange={() => handleExcludedFoodToggle(food)}
                    />
                    <Label className="text-sm cursor-pointer">{food}</Label>
                  </div>
                ))}
              </div>
              
              {preferences.excludedFoods && preferences.excludedFoods.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Обрані продукти:</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.excludedFoods.map((food) => (
                      <Badge key={food} variant="secondary" className="gap-1">
                        {food}
                        <button
                          onClick={() => handleExcludedFoodToggle(food)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Режим харчування</h3>
              <p className="text-muted-foreground">Скільки разів на день ви хочете їсти?</p>
            </div>
            
            <div className="space-y-4">
              {MEALS_PER_DAY.map((option) => (
                <Card
                  key={option.value}
                  className={`p-4 cursor-pointer transition-all ${
                    preferences.mealsPerDay === option.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setPreferences(prev => ({ ...prev, mealsPerDay: option.value as any }))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {preferences.mealsPerDay === option.value && (
                      <Badge variant="default">Обрано</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Налаштування приготування</h3>
              <p className="text-muted-foreground">Оберіть ваші переваги щодо часу та складності</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Час на приготування</Label>
                <div className="grid grid-cols-3 gap-3">
                  {COOKING_TIMES.map((time) => (
                    <Card
                      key={time.value}
                      className={`p-3 cursor-pointer transition-all text-center ${
                        preferences.cookingTime === time.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setPreferences(prev => ({ ...prev, cookingTime: time.value as any }))}
                    >
                      <div className="p-2 bg-primary/10 rounded-lg mx-auto mb-2 w-fit">
                        {React.createElement(getIconComponent(time.icon), { className: "w-5 h-5 text-primary" })}
                      </div>
                      <h4 className="font-semibold text-sm">{time.label}</h4>
                      <p className="text-xs text-muted-foreground">{time.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">Рівень кулінарних навичок</Label>
                <Select
                  value={preferences.cookingSkill}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, cookingSkill: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть рівень" />
                  </SelectTrigger>
                  <SelectContent>
                    {COOKING_SKILLS.map((skill) => (
                      <SelectItem key={skill.value} value={skill.value}>
                        <div>
                          <div className="font-medium">{skill.label}</div>
                          <div className="text-sm text-muted-foreground">{skill.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">Бюджет на харчування</Label>
                <div className="grid grid-cols-3 gap-3">
                  {BUDGETS.map((budget) => (
                    <Card
                      key={budget.value}
                      className={`p-3 cursor-pointer transition-all text-center ${
                        preferences.budget === budget.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setPreferences(prev => ({ ...prev, budget: budget.value as any }))}
                    >
                      <div className="p-2 bg-primary/10 rounded-lg mx-auto mb-2 w-fit">
                        {React.createElement(getIconComponent(budget.icon), { className: "w-5 h-5 text-primary" })}
                      </div>
                      <h4 className="font-semibold text-sm">{budget.label}</h4>
                      <p className="text-xs text-muted-foreground">{budget.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Налаштування плану харчування</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Крок {currentStep} з {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Content */}
        <div className="py-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          
          <Button
            onClick={handleNext}
            className="gap-2"
          >
            {currentStep === totalSteps ? "Завершити" : "Далі"}
            {currentStep < totalSteps && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
