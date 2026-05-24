import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Sparkles, 
  Clock, 
  Users, 
  ChefHat, 
  Target, 
  Flame, 
  Loader2, 
  Copy, 
  Heart,
  Star,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { getGeminiService, RecipeRequest, GeneratedRecipe } from "@/lib/gemini-ai";
import { useSmartFridge } from "@/hooks/useSmartFridge";
import { useAuth } from "@/hooks/useAuth";

interface AIRecipeGeneratorProps {
  onRecipeGenerated?: (recipe: GeneratedRecipe) => void;
  onAddToFavorites?: (recipe: GeneratedRecipe) => void;
}

export function AIRecipeGenerator({ onRecipeGenerated, onAddToFavorites }: AIRecipeGeneratorProps) {
  const { products } = useSmartFridge();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Form state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [targetCalories, setTargetCalories] = useState<number>(400);
  const [cookingTime, setCookingTime] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string>("");

  // Available ingredients from fridge
  const availableIngredients = products
    .filter(p => !p.isInPantry)
    .map(p => p.name);

  const dietaryOptions = [
    "Вегетарианство",
    "Веганство", 
    "Кето",
    "Палео",
    "Средиземноморская",
    "Без глютена",
    "Без лактозы",
    "Низкоуглеводная",
    "Высокобелковая"
  ];

  const allergyOptions = [
    "Орехи",
    "Молочные продукты",
    "Яйца",
    "Рыба",
    "Морепродукты",
    "Соя",
    "Глютен",
    "Кунжут"
  ];

  const cuisineOptions = [
    "Украинская",
    "Итальянская",
    "Азиатская",
    "Мексиканская",
    "Средиземноморская",
    "Индийская",
    "Французская",
    "Американская"
  ];

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleAddCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      setSelectedIngredients(prev => [...prev, customIngredient.trim()]);
      setCustomIngredient("");
    }
  };

  const handleDietaryToggle = (preference: string) => {
    setDietaryPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleAllergyToggle = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      toast.error("Выберите хотя бы один ингредиент");
      return;
    }

    setIsGenerating(true);
    try {
      const geminiService = getGeminiService();
      
      const request: RecipeRequest = {
        ingredients: selectedIngredients,
        dietaryPreferences,
        allergies,
        mealType,
        targetCalories,
        cookingTime,
        difficulty,
        cuisine: cuisine || undefined
      };

      const recipe = await geminiService.generateRecipe(request);
      setGeneratedRecipe(recipe);
      onRecipeGenerated?.(recipe);
      toast.success("Рецепт успешно сгенерирован!");
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast.error("Ошибка при генерации рецепта. Попробуйте еще раз.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyRecipe = () => {
    if (!generatedRecipe) return;
    
    const recipeText = `
${generatedRecipe.title}

${generatedRecipe.description}

Ингредиенты:
${generatedRecipe.ingredients.map(ing => 
  `- ${ing.amount} ${ing.unit} ${ing.name}${ing.isAvailable ? ' (Є в наявності)' : ' (Потрібно купити)'}`
).join('\n')}

Инструкции:
${generatedRecipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Пищевая ценность (на порцию):
- Калории: ${generatedRecipe.nutrition.calories} ккал
- Белки: ${generatedRecipe.nutrition.protein}г
- Жиры: ${generatedRecipe.nutrition.fat}г
- Углеводы: ${generatedRecipe.nutrition.carbs}г

Время приготовления: ${generatedRecipe.cookingTime} минут
Сложность: ${generatedRecipe.difficulty}
Порций: ${generatedRecipe.servings}
`;

    navigator.clipboard.writeText(recipeText);
    toast.success("Рецепт скопирован в буфер обмена!");
  };

  const addToFavorites = () => {
    if (generatedRecipe) {
      onAddToFavorites?.(generatedRecipe);
      toast.success("Рецепт добавлен в избранное!");
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Recipe Generator Card */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900">AI Генератор Рецептов</h3>
            <p className="text-sm text-purple-700">
              Создавайте уникальные рецепты на основе ваших ингредиентов
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Доступные ингредиенты</Label>
            <div className="text-xs text-muted-foreground mb-2">
              {availableIngredients.length} продуктов в холодильнике
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {availableIngredients.map(ingredient => (
                <Button
                  key={ingredient}
                  variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleIngredientToggle(ingredient)}
                  className="w-full justify-start text-xs"
                >
                  {ingredient}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Добавить ингредиент</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Введите название ингредиента"
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomIngredient()}
                className="text-sm"
              />
              <Button size="sm" onClick={handleAddCustomIngredient}>
                <CheckCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Тип приема пищи</Label>
            <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Завтрак</SelectItem>
                <SelectItem value="lunch">Обед</SelectItem>
                <SelectItem value="dinner">Ужин</SelectItem>
                <SelectItem value="snack">Перекус</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Калории</Label>
            <Input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Время (мин)</Label>
            <Input
              type="number"
              value={cookingTime}
              onChange={(e) => setCookingTime(Number(e.target.value))}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Сложность</Label>
            <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Легко</SelectItem>
                <SelectItem value="medium">Средне</SelectItem>
                <SelectItem value="hard">Сложно</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Диетические предпочтения</Label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(option => (
                <Badge
                  key={option}
                  variant={dietaryPreferences.includes(option) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleDietaryToggle(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Аллергии</Label>
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map(option => (
                <Badge
                  key={option}
                  variant={allergies.includes(option) ? "destructive" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleAllergyToggle(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Кухня</Label>
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите кухню" />
              </SelectTrigger>
              <SelectContent>
                {cuisineOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={generateRecipe}
          disabled={isGenerating || selectedIngredients.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Генерируем рецепт...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Создать рецепт с AI
            </>
          )}
        </Button>
      </Card>

      {/* Generated Recipe Display */}
      {generatedRecipe && (
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">{generatedRecipe.title}</h3>
                <p className="text-sm text-green-700">{generatedRecipe.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyRecipe}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={addToFavorites}>
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Ингредиенты
              </h4>
              <div className="space-y-2">
                {generatedRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <span className="text-sm">
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </span>
                    {ingredient.isAvailable ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition & Info */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Пищевая ценность
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 bg-white rounded-lg text-center">
                  <div className="text-lg font-bold text-orange-600">{generatedRecipe.nutrition.calories}</div>
                  <div className="text-xs text-muted-foreground">ккал</div>
                </div>
                <div className="p-2 bg-white rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-600">{generatedRecipe.nutrition.protein}г</div>
                  <div className="text-xs text-muted-foreground">белки</div>
                </div>
                <div className="p-2 bg-white rounded-lg text-center">
                  <div className="text-lg font-bold text-yellow-600">{generatedRecipe.nutrition.fat}г</div>
                  <div className="text-xs text-muted-foreground">жиры</div>
                </div>
                <div className="p-2 bg-white rounded-lg text-center">
                  <div className="text-lg font-bold text-green-600">{generatedRecipe.nutrition.carbs}г</div>
                  <div className="text-xs text-muted-foreground">углеводы</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Время: {generatedRecipe.cookingTime} мин</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Порций: {generatedRecipe.servings}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Сложность: {generatedRecipe.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              Инструкции
            </h4>
            <div className="space-y-3">
              {generatedRecipe.instructions.map((step, index) => (
                <div key={index} className="flex gap-3 p-3 bg-white rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips and Substitutions */}
          {(generatedRecipe.tips?.length || generatedRecipe.substitutions?.length) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedRecipe.tips?.length && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Советы
                  </h4>
                  <div className="space-y-2">
                    {generatedRecipe.tips.map((tip, index) => (
                      <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedRecipe.substitutions?.length && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Замены
                  </h4>
                  <div className="space-y-2">
                    {generatedRecipe.substitutions.map((sub, index) => (
                      <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <div className="font-medium">{sub.original} → {sub.substitute}</div>
                        <div className="text-muted-foreground">{sub.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

