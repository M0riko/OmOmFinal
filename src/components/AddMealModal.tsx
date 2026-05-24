import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Clock, Users, X } from "lucide-react";
import { apiService, Recipe } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetMealType?: "breakfast" | "lunch" | "dinner" | "snack";
  onAddMeal?: (recipe: Recipe) => void;
  onAddManual?: (meal: { name: string; calories: number; protein: number; fat: number; carbs: number }) => void;
}

export function AddMealModal({ 
  open, 
  onOpenChange, 
  presetMealType,
  onAddMeal,
  onAddManual 
}: AddMealModalProps) {
  const mealType = presetMealType || "lunch";
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const mealTypeLabels = {
    breakfast: "Сніданок",
    lunch: "Обід",
    dinner: "Вечеря",
    snack: "Перекус"
  };

  const searchRecipes = async () => {
    if (!searchQuery.trim()) {
      toast.warning("Введіть назву страви");
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.searchRecipes(searchQuery, { number: 10 });
      setRecipes(result.recipes);
      if (result.recipes.length === 0) {
        toast.info("Рецептів не знайдено");
      }
    } catch (error) {
      console.error("Error searching recipes:", error);
      toast.error("Помилка пошуку рецептів");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = (recipe: Recipe) => {
    onAddMeal(recipe);
    onOpenChange(false);
    setSearchQuery("");
    setRecipes([]);
    toast.success(`Страву "${recipe.title}" додано до ${mealTypeLabels[mealType]}`);
  };

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setRecipes([]);
      setShowManualForm(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Додати страву до {mealTypeLabels[mealType]}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Знайдіть рецепт через пошук або додайте вручну
          </DialogDescription>
        </DialogHeader>

        {!showManualForm ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Пошук рецептів (наприклад: куряча грудка, салат, овсянка)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchRecipes()}
                className="flex-1 bg-background/50 border-input focus:border-primary/50 text-foreground"
              />
              <Button 
                onClick={searchRecipes} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowManualForm(true)}
                className="border-border hover:bg-muted"
              >
                <Plus className="w-4 h-4 mr-2" />
                Вручну
              </Button>
            </div>

            {/* Results */}
            {recipes.length > 0 && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {recipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="p-4 bg-card/30 backdrop-blur-sm border border-border hover:border-primary/40 transition-all cursor-pointer shadow-none"
                    onClick={() => handleAddRecipe(recipe)}
                  >
                    <div className="flex gap-4">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-2 line-clamp-2">{recipe.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.readyInMinutes} хв</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{recipe.servings} порцій</span>
                          </div>
                          {recipe.nutrition?.nutrients && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(recipe.nutrition.nutrients.find((n: any) => n.name === "Calories")?.amount || 0)} ккал
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddRecipe(recipe);
                        }}
                        className="flex-shrink-0 bg-primary hover:bg-primary/90"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && recipes.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Натисніть "Пошук" для початку</p>
              </div>
            )}
          </div>
        ) : (
          <ManualMealForm
            mealType={mealType}
            onSave={(meal) => {
              if (onAddManual) {
                onAddManual(meal);
              }
              setShowManualForm(false);
            }}
            onCancel={() => setShowManualForm(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ManualMealForm({ mealType, onSave, onCancel }: { mealType: string; onSave: (meal: any) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");

  return (
    <div className="space-y-4">
      <Input
        placeholder="Назва страви"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-background/50 border-input"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          placeholder="Калорії"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="bg-background/50 border-input"
        />
        <Input
          type="number"
          placeholder="Білки (г)"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          className="bg-background/50 border-input"
        />
        <Input
          type="number"
          placeholder="Жири (г)"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          className="bg-background/50 border-input"
        />
        <Input
          type="number"
          placeholder="Вуглеводи (г)"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          className="bg-background/50 border-input"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave({ name, calories, protein, fat, carbs })}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Додати
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-input"
        >
          Скасувати
        </Button>
      </div>
    </div>
  );
}
