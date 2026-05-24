import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RecipeSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export function RecipeSearchBar({ query, onQueryChange, onSearch, loading }: RecipeSearchBarProps) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Пошук за назвою або інгредієнтами (курка, паста, салат...)" 
              value={query} 
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="pl-12 h-14 text-base border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
            />
          </div>
          <Button 
            onClick={onSearch} 
            disabled={loading} 
            className="gap-2 h-14 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Пошук</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
