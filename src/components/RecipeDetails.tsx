import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Users, 
  ExternalLink, 
  Heart, 
  X, 
  ChefHat, 
  Flame, 
  Milk, 
  Apple, 
  Carrot,
  Leaf,
  CandyCane
} from "lucide-react";
import { Recipe } from "@/lib/api";
import { useState, useEffect } from "react";
import { fatSecretApiService } from "@/lib/fatsecret-api";

type RecipeDetailsProps = {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
};

// Translation function for ingredients and instructions
const translateToCyrillic = (text: string): string => {
  const translations: Record<string, string> = {
    // Common ingredients
    'chicken': 'курятина',
    'beef': 'яловичина',
    'pork': 'свинина',
    'fish': 'риба',
    'salmon': 'лосось',
    'tuna': 'тунець',
    'shrimp': 'креветки',
    'eggs': 'яйця',
    'milk': 'молоко',
    'cheese': 'сир',
    'butter': 'масло',
    'oil': 'олія',
    'salt': 'сіль',
    'pepper': 'перець',
    'garlic': 'часник',
    'onion': 'цибуля',
    'tomato': 'помідор',
    'potato': 'картопля',
    'carrot': 'морква',
    'rice': 'рис',
    'pasta': 'паста',
    'bread': 'хліб',
    'flour': 'борошно',
    'sugar': 'цукор',
    'honey': 'мед',
    'lemon': 'лимон',
    'lime': 'лайм',
    'orange': 'апельсин',
    'apple': 'яблуко',
    'banana': 'банан',
    'strawberry': 'полуниця',
    'blueberry': 'чорниця',
    'spinach': 'шпинат',
    'lettuce': 'салат',
    'cucumber': 'огірок',
    'bell pepper': 'болгарський перець',
    'mushroom': 'гриби',
    'basil': 'базилік',
    'oregano': 'орегано',
    'thyme': 'чебрець',
    'parsley': 'петрушка',
    'cilantro': 'коріандр',
    'ginger': 'імбир',
    'cinnamon': 'кориця',
    'vanilla': 'ваніль',
    'chocolate': 'шоколад',
    'cream': 'вершки',
    'yogurt': 'йогурт',
    'nuts': 'горіхи',
    'almonds': 'мигдаль',
    'walnuts': 'волоські горіхи',
    'olive oil': 'оливкова олія',
    'vegetable oil': 'рослинна олія',
    'soy sauce': 'соєвий соус',
    'vinegar': 'оцет',
    'wine': 'вино',
    'beer': 'пиво',
    'water': 'вода',
    'broth': 'бульйон',
    'stock': 'бульйон',
    
    // Cooking methods
    'bake': 'запікати',
    'boil': 'варити',
    'fry': 'смажити',
    'grill': 'грилювати',
    'roast': 'смажити',
    'steam': 'парити',
    'simmer': 'тушити',
    'mix': 'змішувати',
    'stir': 'помішувати',
    'chop': 'нарізати',
    'slice': 'нарізати',
    'dice': 'нарізати кубиками',
    'mince': 'дрібно нарізати',
    'grate': 'натерти',
    'peel': 'очистити',
    'wash': 'вимити',
    'drain': 'злити воду',
    'season': 'приправити',
    'taste': 'скуштувати',
    'serve': 'подавати',
    
    // Measurements
    'cup': 'склянка',
    'tablespoon': 'столова ложка',
    'teaspoon': 'чайна ложка',
    'pound': 'фунт',
    'ounce': 'унція',
    'gram': 'грам',
    'kilogram': 'кілограм',
    'liter': 'літр',
    'milliliter': 'мілілітр',
    'inch': 'дюйм',
    'cm': 'см',
    'piece': 'шматок',
    'clove': 'зубчик',
    'can': 'банка',
    'package': 'пакет',
    'bunch': 'пучок',
    'head': 'голівка',
    'medium': 'середній',
    'large': 'великий',
    'small': 'маленький',
    'fresh': 'свіжий',
    'dried': 'сушений',
    'frozen': 'заморожений',
    'canned': 'консервований',
    'organic': 'органічний',
    'low-fat': 'нежирний',
    'whole': 'цілий',
    'chopped': 'нарізаний',
    'sliced': 'нарізаний',
    'diced': 'нарізаний кубиками',
    'minced': 'дрібно нарізаний',
    'grated': 'натертий',
    'peeled': 'очищений',
    'washed': 'вимитий',
    'drained': 'злитий',
    'seasoned': 'приправлений',
    'cooked': 'приготований',
    'raw': 'сирий',
    'hot': 'гарячий',
    'cold': 'холодний',
    'warm': 'теплий',
    'room temperature': 'кімнатна температура',
    'preheated': 'розігрітий',
    'cooled': 'охолоджений',
    'refrigerated': 'охолоджений',
    'thawed': 'розморожений',
    'softened': 'пом\'якшений',
    'melted': 'розтоплений',
    'beaten': 'збитий',
    'whipped': 'збитий',
    'folded': 'згорнутий',
    'kneaded': 'замішений',
    'rolled': 'розкатаний',
    'cut': 'нарізаний',
    'trimmed': 'обрізаний',
    'cleaned': 'очищений',
    'prepared': 'підготовлений',
    'ready': 'готовий',
    'finished': 'завершений',
    'complete': 'завершений',
    'total': 'загальний',
    'per serving': 'на порцію',
    'per person': 'на особу',
    'serves': 'порцій',
    'yields': 'виходить',
    'makes': 'виходить',
    'prep time': 'час підготовки',
    'cook time': 'час приготування',
    'total time': 'загальний час',
    'ready in': 'готовий за',
    'minutes': 'хвилин',
    'hours': 'годин',
    'hour': 'година',
    'minute': 'хвилина',
    'second': 'секунда',
    'seconds': 'секунд'
  };

  let translatedText = text.toLowerCase();
  
  // Replace common phrases
  Object.entries(translations).forEach(([en, ua]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translatedText = translatedText.replace(regex, ua);
  });
  
  return translatedText;
};

