import { Clock, Users, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Recipe } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onOpenDetails: (recipe: Recipe) => void;
  translatedTitle?: string;
}

export function RecipeCard({ 
  recipe, 
  isFavorite, 
  onToggleFavorite, 
  onOpenDetails,
  translatedTitle 
}: RecipeCardProps) {
  const displayTitle = translatedTitle || recipe.title;
  const calories = recipe.nutrition?.nutrients.find(n => n.name === "Calories")?.amount 
    ? Math.round(recipe.nutrition.nutrients.find(n => n.name === "Calories")!.amount / recipe.servings)
    : "~300";
  const protein = recipe.nutrition?.nutrients.find(n => n.name === "Protein")?.amount 
    ? Math.round(recipe.nutrition.nutrients.find(n => n.name === "Protein")!.amount / recipe.servings)
    : "~15";

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-2 border-transparent hover:border-primary/20 bg-card/30 backdrop-blur-sm">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img 
          src={recipe.image} 
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-3 right-3 h-9 w-9 p-0 bg-card/80 hover:bg-card shadow-lg backdrop-blur-sm"
          onClick={() => onToggleFavorite(recipe)}
        >
          <Heart className={cn(
            "w-4 h-4",
            isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          )} />
        </Button>
        
        {/* Recipe info overlay */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <Clock className="w-4 h-4" />
            {recipe.readyInMinutes} хв
            <span className="mx-1">•</span>
            <Users className="w-4 h-4" />
            {recipe.servings} порцій
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold mb-2 line-clamp-2 text-base group-hover:text-primary transition-colors">
          {displayTitle}
        </h3>
        
        {displayTitle !== recipe.title && (
          <p className="text-xs text-muted-foreground italic mb-3">
            ({recipe.title})
          </p>
        )}
        
        <div className="space-y-3 mb-4 flex-1">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="font-medium">{calories} ккал</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Б: {protein}г</span>
            </div>
          </div>
          
          {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
            <div className="text-xs text-muted-foreground bg-card/50 backdrop-blur-sm rounded-lg p-2 border border-muted/30">
              <span className="font-medium text-foreground">Інгредієнти:</span> {recipe.extendedIngredients.slice(0, 3).map(ing => ing.name).join(", ")}
              {recipe.extendedIngredients.length > 3 && ` +${recipe.extendedIngredients.length - 3} ще`}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-auto">
          <Button 
            size="sm" 
            onClick={() => onOpenDetails(recipe)}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            Деталі
          </Button>
          {recipe.sourceUrl && (
            <Button size="sm" variant="outline" asChild className="px-3 border-2 hover:bg-muted/50">
              <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
