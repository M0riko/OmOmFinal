import { Recipe } from "@/lib/api";
import { RecipeCard } from "./RecipeCard";

interface RecipeGridProps {
  recipes: Recipe[];
  favorites: number[];
  onToggleFavorite: (recipe: Recipe) => void;
  onOpenDetails: (recipe: Recipe) => void;
  translateRecipeToCyrillic: (recipeName: string) => string;
}

export function RecipeGrid({ 
  recipes, 
  favorites, 
  onToggleFavorite, 
  onOpenDetails,
  translateRecipeToCyrillic 
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => {
        const translatedTitle = translateRecipeToCyrillic(recipe.title);
        return (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isFavorite={favorites.includes(recipe.id)}
            onToggleFavorite={onToggleFavorite}
            onOpenDetails={onOpenDetails}
            translatedTitle={translatedTitle}
          />
        );
      })}
    </div>
  );
}
