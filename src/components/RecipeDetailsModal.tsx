import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Utensils, CheckCircle, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useShoppingList } from "@/hooks/useShoppingList";
import { toast } from "sonner";
import { useState } from "react";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  isAvailable?: boolean;
}

interface RecipeNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface RecipeDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: {
    title: string;
    image?: string;
    readyInMinutes: number;
    servings: number;
    nutrition: RecipeNutrition;
    ingredients: Ingredient[];
    instructions: string[];
  } | null;
}

export function RecipeDetailsModal({ isOpen, onClose, recipe }: RecipeDetailsProps) {
  const { addItem } = useShoppingList();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  if (!recipe) return null;

  const handleAddAllToShoppingList = async () => {
    try {
      let count = 0;
      for (const ingredient of recipe.ingredients) {
        if (!addedItems.has(ingredient.name)) {
          await addItem({
            name: ingredient.name,
            quantity: ingredient.amount || 1,
            unit: ingredient.unit || 'шт',
            category: "recipes",
            priority: "medium",
            isAutoAdded: false,
            source: "recipe",
            notes: `${ingredient.amount} ${ingredient.unit}`
          });
          count++;
        }
      }
      
      if (count > 0) {
        const newAdded = new Set(addedItems);
        recipe.ingredients.forEach(i => newAdded.add(i.name));
        setAddedItems(newAdded);
        toast.success(`Додано ${count} інгредієнтів до списку покупок!`);
      } else {
        toast.info("Всі інгредієнти вже додані");
      }
    } catch (error) {
      toast.error("Не вдалося додати інгредієнти");
    }
  };

  const dynamicImage = recipe.image && recipe.image !== "https://images.unsplash.com/photo-1490818387583-1b5f2223d20d?auto=format&fit=crop&w=800&q=80" 
    ? recipe.image 
    : `https://loremflickr.com/800/600/food,dish?random=${encodeURIComponent(recipe.title)}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full h-48 sm:h-64 relative flex-shrink-0">
            <img 
              src={dynamicImage} 
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1490818387583-1b5f2223d20d?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
              <div className="text-white w-full flex justify-between items-end">
                <div>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold mb-2 text-white">
                    {recipe.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {recipe.readyInMinutes} хвилин
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-4 h-4" />
                    {recipe.servings} порцій
                  </span>
                  <Badge className="bg-orange-500 hover:bg-orange-600 border-none text-white ml-2">
                    {recipe.nutrition.calories} ккал
                  </Badge>
                </div>
                </div>
                <Button 
                  onClick={handleAddAllToShoppingList}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 hidden sm:flex"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Додати всі інгредієнти
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Nutrition & Ingredients */}
              <div className="md:col-span-1 space-y-6">
                <Button 
                  onClick={handleAddAllToShoppingList}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 sm:hidden mb-4"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Додати інгредієнти
                </Button>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Макронутрієнти</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded-lg text-center border border-red-100 dark:border-red-900/50">
                      <div className="text-red-600 dark:text-red-400 font-bold">{recipe.nutrition.protein}г</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Білки</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded-lg text-center border border-yellow-100 dark:border-yellow-900/50">
                      <div className="text-yellow-600 dark:text-yellow-400 font-bold">{recipe.nutrition.fat}г</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Жири</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded-lg text-center border border-green-100 dark:border-green-900/50">
                      <div className="text-green-600 dark:text-green-400 font-bold">{recipe.nutrition.carbs}г</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Вуглеводи</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Інгредієнти</h3>
                  <ul className="space-y-2.5">
                    {recipe.ingredients.map((ing, idx) => {
                      const isAdded = addedItems.has(ing.name);
                      return (
                        <li key={idx} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors group">
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 shrink-0 ${isAdded ? 'text-green-500' : 'text-primary/70'}`} />
                            <span className={`font-medium ${isAdded ? 'line-through text-muted-foreground' : ''}`}>{ing.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground whitespace-nowrap ml-2">
                              {ing.amount} {ing.unit}
                            </span>
                            {!isAdded && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={async () => {
                                  try {
                                    await addItem({
                                      name: ing.name,
                                      quantity: ing.amount || 1,
                                      unit: ing.unit || 'шт',
                                      category: "recipes",
                                      priority: "medium",
                                      isAutoAdded: false,
                                      source: "recipe",
                                      notes: `${ing.amount} ${ing.unit}`
                                    });
                                    setAddedItems(prev => new Set(prev).add(ing.name));
                                    toast.success(`Додано: ${ing.name}`);
                                  } catch (e) {
                                    toast.error("Помилка");
                                  }
                                }}
                              >
                                <ShoppingCart className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Right Column: Instructions */}
              <div className="md:col-span-2">
                <h3 className="font-semibold text-lg mb-4">Як готувати</h3>
                {recipe.instructions.length > 0 ? (
                  <ol className="space-y-4">
                    {recipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {idx + 1}
                        </div>
                        <p className="text-sm leading-relaxed pt-1 text-foreground/90">{step}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground italic text-sm">Рецепт не потребує складної інструкції, просто змішайте всі інгредієнти.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
