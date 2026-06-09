import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus, X } from "lucide-react";
import { chatWithAICoach } from "@/lib/openai-ai";
import { toast } from "sonner";
import { Recipe } from "@/lib/api";

interface AIPlanGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
  onPlanGenerated: (plan: DailyMealPlan) => void;
}

interface DailyMealPlan {
  breakfast: Recipe[];
  lunch: Recipe[];
  dinner: Recipe[];
  snack: Recipe[];
}

export function AIPlanGenerator({
  open,
  onOpenChange,
  targetCalories = 2000,
  targetProtein = 120,
  targetFat = 65,
  targetCarbs = 250,
  onPlanGenerated
}: AIPlanGeneratorProps) {
  const [goal, setGoal] = useState("maintenance");
  const [restrictions, setRestrictions] = useState("");
  const [customCalories, setCustomCalories] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<DailyMealPlan | null>(null);

  const goalOptions = [
    { value: "weight_loss", label: "Схуднути" },
    { value: "weight_gain", label: "Набрати вагу" },
    { value: "maintenance", label: "Підтримувати вагу" },
    { value: "muscle_gain", label: "Набрати м'язову масу" }
  ];

  const generatePlan = async () => {
    setLoading(true);
    try {
      const calories = customCalories ? parseInt(customCalories) : targetCalories;
      
      const prompt = `Сформуй збалансований план харчування на 1 день українською мовою.

Ціль: ${goalOptions.find(o => o.value === goal)?.label || goal}.
Обмеження: ${restrictions || "немає"}.
Загальна калорійність: ${calories} ккал.
Цільові макронутрієнти: ${targetProtein}г білків, ${targetFat}г жирів, ${targetCarbs}г вуглеводів.

Потрібно 4 прийоми їжі: сніданок (~${Math.round(calories * 0.30)} ккал), обід (~${Math.round(calories * 0.40)} ккал), вечеря (~${Math.round(calories * 0.25)} ккал), перекус (~${Math.round(calories * 0.05)} ккал).

Відповідь ТІЛЬКИ у форматі JSON без markdown:
{
  "breakfast": {"name": "Назва страви", "calories": 320, "protein": 12, "fat": 8, "carbs": 45, "description": "Короткий опис"},
  "lunch": {...},
  "dinner": {...},
  "snack": {...}
}`;

      const aiResponse = await chatWithAICoach(prompt);
      
      // Парсимо JSON
      let jsonText = aiResponse;
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').trim();
      }

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const planData = JSON.parse(jsonMatch[0]);
        
        // Конвертуємо в формат DailyMealPlan (з Recipe об'єктами)
        const convertedPlan: DailyMealPlan = {
          breakfast: planData.breakfast ? [convertAIMealToRecipe(planData.breakfast, "breakfast")] : [],
          lunch: planData.lunch ? [convertAIMealToRecipe(planData.lunch, "lunch")] : [],
          dinner: planData.dinner ? [convertAIMealToRecipe(planData.dinner, "dinner")] : [],
          snack: planData.snack ? [convertAIMealToRecipe(planData.snack, "snack")] : []
        };

        setGeneratedPlan(convertedPlan);
        toast.success("План згенеровано з AI!");
      } else {
        throw new Error("Не вдалося розпарсити відповідь AI");
      }
    } catch (error: any) {
      console.error("Error generating plan:", error);
      
      // Перевіряємо статус код помилки
      const statusCode = error?.status || 
                        error?.statusCode || 
                        error?.response?.status || 
                        error?.response?.statusCode ||
                        (error?.message?.includes('429') ? 429 : null) ||
                        (error?.message?.includes('503') ? 503 : null);

      if (statusCode === 429) {
        toast.error("Занадто багато запитів до AI. Зачекайте кілька секунд і спробуйте ще раз.");
      } else if (statusCode === 503) {
        toast.error("AI сервіс тимчасово недоступний. Спробуйте через хвилину.");
      } else {
        toast.error(error.message || "Помилка генерації плану. Спробуйте ще раз або додайте страви вручну.");
      }
    } finally {
      setLoading(false);
    }
  };

  const convertAIMealToRecipe = (meal: any, mealType: string): Recipe => {
    return {
      id: Math.random(),
      title: meal.name || "Страва",
      image: `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80`,
      readyInMinutes: 30,
      servings: 1,
      summary: meal.description || "",
      nutrition: {
        nutrients: [
          { name: "Calories", amount: meal.calories || 0 },
          { name: "Protein", amount: meal.protein || 0 },
          { name: "Fat", amount: meal.fat || 0 },
          { name: "Carbohydrates", amount: meal.carbs || 0 }
        ]
      },
      extendedIngredients: []
    } as Recipe;
  };

  const handleAddToPlan = () => {
    if (generatedPlan) {
      onPlanGenerated(generatedPlan);
      onOpenChange(false);
      toast.success("План додано до вашого меню!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Генерація меню з AI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            AI створить персоналізований план харчування для вас
          </DialogDescription>
        </DialogHeader>

        {!generatedPlan ? (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Моя ціль</Label>
              <div className="grid grid-cols-2 gap-2">
                {goalOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={goal === option.value ? "default" : "outline"}
                    onClick={() => setGoal(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="restrictions" className="mb-2 block">Обмеження (через кому)</Label>
              <Input
                id="restrictions"
                placeholder="Наприклад: без глютену, без молочного, веган"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="calories" className="mb-2 block">
                Калорії (за замовчуванням: {targetCalories})
              </Label>
              <Input
                id="calories"
                type="number"
                placeholder={targetCalories.toString()}
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
              />
            </div>

            <Button
              onClick={generatePlan}
              disabled={loading}
              className="w-full h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Генерую меню...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Згенерувати меню
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Згенерований план</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGeneratedPlan(null)}
              >
                <X className="w-4 h-4 mr-1" />
                Згенерувати знову
              </Button>
            </div>

            {Object.entries(generatedPlan).map(([mealType, meals]) => {
              if (!meals || meals.length === 0) return null;
              const meal = meals[0];
              const mealLabels: Record<string, string> = {
                breakfast: "Сніданок",
                lunch: "Обід",
                dinner: "Вечеря",
                snack: "Перекус"
              };

              return (
                <Card key={mealType} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={meal.image}
                      alt={meal.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-2">{meal.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{meal.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(meal.nutrition?.nutrients?.find((n: any) => n.name === "Calories")?.amount || 0)} ккал
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Б: {Math.round(meal.nutrition?.nutrients?.find((n: any) => n.name === "Protein")?.amount || 0)}г
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Ж: {Math.round(meal.nutrition?.nutrients?.find((n: any) => n.name === "Fat")?.amount || 0)}г
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          В: {Math.round(meal.nutrition?.nutrients?.find((n: any) => n.name === "Carbohydrates")?.amount || 0)}г
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            <Button
              onClick={handleAddToPlan}
              className="w-full h-12 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Додати в мій план
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

