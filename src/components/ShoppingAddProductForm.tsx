import { Plus, Package, Hash, Tag, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ShoppingAddProductFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  quantity: string;
  onQuantityChange: (quantity: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  priority: "low" | "medium" | "high";
  onPriorityChange: (priority: "low" | "medium" | "high") => void;
  onAddProduct: () => void;
  categories: Array<{ id: string; name: string }>;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  onSearchDb?: () => void;
}

export function ShoppingAddProductForm({
  title,
  onTitleChange,
  quantity,
  onQuantityChange,
  category,
  onCategoryChange,
  priority,
  onPriorityChange,
  onAddProduct,
  categories,
  suggestions = [],
  onSuggestionClick,
  onSearchDb
}: ShoppingAddProductFormProps) {
  const priorityOptions = [
    { value: "low", label: "Низький", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    { value: "medium", label: "Середній", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    { value: "high", label: "Високий", color: "bg-red-500/20 text-red-400 border-red-500/30" }
  ];

  const selectedPriorityOption = priorityOptions.find(opt => opt.value === priority);

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-sm border-2 border-muted/30 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Додати товар</h3>
          </div>
          {onSearchDb && (
            <Button variant="outline" size="sm" onClick={onSearchDb} className="gap-2">
              <Search className="w-4 h-4" />
              Знайти в базі
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <Input 
                placeholder="Назва товару" 
                value={title} 
                onChange={(e) => onTitleChange(e.target.value)}
                className="h-12 border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                onKeyPress={(e) => e.key === 'Enter' && onAddProduct()}
              />
            </div>
          </div>
          
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Кількість" 
              value={quantity} 
              onChange={(e) => onQuantityChange(e.target.value)}
              type="number"
              className="pl-10 h-12 border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
            />
          </div>
          
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-12 border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder="Категорія" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={onAddProduct}
            disabled={!title.trim()}
            className="gap-2 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Додати
          </Button>
        </div>

        {/* Priority Selection */}
        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Пріоритет:</span>
          <div className="flex gap-2">
            {priorityOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                onClick={() => onPriorityChange(option.value as "low" | "medium" | "high")}
                className={cn(
                  "h-8 px-3 text-xs border-2 transition-all duration-200",
                  priority === option.value 
                    ? option.color
                    : "border-muted/50 hover:bg-muted/50"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Популярні товари:</span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
