import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MealCalendar } from "@/components/MealCalendar";
import { DailyProgress } from "@/components/DailyProgress";
import { QuickActions } from "@/components/QuickActions";
import { MealsSection } from "@/components/MealsSection";
import { ActivityWater } from "@/components/ActivityWater";
import { MotivationBanner } from "@/components/MotivationBanner";
import { AddMealModal } from "@/components/AddMealModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/useAuth";
import { useDaily } from "@/hooks/useDaily";
import { useWater } from "@/hooks/useWater";
import { useWeight } from "@/hooks/useWeight";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const { totals, streakDays } = useDaily();
  const { todayWater, addWater } = useWater();
  const { addWeight } = useWeight();
  const { t } = useI18n();
  
  const [addOpen, setAddOpen] = useState(false);
  const [presetMealType, setPresetMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack" | undefined>(undefined);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState("0.25");
  const [weightValue, setWeightValue] = useState("");

  const targetCalories = user?.targets?.calories || 2000;
  const progress = targetCalories ? (totals.calories / targetCalories) * 100 : 0;
  
  // Обробники для нових компонентів
  const handleAddMeal = (mealType?: "breakfast" | "lunch" | "dinner" | "snack") => {
    setPresetMealType(mealType);
    setAddOpen(true);
  };

  const handleAddFood = () => {
    setPresetMealType(undefined);
    setAddOpen(true);
  };

  const handleAddWater = () => {
    setWaterModalOpen(true);
  };

  const handleAddWeight = () => {
    setWeightModalOpen(true);
  };

  const handleWaterSubmit = () => {
    const amount = parseFloat(waterAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Введіть правильну кількість води");
      return;
    }
    addWater(amount);
    toast.success(`Додано ${amount}л води`);
    setWaterModalOpen(false);
    setWaterAmount("0.25");
  };

  const handleWeightSubmit = () => {
    const weight = parseFloat(weightValue);
    if (isNaN(weight) || weight <= 0 || weight > 500) {
      toast.error("Введіть правильну вагу (1-500 кг)");
      return;
    }
    addWeight(weight);
    toast.success(`Додано вагу: ${weight} кг`);
    setWeightModalOpen(false);
    setWeightValue("");
  };

  const handleAIAction = (action: string) => {
    console.log("AI Action:", action);
    // Тут можна додати логіку для різних дій AI
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="flex-1 min-w-0 p-4 pb-20 md:pb-8 md:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <DashboardHeader />

          {/* Main Content */}
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column (Main Focus) */}
            <div className="flex-1 w-full flex flex-col gap-6">
              
              {/* Motivation Banner */}
              <MotivationBanner 
                streakDays={streakDays}
                todayProgress={progress}
              />
              
              {/* Daily Progress */}
              <DailyProgress />
              
              {/* Mobile-only Quick Actions */}
              <div className="block lg:hidden w-full">
                <QuickActions 
                  onAddFood={handleAddFood}
                  onAddWater={handleAddWater}
                  onAddWeight={handleAddWeight}
                />
              </div>

              {/* Activity & Water */}
              <ActivityWater />
              
              {/* Mobile-only AI Insights */}
              <div className="block lg:hidden w-full">
                <AIInsightsCard 
                  userData={user}
                  onActionClick={handleAIAction}
                />
              </div>
              
              {/* Meals Section */}
              <MealsSection onAddMeal={handleAddMeal} />
              
              {/* Mobile-only Meal Calendar */}
              <div className="block lg:hidden w-full">
                <MealCalendar />
              </div>
              
            </div>

            {/* Right Column (Sidebar) - Desktop Only */}
            <div className="hidden lg:flex w-full lg:w-[360px] flex-col gap-6 sticky top-24">
              <QuickActions 
                onAddFood={handleAddFood}
                onAddWater={handleAddWater}
                onAddWeight={handleAddWeight}
              />
              
              <AIInsightsCard 
                userData={user}
                onActionClick={handleAIAction}
              />
              
              <MealCalendar />
            </div>
            
          </div>
        </main>
        
        <AddMealModal 
          open={addOpen} 
          onOpenChange={(open) => {
            setAddOpen(open);
            if (!open) setPresetMealType(undefined);
          }} 
          presetMealType={presetMealType}
        />
        
        {/* Модальне вікно для додавання води */}
        <Dialog open={waterModalOpen} onOpenChange={setWaterModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Додати воду</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="water-amount">Кількість (літри)</Label>
                <Input
                  id="water-amount"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(e.target.value)}
                  placeholder="0.25"
                />
                <p className="text-xs text-muted-foreground">
                  Швидкі опції: 
                  <Button variant="ghost" size="sm" className="h-6 px-2 mx-1" onClick={() => setWaterAmount("0.25")}>250мл</Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 mx-1" onClick={() => setWaterAmount("0.5")}>500мл</Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 mx-1" onClick={() => setWaterAmount("1.0")}>1л</Button>
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleWaterSubmit} className="flex-1">Додати</Button>
                <Button variant="outline" onClick={() => setWaterModalOpen(false)}>Скасувати</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Модальне вікно для додавання ваги */}
        <Dialog open={weightModalOpen} onOpenChange={setWeightModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Додати вагу</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight-value">Вага (кг)</Label>
                <Input
                  id="weight-value"
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="70.5"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleWeightSubmit} className="flex-1">Додати</Button>
                <Button variant="outline" onClick={() => setWeightModalOpen(false)}>Скасувати</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Index;