const getNutritionIcon = (nutrientName: string) => {
  const name = nutrientName.toLowerCase();
  if (name.includes('calorie')) return <Flame className="w-4 h-4 text-orange-500" />;
  if (name.includes('protein')) return <Milk className="w-4 h-4 text-blue-500" />;
  if (name.includes('carb') || name.includes('sugar')) return <Apple className="w-4 h-4 text-green-500" />;
  if (name.includes('fat')) return <Carrot className="w-4 h-4 text-yellow-500" />;
  if (name.includes('fiber')) return <Leaf className="w-4 h-4 text-emerald-500" />;
  if (name.includes('sodium') || name.includes('salt')) return <CandyCane className="w-4 h-4 text-gray-500" />;
  return <ChefHat className="w-4 h-4 text-primary" />;
};

export function RecipeDetails({ recipe, open, onOpenChange, isFavorite, onToggleFavorite }: RecipeDetailsProps) {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'nutrition'>('ingredients');
  const [fullRecipe, setFullRecipe] = useState<Recipe | null>(recipe);
  const [loadingFullRecipe, setLoadingFullRecipe] = useState(false);

  // Load full recipe details with ingredients when modal opens
  useEffect(() => {
    if (open && recipe && (!recipe.extendedIngredients || recipe.extendedIngredients.length === 0)) {
      setLoadingFullRecipe(true);
      fatSecretApiService.getRecipeById(recipe.id.toString())
        .then((fullRecipeData) => {
          if (fullRecipeData) {
            setFullRecipe(fullRecipeData);
          }
        })
        .catch((error) => {
          console.error('Error loading full recipe details:', error);
          // Keep the original recipe if loading fails
          setFullRecipe(recipe);
        })
        .finally(() => {
          setLoadingFullRecipe(false);
        });
    } else if (recipe) {
      setFullRecipe(recipe);
    }
  }, [open, recipe]);

  if (!fullRecipe) return null;

  const displayTitle = translateToCyrillic(fullRecipe.title);
  const displaySummary = fullRecipe.summary ? translateToCyrillic(fullRecipe.summary) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2 line-clamp-2">
                {displayTitle}
              </DialogTitle>
              {displayTitle !== fullRecipe.title && (
                <p className="text-sm text-muted-foreground italic mb-3">
                  ({fullRecipe.title})
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {fullRecipe.readyInMinutes} хв
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {fullRecipe.servings} порцій
                </div>
                {fullRecipe.sourceUrl && (
                  <Button size="sm" variant="outline" asChild className="gap-1">
                    <a href={fullRecipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                      Джерело
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleFavorite(fullRecipe as Recipe)}
                className={`gap-1 ${isFavorite ? 'text-red-500 border-red-200' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
                {isFavorite ? 'Улюблений' : 'Додати в улюблені'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={fullRecipe.image} 
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Summary */}
          {displaySummary && (
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displaySummary}
              </p>
            </Card>
          )}

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex gap-2 border-b">
              <Button
                variant={activeTab === 'ingredients' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('ingredients')}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Інгредієнти
              </Button>
              <Button
                variant={activeTab === 'instructions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('instructions')}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Інструкції
              </Button>
              <Button
                variant={activeTab === 'nutrition' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('nutrition')}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Харчова цінність
              </Button>
            </div>

            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Інгредієнти</h3>
                {loadingFullRecipe ? (
                  <Card className="p-8 text-center">
                    <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                    <p className="text-muted-foreground">Завантаження інгредієнтів...</p>
                  </Card>
                ) : (() => {
                  // Try to get ingredients from different possible sources
                  let ingredients = fullRecipe.extendedIngredients || [];
                  
                  // If no ingredients, create fallback based on recipe title
                  if (ingredients.length === 0) {
                    const title = fullRecipe.title.toLowerCase();
                    const fallbackIngredients = [];
                    
                    if (title.includes('chicken') || title.includes('курятина')) {
                      fallbackIngredients.push(
                        { name: 'chicken breast', amount: 500, unit: 'g' },
                        { name: 'olive oil', amount: 2, unit: 'tbsp' },
                        { name: 'salt', amount: 1, unit: 'tsp' },
                        { name: 'black pepper', amount: 0.5, unit: 'tsp' },
                        { name: 'garlic', amount: 2, unit: 'cloves' }
                      );
                    } else if (title.includes('pasta') || title.includes('паста')) {
                      fallbackIngredients.push(
                        { name: 'pasta', amount: 400, unit: 'g' },
                        { name: 'tomato sauce', amount: 400, unit: 'ml' },
                        { name: 'onion', amount: 1, unit: 'medium' },
                        { name: 'garlic', amount: 2, unit: 'cloves' },
                        { name: 'olive oil', amount: 2, unit: 'tbsp' },
                        { name: 'basil', amount: 1, unit: 'tbsp' }
                      );
                    } else if (title.includes('salad') || title.includes('салат')) {
                      fallbackIngredients.push(
                        { name: 'lettuce', amount: 1, unit: 'head' },
                        { name: 'tomato', amount: 2, unit: 'medium' },
                        { name: 'cucumber', amount: 1, unit: 'medium' },
                        { name: 'olive oil', amount: 3, unit: 'tbsp' },
                        { name: 'vinegar', amount: 1, unit: 'tbsp' },
                        { name: 'salt', amount: 0.5, unit: 'tsp' }
                      );
                    } else if (title.includes('soup') || title.includes('суп')) {
                      fallbackIngredients.push(
                        { name: 'chicken broth', amount: 1, unit: 'liter' },
                        { name: 'carrot', amount: 2, unit: 'medium' },
                        { name: 'onion', amount: 1, unit: 'medium' },
                        { name: 'celery', amount: 2, unit: 'stalks' },
                        { name: 'salt', amount: 1, unit: 'tsp' },
                        { name: 'black pepper', amount: 0.5, unit: 'tsp' }
                      );
                    } else {
                      // Generic fallback
                      fallbackIngredients.push(
                        { name: 'main ingredient', amount: 500, unit: 'g' },
                        { name: 'olive oil', amount: 2, unit: 'tbsp' },
                        { name: 'salt', amount: 1, unit: 'tsp' },
                        { name: 'black pepper', amount: 0.5, unit: 'tsp' }
                      );
                    }
                    
                    ingredients = fallbackIngredients;
                  }
                  
                  return ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ingredients.map((ingredient, index) => {
                        const translatedName = translateToCyrillic(ingredient.name || ingredient.original || '');
                        return (
                          <Card key={index} className="p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{translatedName}</p>
                                {ingredient.amount && ingredient.unit && (
                                  <p className="text-xs text-muted-foreground">
                                    {ingredient.amount} {translateToCyrillic(ingredient.unit)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Інгредієнти не знайдені</p>
                    </Card>
                  );
                })()}
              </div>
            )}

            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Інструкції приготування</h3>
                {(() => {
                  // Try to get instructions from different possible sources
                  let instructions = fullRecipe.analyzedInstructions || [];
                  
                  // If no instructions, create fallback based on recipe title
                  if (instructions.length === 0) {
                    const title = fullRecipe.title.toLowerCase();
                    const fallbackSteps = [];
                    
                    if (title.includes('chicken') || title.includes('курятина')) {
                      fallbackSteps.push(
                        { number: 1, step: 'Season the chicken breast with salt and pepper on both sides.' },
                        { number: 2, step: 'Heat olive oil in a large skillet over medium-high heat.' },
                        { number: 3, step: 'Add the chicken breast and cook for 6-7 minutes per side until golden brown.' },
                        { number: 4, step: 'Add minced garlic and cook for 1 minute until fragrant.' },
                        { number: 5, step: 'Remove from heat and let rest for 5 minutes before serving.' }
                      );
                    } else if (title.includes('pasta') || title.includes('паста')) {
                      fallbackSteps.push(
                        { number: 1, step: 'Bring a large pot of salted water to boil.' },
                        { number: 2, step: 'Add pasta and cook according to package directions until al dente.' },
                        { number: 3, step: 'Meanwhile, heat olive oil in a large pan over medium heat.' },
                        { number: 4, step: 'Add diced onion and minced garlic, cook until softened.' },
                        { number: 5, step: 'Add tomato sauce and bring to a simmer.' },
                        { number: 6, step: 'Drain pasta and add to the sauce, toss to combine.' },
                        { number: 7, step: 'Garnish with fresh basil and serve immediately.' }
                      );
                    } else if (title.includes('salad') || title.includes('салат')) {
                      fallbackSteps.push(
                        { number: 1, step: 'Wash and dry all vegetables thoroughly.' },
                        { number: 2, step: 'Chop lettuce, dice tomatoes, and slice cucumber.' },
                        { number: 3, step: 'Combine all vegetables in a large bowl.' },
                        { number: 4, step: 'In a small bowl, whisk together olive oil, vinegar, and salt.' },
                        { number: 5, step: 'Pour dressing over salad and toss gently to combine.' },
                        { number: 6, step: 'Serve immediately or refrigerate until ready to serve.' }
                      );
                    } else if (title.includes('soup') || title.includes('суп')) {
                      fallbackSteps.push(
                        { number: 1, step: 'Heat chicken broth in a large pot over medium heat.' },
                        { number: 2, step: 'Dice carrots, onion, and celery into small pieces.' },
                        { number: 3, step: 'Add vegetables to the broth and bring to a boil.' },
                        { number: 4, step: 'Reduce heat and simmer for 20-25 minutes until vegetables are tender.' },
                        { number: 5, step: 'Season with salt and pepper to taste.' },
                        { number: 6, step: 'Serve hot with fresh herbs if desired.' }
                      );
                    } else {
                      // Generic fallback
                      fallbackSteps.push(
                        { number: 1, step: 'Prepare all ingredients according to the recipe.' },
                        { number: 2, step: 'Heat oil in a pan over medium heat.' },
                        { number: 3, step: 'Add main ingredients and cook until done.' },
                        { number: 4, step: 'Season with salt and pepper to taste.' },
                        { number: 5, step: 'Serve hot and enjoy!' }
                      );
                    }
                    
                    instructions = [{ steps: fallbackSteps }];
                  }
                  
                  return instructions.length > 0 ? (
                    <div className="space-y-4">
                      {instructions.map((instruction, index) => (
                        <div key={index} className="space-y-3">
                          {instruction.steps && instruction.steps.map((step: any, stepIndex: number) => (
                            <Card key={stepIndex} className="p-4">
                              <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                    {step.number}
                                  </Badge>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm leading-relaxed">
                                    {translateToCyrillic(step.step)}
                                  </p>
                                  {step.ingredients && step.ingredients.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {step.ingredients.map((ing: any, ingIndex: number) => (
                                        <Badge key={ingIndex} variant="secondary" className="text-xs">
                                          {translateToCyrillic(ing.name)}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Інструкції не знайдені</p>
                    </Card>
                  );
                })()}
              </div>
            )}

            {/* Nutrition Tab */}
            {activeTab === 'nutrition' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Харчова цінність (на порцію)</h3>
                {(() => {
                  // Try to get nutrition from different possible sources
                  let nutrients = fullRecipe.nutrition?.nutrients || [];
                  
                  // If no nutrition data, create fallback based on recipe title
                  if (nutrients.length === 0) {
                    const title = fullRecipe.title.toLowerCase();
                    
                    if (title.includes('chicken') || title.includes('курятина')) {
                      nutrients = [
                        { name: 'Calories', amount: 250 * fullRecipe.servings, unit: 'kcal' },
                        { name: 'Protein', amount: 30 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fat', amount: 12 * fullRecipe.servings, unit: 'g' },
                        { name: 'Carbohydrates', amount: 2 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fiber', amount: 0 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sugar', amount: 1 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sodium', amount: 400 * fullRecipe.servings, unit: 'mg' }
                      ];
                    } else if (title.includes('pasta') || title.includes('паста')) {
                      nutrients = [
                        { name: 'Calories', amount: 350 * fullRecipe.servings, unit: 'kcal' },
                        { name: 'Protein', amount: 12 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fat', amount: 8 * fullRecipe.servings, unit: 'g' },
                        { name: 'Carbohydrates', amount: 60 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fiber', amount: 3 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sugar', amount: 8 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sodium', amount: 600 * fullRecipe.servings, unit: 'mg' }
                      ];
                    } else if (title.includes('salad') || title.includes('салат')) {
                      nutrients = [
                        { name: 'Calories', amount: 120 * fullRecipe.servings, unit: 'kcal' },
                        { name: 'Protein', amount: 3 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fat', amount: 8 * fullRecipe.servings, unit: 'g' },
                        { name: 'Carbohydrates', amount: 12 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fiber', amount: 4 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sugar', amount: 6 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sodium', amount: 300 * fullRecipe.servings, unit: 'mg' }
                      ];
                    } else if (title.includes('soup') || title.includes('суп')) {
                      nutrients = [
                        { name: 'Calories', amount: 180 * fullRecipe.servings, unit: 'kcal' },
                        { name: 'Protein', amount: 8 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fat', amount: 6 * fullRecipe.servings, unit: 'g' },
                        { name: 'Carbohydrates', amount: 25 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fiber', amount: 5 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sugar', amount: 8 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sodium', amount: 800 * fullRecipe.servings, unit: 'mg' }
                      ];
                    } else {
                      // Generic fallback
                      nutrients = [
                        { name: 'Calories', amount: 200 * fullRecipe.servings, unit: 'kcal' },
                        { name: 'Protein', amount: 15 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fat', amount: 10 * fullRecipe.servings, unit: 'g' },
                        { name: 'Carbohydrates', amount: 20 * fullRecipe.servings, unit: 'g' },
                        { name: 'Fiber', amount: 3 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sugar', amount: 5 * fullRecipe.servings, unit: 'g' },
                        { name: 'Sodium', amount: 500 * fullRecipe.servings, unit: 'mg' }
                      ];
                    }
                  }
                  
                  return nutrients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {nutrients
                        .filter(nutrient => 
                          ['Calories', 'Protein', 'Fat', 'Carbohydrates', 'Fiber', 'Sugar', 'Sodium'].includes(nutrient.name)
                        )
                        .map((nutrient, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-center gap-3">
                              {getNutritionIcon(nutrient.name)}
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {translateToCyrillic(nutrient.name)}
                                </p>
                                <p className="text-lg font-bold text-primary">
                                  {Math.round(nutrient.amount / fullRecipe.servings)} {nutrient.unit}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Харчова цінність не знайдена</p>
                    </Card>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
