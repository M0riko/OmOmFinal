import { Search, Eye, EyeOff, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ShoppingSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
  showCompleted: boolean;
  onToggleCompleted: () => void;
  categories: Array<{ id: string; name: string }>;
}

export function ShoppingSearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  showCompleted,
  onToggleCompleted,
  categories
}: ShoppingSearchFilterBarProps) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-2 border-muted/30 shadow-lg">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Пошук товарів..." 
              value={searchQuery} 
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-40 h-12 border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm">
                <SelectValue placeholder="Категорія" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі категорії</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={onPriorityChange}>
              <SelectTrigger className="w-32 h-12 border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm">
                <SelectValue placeholder="Пріоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі</SelectItem>
                <SelectItem value="high">Високий</SelectItem>
                <SelectItem value="medium">Середній</SelectItem>
                <SelectItem value="low">Низький</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onToggleCompleted}
            className={cn(
              "gap-2 border-2 transition-all duration-200",
              showCompleted 
                ? "bg-primary/10 border-primary/30 text-primary" 
                : "border-muted/50 hover:bg-muted/50"
            )}
          >
            {showCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showCompleted ? 'Приховати куплені' : 'Показати куплені'}
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Фільтри активні</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
