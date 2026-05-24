import { BookOpen, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArticlesHeaderBarProps {
  onCreateArticle: () => void;
  onOpenSettings: () => void;
}

export function ArticlesHeaderBar({ onCreateArticle, onOpenSettings }: ArticlesHeaderBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Центр знань та мотивації
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Персоналізовані статті для вашого фітнес-шляху
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          onClick={onCreateArticle}
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">+ Створити статтю</span>
          <span className="sm:hidden">+ Створити</span>
        </Button>
        
        <Button
          onClick={onOpenSettings}
          variant="outline"
          size="icon"
          className="h-10 w-10 border-2 hover:bg-muted/50"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
