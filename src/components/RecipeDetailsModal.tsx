import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Utensils, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="w-full h-48 sm:h-64 relative">
            <img 
              src={recipe.image || "https://images.unsplash.com/photo-1490818387583-1b5f2223d20d?auto=format&fit=crop&w=800&q=80"} 
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1490818387583-1b5f2223d20d?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
              <div className="text-white">
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
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Nutrition & Ingredients */}
              <div className="md:col-span-1 space-y-6">
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
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary/70 shrink-0" />
                          <span className="font-medium">{ing.name}</span>
                        </div>
                        <span className="text-muted-foreground whitespace-nowrap ml-2">
                          {ing.amount} {ing.unit}
                        </span>
                      </li>
                    ))}
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
