import { Search, Filter, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ProductCategory } from "@/lib/smart-fridge";

interface FridgeSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showExpired: boolean;
  onToggleExpired: () => void;
  showPantry: boolean;
  onTogglePantry: () => void;
  categories: ProductCategory[];
}

export function FridgeSearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showExpired,
  onToggleExpired,
  showPantry,
  onTogglePantry,
  categories
}: FridgeSearchFiltersProps) {
  const popularTags = [
    "М'ясо та риба",
    "Молочні продукти", 
    "Овочі та фрукти",
    "Крупи та макарони",
    "Консерви",
    "Заморожені продукти"
  ];

  return (
    <div className="space-y-4">
      {/* Main Search and Filters */}
      <Card className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Пошук продуктів..." 
              value={searchQuery} 
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full lg:w-48 h-12 border-2 focus:border-primary/50">
              <SelectValue placeholder="Всі категорії" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі категорії</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button
              variant={showExpired ? "default" : "outline"}
              size="sm"
              onClick={onToggleExpired}
              className="h-12 px-4 border-2 hover:bg-muted/50"
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Проблемні</span>
              <span className="sm:hidden">Проблемні</span>
            </Button>
            <Button
              variant={showPantry ? "default" : "outline"}
              size="sm"
              onClick={onTogglePantry}
              className="h-12 px-4 border-2 hover:bg-muted/50"
            >
              <Archive className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Кладовка</span>
              <span className="sm:hidden">Кладовка</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Popular Tags */}
      <Card className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Популярні категорії:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => onCategoryChange(tag)}
                className={cn(
                  "h-8 px-3 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 border-2 border-muted/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm",
                  selectedCategory === tag ? "bg-primary text-primary-foreground border-primary" : ""
                )}
              >
                <span className="text-sm font-medium">{tag}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
