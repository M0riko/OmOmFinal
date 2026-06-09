import { Heart, Bookmark, Clock, User, Calendar, Eye, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  saves: number;
  tags: string[];
  authorUk: string;
  publishedAt: string;
}

interface ArticlesArticleCardProps {
  article: Article;
  isLiked?: boolean;
  isSaved?: boolean;
  onArticleClick: (article: Article) => void;
  onLike: (articleId: string) => void;
  onSave: (articleId: string) => void;
  variant?: "default" | "compact" | "featured";
  canDelete?: boolean;
  onDelete?: (articleId: string) => void;
}

export function ArticlesArticleCard({
  article,
  isLiked = false,
  isSaved = false,
  onArticleClick,
  onLike,
  onSave,
  variant = "default",
  canDelete = false,
  onDelete
}: ArticlesArticleCardProps) {
  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case 'nutrition': return "bg-green-500/20 text-green-400 border-green-500/30";
      case 'training': return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case 'recovery': return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case 'motivation': return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 'recipes': return "bg-red-500/20 text-red-400 border-red-500/30";
      case 'science': return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTagColor = (index: number) => {
    const colors = [
      "bg-primary/10 text-primary border-primary/30",
      "bg-green-500/10 text-green-400 border-green-500/30",
      "bg-orange-500/10 text-orange-400 border-orange-500/30",
      "bg-blue-500/10 text-blue-400 border-blue-500/30"
    ];
    return colors[index % colors.length];
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className="p-4 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          onClick={() => onArticleClick(article)}
        >
          <div className="flex gap-4">
            {article.imageUrl && (
              <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
                  <Badge variant="outline" className={cn("text-xs", getCategoryColor(article.category.id))}>
                    {article.category.nameUk}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readingTime} хв</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>{article.views} переглядів</span>
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {article.likes}</span>
                  {canDelete && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onDelete(article.id); }}
                      className="w-6 h-6 text-red-500 hover:text-red-600 hover:bg-red-500/10 ml-2"
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        onClick={() => onArticleClick(article)}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">
                {article.titleUk}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-3">
                {article.excerptUk}
              </p>
            </div>
            {article.imageUrl && (
              <img 
                src={article.imageUrl} 
                alt={article.titleUk}
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg flex-shrink-0"
              />
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
            <Badge variant="outline" className={cn("text-xs", getCategoryColor(article.category.id))}>
              {article.category.nameUk}
            </Badge>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              <span>{article.readingTime} хв</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 md:w-4 md:h-4" />
              <span>{article.authorUk}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              <span>{new Date(article.publishedAt).toLocaleDateString('uk-UA')}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 4).map((tag, index) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className={cn("text-xs", getTagColor(index))}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-muted/20 gap-3">
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                <span>{article.views} переглядів</span>
              </div>
              <span>{article.likes} вподобань</span>
              <span>{article.saves} збережень</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                size="sm" 
                className={cn("h-8 md:h-9 gap-1", isLiked ? 'text-red-500' : '')}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(article.id);
                }}
              >
                <Heart className={cn("w-4 h-4", isLiked ? 'fill-current' : '')} />
                {article.likes}
              </Button>
              <Button 
                variant="ghost"
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(article.id);
                }}
                className={cn("gap-1", isSaved ? 'text-blue-500' : '')}
              >
                <Bookmark className={cn("w-4 h-4", isSaved ? 'fill-current' : '')} />
              </Button>
              {canDelete && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(article.id);
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
