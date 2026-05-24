import { TrendingUp, Clock, ArrowRight, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  publishedAt: string;
}

interface ArticlesTrendingSectionProps {
  trendingArticles: Article[];
  newArticles: Article[];
  onArticleClick: (article: Article) => void;
  onViewAllTrending: () => void;
  onViewAllNew: () => void;
}

export function ArticlesTrendingSection({
  trendingArticles,
  newArticles,
  onArticleClick,
  onViewAllTrending,
  onViewAllNew
}: ArticlesTrendingSectionProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trending Articles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Популярне зараз</h3>
            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/30">
              HOT
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewAllTrending}
            className="text-orange-500 hover:bg-orange-500/10"
          >
            Всі <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-3">
          {trendingArticles.map((article, index) => (
            <motion.div
              key={article.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                onClick={() => onArticleClick(article)}
              >
                <div className="flex gap-4">
                  {article.imageUrl && (
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={article.imageUrl} 
                        alt={article.titleUk}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground line-clamp-2 mb-1">
                      {article.titleUk}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {article.excerptUk}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>{article.category.nameUk}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readingTime} хв</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{article.views} переглядів</span>
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {article.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Articles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Нові статті</h3>
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/30">
              NEW
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewAllNew}
            className="text-blue-500 hover:bg-blue-500/10"
          >
            Всі <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-3">
          {newArticles.map((article, index) => (
            <motion.div
              key={article.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                onClick={() => onArticleClick(article)}
              >
                <div className="flex gap-4">
                  {article.imageUrl && (
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={article.imageUrl} 
                        alt={article.titleUk}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground line-clamp-2 mb-1">
                      {article.titleUk}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {article.excerptUk}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>{article.category.nameUk}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readingTime} хв</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{new Date(article.publishedAt).toLocaleDateString('uk-UA')}</span>
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {article.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
