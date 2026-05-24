import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp,
  Settings,
  ChefHat,
  BookOpen,
  Plus
} from "lucide-react";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { MealPlanSetupWizard } from "@/components/MealPlanSetupWizard";
import { MealPlanGenerator } from "@/components/MealPlanGenerator";
import { WeeklyPlanDashboard } from "@/components/WeeklyPlanDashboard";
import { DailyPlanInterface } from "@/components/DailyPlanInterface";
import { MealPlanTemplates } from "@/components/MealPlanTemplates";
import { MealPlanPreferences, MealTemplate } from "@/lib/meal-planner";

export default function IntelligentMealPlanner() {
  const {
    settings,
    weeklyPlan,
    todayPlan,
    isSetupComplete,
    generating,
    initializeSettings,
    generateMealPlan,
    markMealCompleted,
    adherence
  } = useMealPlanner();


  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleSetupComplete = (preferences: MealPlanPreferences) => {
    initializeSettings(preferences);
    setShowSetupWizard(false);
    setShowGenerator(true);
  };

  const handleGeneratePlan = (useFridgeProducts: boolean) => {
    generateMealPlan(useFridgeProducts);
  };

  const handleSelectTemplate = (template: MealTemplate) => {
    // Convert template to preferences and initialize settings
    const preferences: MealPlanPreferences = {
      goal: template.category === "weight_loss" ? "weight_loss" : 
            template.category === "muscle_gain" ? "weight_gain" : "maintenance",
      dietType: template.dietType,
      excludedFoods: [],
      mealsPerDay: template.mealsPerDay,
      cookingTime: template.cookingTime,
      cookingSkill: "intermediate",
      budget: "medium"
    };
    
    initializeSettings(preferences);
    setShowTemplates(false);
    setShowGenerator(true);
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setActiveTab("daily");
  };

  const handleMealCompleted = (mealId: string) => {
    if (selectedDate) {
      markMealCompleted(mealId, selectedDate);
    }
  };

  const handleMealSwap = (mealId: string, newRecipe: any) => {
    // TODO: Implement meal swapping logic
    console.log("Swapping meal:", mealId, "with recipe:", newRecipe);
  };

  const handleRegenerateDay = () => {
    // TODO: Implement day regeneration logic
    console.log("Regenerating day:", selectedDate);
  };

  const handlePreviousDay = () => {
    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      currentDate.setDate(currentDate.getDate() - 1);
      setSelectedDate(currentDate.toISOString().split('T')[0]);
    }
  };

  const handleNextDay = () => {
    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      currentDate.setDate(currentDate.getDate() + 1);
      setSelectedDate(currentDate.toISOString().split('T')[0]);
    }
  };

  const getSelectedDayPlan = () => {
    if (!selectedDate || !weeklyPlan) return null;
    return weeklyPlan.days.find(day => day.date === selectedDate) || null;
  };

  const hasPreviousDay = selectedDate ? new Date(selectedDate) > new Date(weeklyPlan?.weekStart || '') : false;
  const hasNextDay = selectedDate ? new Date(selectedDate) < new Date((() => {
    const weekStart = new Date(weeklyPlan?.weekStart || '');
    weekStart.setDate(weekStart.getDate() + 6);
    return weekStart.toISOString().split('T')[0];
  })()) : false;

  // If setup is not complete, show setup wizard
  if (!isSetupComplete) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <MobileHeader />
          <main className="flex-1 min-w-0 p-3 pb-24 md:pb-8 md:p-8 max-w-6xl mx-auto w-full">
        {/* Header with buttons always visible */}
        <div className="space-y-4 mb-6 md:mb-8">
          {/* Title Section */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">План Харчування</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Badge variant="outline" className="gap-1 text-xs">
                <TrendingUp className="w-3 h-3" />
                0% виконання
              </Badge>
              <Badge variant="secondary" className="text-xs">
                2000 ккал/день
              </Badge>
            </div>
          </div>
          
          {/* Buttons Section */}
          <div className="flex flex-col xs:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
              className="flex-1 xs:flex-none gap-2 h-10 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Пропозиції
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowSetupWizard(true)}
              className="flex-1 xs:flex-none gap-2 h-10 text-sm"
            >
              <Settings className="w-4 h-4" />
              Налаштування
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Інтелектуальний Планировщик Питания</h2>
            <p className="text-muted-foreground text-lg">
              Створіть персоналізований план харчування, який відповідає вашим цілям та уподобанням
            </p>
          </div>

          <Card className="p-8 mb-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Почнемо з налаштувань</h3>
                <p className="text-muted-foreground">
                  Відповідь на кілька питань допоможе створити ідеальний план харчування
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Ваші цілі</h4>
                  <p className="text-sm text-muted-foreground">Схуднення, підтримка або набір маси</p>
                </div>
                <div className="text-center p-4">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Дієта</h4>
                  <p className="text-sm text-muted-foreground">Тип харчування та обмеження</p>
                </div>
                <div className="text-center p-4">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Режим</h4>
                  <p className="text-sm text-muted-foreground">Кількість прийомів їжі та час</p>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={() => setShowSetupWizard(true)}
                className="w-full gap-2"
              >
                <Settings className="w-5 h-5" />
                Почати налаштування
              </Button>
            </div>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p>Після налаштування ви зможете:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Генерувати персоналізовані плани харчування</li>
              <li>Використовувати продукти з вашого холодильника</li>
              <li>Отримувати автоматичні списки покупок</li>
              <li>Відстежувати прогрес та виконання плану</li>
            </ul>
          </div>
        </div>

        <MealPlanSetupWizard
          open={showSetupWizard}
          onOpenChange={setShowSetupWizard}
          onComplete={handleSetupComplete}
        />

        <MealPlanTemplates
          open={showTemplates}
          onOpenChange={setShowTemplates}
          onSelectTemplate={handleSelectTemplate}
        />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    );
  }

  // Main interface
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="flex-1 min-w-0 p-3 pb-24 md:pb-8 md:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="space-y-4 mb-6 md:mb-8">
            {/* Title Section */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">План Харчування</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <Badge variant="outline" className="gap-1 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  {adherence}% виконання
                </Badge>
                {settings && (
                  <Badge variant="secondary" className="text-xs">
                    {settings.targetCalories} ккал/день
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Buttons Section */}
            <div className="flex flex-col xs:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGenerator(true)}
                disabled={generating}
                className="flex-1 xs:flex-none gap-2 h-10 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {generating ? "Генерація..." : "Згенерувати план"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowTemplates(true)}
                className="flex-1 xs:flex-none gap-2 h-10 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Пропозиції
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSetupWizard(true)}
                className="flex-1 xs:flex-none gap-2 h-10 text-sm"
              >
                <Settings className="w-4 h-4" />
                Налаштування
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly" className="gap-2">
                <Calendar className="w-4 h-4" />
                Тижневий план
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-2">
                <Clock className="w-4 h-4" />
                Денний план
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              {weeklyPlan ? (
                <WeeklyPlanDashboard
                  weeklyPlan={weeklyPlan}
                  onDayClick={handleDayClick}
                />
              ) : (
                <Card className="p-8 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">План не створено</h3>
                  <p className="text-muted-foreground mb-4">
                    Створіть свій перший план харчування, щоб почати відстежувати прийоми їжі
                  </p>
                  <Button onClick={() => setShowGenerator(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Створити план
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="daily">
              {weeklyPlan ? (
                selectedDate ? (
                  <DailyPlanInterface
                    dailyPlan={getSelectedDayPlan()!}
                    onMealCompleted={handleMealCompleted}
                    onMealSwap={handleMealSwap}
                    onRegenerateDay={handleRegenerateDay}
                    onPreviousDay={handlePreviousDay}
                    onNextDay={handleNextDay}
                    hasPreviousDay={hasPreviousDay}
                    hasNextDay={hasNextDay}
                  />
                ) : (
                  <Card className="p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Оберіть день</h3>
                    <p className="text-muted-foreground mb-4">
                      Натисніть на день у тижневому плані, щоб переглянути детальний план
                    </p>
                    <Button onClick={() => setActiveTab("weekly")}>
                      Перейти до тижневого плану
                    </Button>
                  </Card>
                )
              ) : (
                <Card className="p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Спочатку створіть план</h3>
                  <p className="text-muted-foreground mb-4">
                    Для перегляду денного плану потрібно спочатку створити тижневий план
                  </p>
                  <Button onClick={() => setShowGenerator(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Створити план
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Modals */}
          <MealPlanSetupWizard
            open={showSetupWizard}
            onOpenChange={setShowSetupWizard}
            onComplete={handleSetupComplete}
          />

          <MealPlanGenerator
            open={showGenerator}
            onOpenChange={setShowGenerator}
            settings={settings}
            onGenerate={handleGeneratePlan}
            generating={generating}
          />

          <MealPlanTemplates
            open={showTemplates}
            onOpenChange={setShowTemplates}
            onSelectTemplate={handleSelectTemplate}
          />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
