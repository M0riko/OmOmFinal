import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Bookmark, 
  Clock, 
  User, 
  Calendar,
  TrendingUp,
  Target,
  Dumbbell,
  Apple,
  Moon,
  Zap,
  ChefHat,
  Brain,
  Shield,
  Pill,
  Microscope,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useArticles } from "@/hooks/useArticles";
import { Article, ArticleRecommendation } from "@/lib/article-types";
import { ArticleReader } from "./ArticleReader";

interface PersonalizedArticleFeedProps {
  limit?: number;
}

export function PersonalizedArticleFeed({ limit = 10 }: PersonalizedArticleFeedProps) {
  const { 
    getPersonalizedFeed, 
    getPersonalizedRecommendations,
    likeArticle, 
    saveArticle, 
    isArticleSaved, 
    isArticleLiked 
  } = useArticles();
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showReader, setShowReader] = useState(false);

  const recommendations = getPersonalizedRecommendations(limit);
  const feedArticles = getPersonalizedFeed(limit);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setShowReader(true);
  };

  const handleCloseReader = () => {
    setShowReader(false);
    setSelectedArticle(null);
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'nutrition': return <Apple className="w-4 h-4" />;
      case 'training': return <Dumbbell className="w-4 h-4" />;
      case 'recovery': return <Moon className="w-4 h-4" />;
      case 'motivation': return <Zap className="w-4 h-4" />;
      case 'recipes': return <ChefHat className="w-4 h-4" />;
      case 'science': return <Microscope className="w-4 h-4" />;
      case 'supplements': return <Pill className="w-4 h-4" />;
      case 'mental_health': return <Brain className="w-4 h-4" />;
      case 'injury_prevention': return <Shield className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getRecommendationReasonColor = (reason: string) => {
    switch (reason) {
      case 'user_goal': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'user_activity': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'user_preferences': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'trending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (showReader && selectedArticle) {
    return <ArticleReader article={selectedArticle} onClose={handleCloseReader} />;
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Для вас</h2>
          <p className="text-muted-foreground">
            Персоналізовані рекомендації на основі ваших цілей та активності
          </p>
        </div>
      </div>

      {/* Лента статей */}
      <div className="space-y-4">
        {feedArticles.map((article, index) => {
          const recommendation = recommendations.find(rec => rec.articleId === article.id);
          
          return (
            <Card 
              key={article.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleArticleClick(article)}
            >
              <div className="space-y-4">
                {/* Заголовок и метаинформация */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {article.titleUk}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2">
                        {article.excerptUk}
                      </p>
                    </div>
                    {article.imageUrl && (
                      <img 
                        src={article.imageUrl} 
                        alt={article.titleUk}
                        className="w-24 h-24 object-cover rounded-lg ml-4 flex-shrink-0"
                      />
                    )}
                  </div>

                  {/* Метаинформация */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(article.category.id)}
                      <span>{article.category.nameUk}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readingTime} хв</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.authorUk}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.publishedAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>

                  {/* Теги и причина рекомендации */}
                  <div className="flex flex-wrap items-center gap-2">
                    {article.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recommendation && (
                      <Badge 
                        className={`text-xs ${getRecommendationReasonColor(recommendation.reason)}`}
                      >
                        {recommendation.reasonTextUk}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Действия */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{article.views} переглядів</span>
                    <span>{article.likes} вподобань</span>
                    <span>{article.saves} збережень</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        likeArticle(article.id);
                      }}
                      className={`gap-1 ${isArticleLiked(article.id) ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${isArticleLiked(article.id) ? 'fill-current' : ''}`} />
                      {article.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveArticle(article.id);
                      }}
                      className={`gap-1 ${isArticleSaved(article.id) ? 'text-blue-500' : ''}`}
                    >
                      <Bookmark className={`w-4 h-4 ${isArticleSaved(article.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Пустое состояние */}
      {feedArticles.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Немає рекомендацій</h3>
              <p className="text-muted-foreground">
                Почніть читати статті, щоб отримати персоналізовані рекомендації
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Переглянути популярні статті
            </Button>
          </div>
        </Card>
      )}

      {/* Показать больше */}
      {feedArticles.length >= limit && (
        <div className="text-center">
          <Button variant="outline" className="gap-2">
            Показати більше рекомендацій
          </Button>
        </div>
      )}
    </div>
  );
}
