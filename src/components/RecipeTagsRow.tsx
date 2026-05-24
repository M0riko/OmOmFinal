import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RecipeTagsRowProps {
  onTagClick: (tag: string) => void;
}

export function RecipeTagsRow({ onTagClick }: RecipeTagsRowProps) {
  const popularTags = [
    { en: 'chicken', ua: 'курятина' },
    { en: 'pasta', ua: 'паста' },
    { en: 'salad', ua: 'салат' },
    { en: 'soup', ua: 'суп' },
    { en: 'dessert', ua: 'десерт' },
    { en: 'vegetarian', ua: 'вегетаріанське' },
    { en: 'quick', ua: 'швидко' },
    { en: 'healthy', ua: 'здорове' },
    { en: 'bread', ua: 'хліб' },
    { en: 'fish', ua: 'риба' },
    { en: 'meat', ua: 'м\'ясо' },
    { en: 'vegetable', ua: 'овочі' }
  ];

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Популярні запити:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Button
              key={tag.en}
              variant="outline"
              size="sm"
              onClick={() => onTagClick(tag.ua)}
              className="h-9 px-4 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 border-2 border-muted/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
            >
              <span className="text-sm font-medium">{tag.ua}</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
