import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Article {
  id: string;
  titleUk: string;
  excerptUk: string;
  imageUrl?: string;
  category: {
    id: string;
    nameUk: string;
  };
  readingTime: number;
  views: number;
  likes: number;
  tags: string[];
}

interface ArticlesPersonalizedFeedProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onViewAll: () => void;
}

export function ArticlesPersonalizedFeed({ articles, onArticleClick, onViewAll }: ArticlesPersonalizedFeedProps) {
  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Для вас</h3>
          <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
            AI
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onViewAll}
          className="text-primary hover:bg-primary/10"
        >
          Переглянути всі <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-80"
          >
            <Card 
              className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => onArticleClick(article)}
            >
              <div className="space-y-3">
                {article.imageUrl && (
                  <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt={article.titleUk}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground line-clamp-2">
                    {article.titleUk}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerptUk}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{article.category.nameUk}</span>
                  <span>{article.readingTime} хв</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.views} переглядів</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {article.likes}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
