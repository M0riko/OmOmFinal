import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { EnhancedRecipeDetails } from "@/components/EnhancedRecipeDetails";
import { PersonalizedRecipes } from "@/components/PersonalizedRecipes";
import { FridgeBasedRecipes } from "@/components/FridgeBasedRecipes";
import { RecipeSearchBar } from "@/components/RecipeSearchBar";
import { RecipeTagsRow } from "@/components/RecipeTagsRow";
import { RecipeTabs } from "@/components/RecipeTabs";
import { RecommendationBanner } from "@/components/RecommendationBanner";
import { RecipeGrid } from "@/components/RecipeGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Search, Sparkles, Loader2, TrendingUp, Plus, Heart, ChefHat, Utensils, Dice6 } from "lucide-react";
import { apiService, Recipe } from "@/lib/api";
import { toast } from "sonner";

export default function Recipes() {
  const [apiRecipes, setApiRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteObjects, setFavoriteObjects] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Form states
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"recommended" | "fridge" | "favorites">("recommended");
  
  // Recipe details modal state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeDetailsOpen, setRecipeDetailsOpen] = useState(false);

  // Recipe translations for Cyrillic support
  const recipeTranslations: Record<string, string> = {
    'курятина': 'chicken',
    'курица': 'chicken',
    'мясо': 'meat',
    'риба': 'fish',
    'рыба': 'fish',
    'овочі': 'vegetables',
    'овощи': 'vegetables',
    'салат': 'salad',
    'суп': 'soup',
    'борщ': 'borscht',
    'паста': 'pasta',
    'макарони': 'pasta',
    'рис': 'rice',
    'картопля': 'potato',
    'картофель': 'potato',
    'хліб': 'bread',
    'хлеб': 'bread',
    'десерт': 'dessert',
    'торт': 'cake',
    'печиво': 'cookies',
    'печенье': 'cookies',
    'швидко': 'quick',
    'быстро': 'quick',
    'здорове': 'healthy',
    'здоровое': 'healthy',
    'вегетаріанське': 'vegetarian',
    'вегетарианское': 'vegetarian',
    'веганське': 'vegan',
    'веганское': 'vegan',
    'без глютену': 'gluten free',
    'без глютена': 'gluten free',
    'низькокалорійне': 'low calorie',
    'низкокалорийное': 'low calorie',
    'високобілкове': 'high protein',
    'высокобелковое': 'high protein',
    'низьковуглеводне': 'low carb',
    'низкоуглеводное': 'low carb'
  };

  const reverseRecipeTranslations: Record<string, string> = {
    'chicken': 'Курятина',
    'meat': 'М\'ясо',
    'fish': 'Риба',
    'vegetables': 'Овочі',
    'salad': 'Салат',
    'soup': 'Суп',
    'borscht': 'Борщ',
    'pasta': 'Паста',
    'rice': 'Рис',
    'potato': 'Картопля',
    'bread': 'Хліб',
    'dessert': 'Десерт',
    'cake': 'Торт',
    'cookies': 'Печиво',
    'quick': 'Швидко',
    'healthy': 'Здорове',
    'vegetarian': 'Вегетаріанське',
    'vegan': 'Веганське',
    'gluten free': 'Без глютену',
    'low calorie': 'Низькокалорійне',
    'high protein': 'Високобілкове',
    'low carb': 'Низьковуглеводне'
  };

  const translateRecipeToCyrillic = (recipeName: string): string => {
    if (!recipeName || typeof recipeName !== 'string') {
      return '';
    }

    const lowerName = recipeName.toLowerCase();
    
    if (reverseRecipeTranslations[lowerName]) {
      return reverseRecipeTranslations[lowerName];
    }
    
    for (const [english, cyrillic] of Object.entries(reverseRecipeTranslations)) {
      if (lowerName.includes(english)) {
        return recipeName.replace(new RegExp(english, 'gi'), cyrillic);
      }
    }
    
    return recipeName;
  };

  useEffect(() => {
    const savedFavorites = localStorage.getItem("omomo_favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    const savedObjects = localStorage.getItem("omomo_favorite_objects");
    if (savedObjects) {
      setFavoriteObjects(JSON.parse(savedObjects));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("omomo_favorites", JSON.stringify(favorites));
    localStorage.setItem("omomo_favorite_objects", JSON.stringify(favoriteObjects));
  }, [favorites, favoriteObjects]);

  // Auto-load random recipes when component mounts
  useEffect(() => {
    if (apiRecipes.length === 0) {
      loadRandomRecipes();
    }
  }, []);

  const searchRecipes = async (searchQuery?: string, page: number = 0, append: boolean = false) => {
    const queryToUse = searchQuery || query;
    
    if (!queryToUse || typeof queryToUse !== 'string' || !queryToUse.trim()) {
      return;
    }

    if (page < 0 || !Number.isInteger(page)) {
      console.error('Invalid page number:', page);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Searching recipes for:', queryToUse);
      
      let result = await apiService.searchRecipes(queryToUse, {
        number: 20,
        pageNumber: page
      });
      
      console.log('Original search results:', result.recipes.length);
      
      if (result.recipes.length === 0 && /[а-яёіїєґ]/i.test(queryToUse)) {
        const englishQuery = recipeTranslations[queryToUse.toLowerCase()];
        if (englishQuery) {
          console.log('Trying English translation:', englishQuery);
          result = await apiService.searchRecipes(englishQuery, {
            number: 20,
            pageNumber: page
          });
          console.log('English search results:', result.recipes.length);
        }
      }
      
      if (append) {
        setApiRecipes(prev => [...prev, ...result.recipes]);
      } else {
        setApiRecipes(result.recipes);
        setCurrentPage(0);
      }
      
      setTotalResults(result.totalResults);
      setHasMorePages((page + 1) * result.maxResults < result.totalResults);
      setIsSearchMode(true);
    } catch (error) {
      console.error('Error searching recipes:', error);
      toast.error("Помилка при пошуку рецептів");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when query changes
  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        searchRecipes();
      }, 800); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [query]);

  const loadRandomRecipes = async () => {
    setLoading(true);
    try {
      const popularTerms = ['курятина', 'паста', 'салат', 'суп', 'десерт', 'хліб', 'овочі', 'м\'ясо', 'риба', 'рис'];
      const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
      
      const result = await apiService.searchRecipes(randomTerm, {
        number: 20,
        pageNumber: 0
      });
      
      setApiRecipes(result.recipes);
      setCurrentPage(0);
      setTotalResults(result.totalResults);
      setHasMorePages(result.recipes.length === 20);
      setIsSearchMode(false);
    } catch (error) {
      console.error('Error loading random recipes:', error);
      toast.error("Помилка при завантаженні рецептів");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (recipe: Recipe) => {
    const recipeId = recipe.id;
    setFavorites(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
    setFavoriteObjects(prev => {
      if (prev.some(r => r.id === recipeId)) {
        return prev.filter(r => r.id !== recipeId);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const openRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDetailsOpen(true);
  };

  const loadMoreRecipes = async () => {
    if (!hasMorePages || loading) return;
    
    const nextPage = currentPage + 1;
    await searchRecipes(query, nextPage, true);
    setCurrentPage(nextPage);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    searchRecipes(tag);
  };

  const handleTabChange = (tab: "recommended" | "fridge" | "favorites") => {
    setActiveTab(tab);
    if (tab === "recommended" && apiRecipes.length === 0) {
    loadRandomRecipes();
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "recommended":
  return (
              <div className="space-y-6">
            <RecommendationBanner />

              {loading && (
              <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">Завантаження рецептів...</p>
                      <p className="text-sm text-muted-foreground mt-1">Використовуємо FatSecret API</p>
                    </div>
                  </div>
                </Card>
              )}

              {apiRecipes.length > 0 && !loading && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <p className="text-base font-medium text-foreground">
                      {isSearchMode ? `Знайдено ${totalResults} рецептів` : `Показано ${apiRecipes.length} рецептів`}
                    </p>
                      {hasMorePages && (
                        <Badge variant="default" className="bg-primary/20 text-primary-foreground border border-primary/30">
                          Є ще сторінки
                        </Badge>
                      )}
                    </div>
                    <Button 
                      onClick={loadRandomRecipes} 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-2 hover:bg-muted/50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Нові випадкові</span>
                      <span className="sm:hidden">Нові</span>
                    </Button>
                  </div>
                
                <RecipeGrid
                  recipes={apiRecipes}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onOpenDetails={openRecipeDetails}
                  translateRecipeToCyrillic={translateRecipeToCyrillic}
                />
                  
                  {hasMorePages && (
                    <div className="flex justify-center pt-8">
                      <Button 
                        onClick={loadMoreRecipes}
                        disabled={loading}
                        className="gap-3 h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Завантаження...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            <span>Завантажити ще рецепти</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {apiRecipes.length === 0 && !loading && (
              <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-2 border-muted/30 shadow-lg">
                  <div className="space-y-6">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Search className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground">Знайдіть ідеальний рецепт</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Введіть запит для пошуку рецептів або натисніть "Випадкові рецепти" для отримання рекомендацій
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={loadRandomRecipes}
                        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      >
                        <Sparkles className="w-4 h-4" />
                        Випадкові рецепти
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
          </div>
        );

      case "fridge":
        return (
          <FridgeBasedRecipes
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onOpenRecipeDetails={openRecipeDetails}
            translateRecipeToCyrillic={translateRecipeToCyrillic}
          />
        );

      case "favorites":
        const favoriteRecipes = favoriteObjects;
        
        if (favorites.length === 0) {
          return (
            <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-2 border-muted/30 shadow-lg">
                  <div className="space-y-6">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground">Немає улюблених рецептів</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Додавайте рецепти в улюблені, натискаючи на іконку серця
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                    onClick={loadRandomRecipes}
                        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                      >
                        <Sparkles className="w-4 h-4" />
                        Знайти рецепти
                      </Button>
                    </div>
                  </div>
                </Card>
          );
        }

        return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary fill-primary" />
                        <p className="text-base font-medium text-foreground">
                          Улюблені рецепти ({favorites.length})
                        </p>
                      <Badge variant="default" className="bg-primary/20 text-primary-foreground border border-primary/30">
                        {favorites.length} рецептів
                      </Badge>
                    </div>
                    <Button 
                onClick={loadRandomRecipes} 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-2 hover:bg-muted/50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Нові випадкові</span>
                      <span className="sm:hidden">Нові</span>
                    </Button>
                  </div>
            
            <RecipeGrid
              recipes={favoriteRecipes}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onOpenDetails={openRecipeDetails}
              translateRecipeToCyrillic={translateRecipeToCyrillic}
            />
                                </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-3 pb-24 md:pb-8 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header Zone */}
          <div className="mb-4 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3">
                  <Utensils className="w-8 h-8 text-primary" />
                  Рецепти
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  Відкрийте світ смачних ідей з FatSecret API.
                </p>
                              </div>
                                <Button 
                onClick={loadRandomRecipes} 
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                                >
                <Dice6 className="w-4 h-4" />
                <span className="hidden sm:inline">Випадковий рецепт</span>
                <span className="sm:hidden">Випадковий</span>
                                </Button>
            </div>

            {/* Search Zone */}
            <div className="space-y-4">
              <RecipeSearchBar
                query={query}
                onQueryChange={setQuery}
                onSearch={() => searchRecipes()}
                loading={loading}
              />
              
              <RecipeTagsRow onTagClick={handleTagClick} />
                              </div>
                            </div>

          {/* Tabs Zone */}
          <div className="space-y-6">
            <RecipeTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            {/* Tab Content */}
            {getTabContent()}
                </div>
        </main>
        <MobileBottomNav />
        
        {/* Recipe Details Modal */}
        <EnhancedRecipeDetails
          recipe={selectedRecipe}
          open={recipeDetailsOpen}
          onOpenChange={setRecipeDetailsOpen}
          isFavorite={selectedRecipe ? favorites.includes(selectedRecipe.id) : false}
          onToggleFavorite={toggleFavorite}
          translateRecipeToCyrillic={translateRecipeToCyrillic}
        />
      </div>
    </div>
  );
};