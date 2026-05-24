import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Heart, 
  Bookmark, 
  Share2, 
  Clock, 
  User, 
  Calendar,
  ExternalLink,
  ChevronRight,
  Target,
  Dumbbell,
  Apple,
  Moon,
  Zap,
  ChefHat
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useArticles } from "@/hooks/useArticles";
import { Article, CallToAction } from "@/lib/article-types";
import { CALL_TO_ACTION_LABELS } from "@/lib/article-types";
import { useNavigate } from "react-router-dom";

interface ArticleReaderProps {
  article: Article;
  onClose: () => void;
}

export function ArticleReader({ article, onClose }: ArticleReaderProps) {
  const { 
    recordInteraction, 
    likeArticle, 
    saveArticle, 
    isArticleSaved, 
    isArticleLiked,
    getRelatedArticles 
  } = useArticles();
  const navigate = useNavigate();
  
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Отслеживание прогресса чтения
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      
      setReadingProgress(Math.min(progress, 100));
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Регистрация начала чтения
  useEffect(() => {
    if (!isReading) {
      setIsReading(true);
      startTimeRef.current = Date.now();
      recordInteraction(article.id, 'view');
    }
  }, [article.id, isReading, recordInteraction]);

  // Регистрация завершения чтения
  useEffect(() => {
    if (readingProgress >= 90 && isReading) {
      const readingTime = Date.now() - startTimeRef.current;
      recordInteraction(article.id, 'complete', { readingTime });
      setIsReading(false);
    }
  }, [readingProgress, isReading, article.id, recordInteraction]);

  const handleLike = () => {
    likeArticle(article.id);
  };

  const handleSave = () => {
    saveArticle(article.id);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.titleUk,
          text: article.excerptUk,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // toast.success("Посилання скопійовано в буфер обміну");
      }
      recordInteraction(article.id, 'share');
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleCallToAction = (cta: CallToAction) => {
    recordInteraction(article.id, 'view', { ctaType: cta.type });
    
    if (cta.action.type === 'navigate') {
      navigate(cta.action.target, { 
        state: cta.action.params 
      });
    } else if (cta.action.type === 'external' && cta.action.externalUrl) {
      window.open(cta.action.externalUrl, '_blank');
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'nutrition': return <Apple className="w-4 h-4" />;
      case 'training': return <Dumbbell className="w-4 h-4" />;
      case 'recovery': return <Moon className="w-4 h-4" />;
      case 'motivation': return <Zap className="w-4 h-4" />;
      case 'recipes': return <ChefHat className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const relatedArticles = getRelatedArticles(article.id, 3);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок статьи */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${isArticleLiked(article.id) ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isArticleLiked(article.id) ? 'fill-current' : ''}`} />
              {article.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`gap-2 ${isArticleSaved(article.id) ? 'text-blue-500' : ''}`}
            >
              <Bookmark className={`w-4 h-4 ${isArticleSaved(article.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Прогресс чтения */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Прогрес читання</span>
            <span className="text-sm text-muted-foreground">{Math.round(readingProgress)}%</span>
          </div>
          <Progress value={readingProgress} className="h-2" />
        </div>

        {/* Метаинформация */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
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

        {/* Заголовок */}
        <h1 className="text-3xl font-bold mb-4">{article.titleUk}</h1>
        
        {/* Краткое описание */}
        <p className="text-lg text-muted-foreground mb-6">{article.excerptUk}</p>

        {/* Теги */}
        <div className="flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Изображение статьи */}
      {article.imageUrl && (
        <Card className="mb-6 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.imageAltUk || article.titleUk}
            className="w-full h-64 object-cover"
          />
        </Card>
      )}

      {/* Содержимое статьи */}
      <Card className="p-6 mb-6">
        <div 
          ref={contentRef}
          className="prose prose-lg max-w-none dark:prose-invert"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
          dangerouslySetInnerHTML={{ __html: article.contentUk }}
        />
      </Card>

      {/* Call-to-Action блоки */}
      {article.callToActions.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Рекомендовані дії</h3>
          <div className="space-y-3">
            {article.callToActions.map((cta) => (
              <div key={cta.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{cta.titleUk}</h4>
                    {cta.descriptionUk && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {cta.descriptionUk}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleCallToAction(cta)}
                    className="gap-2"
                  >
                    {CALL_TO_ACTION_LABELS[cta.type]}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Связанные статьи */}
      {relatedArticles.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Схожі статті</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((relatedArticle) => (
              <div 
                key={relatedArticle.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  // В реальном приложении здесь была бы навигация к статье
                  console.log('Navigate to article:', relatedArticle.id);
                }}
              >
                {relatedArticle.imageUrl && (
                  <img 
                    src={relatedArticle.imageUrl} 
                    alt={relatedArticle.titleUk}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                )}
                <h4 className="font-semibold mb-2 line-clamp-2">{relatedArticle.titleUk}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {relatedArticle.excerptUk}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{relatedArticle.readingTime} хв</span>
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(relatedArticle.category.id)}
                    <span>{relatedArticle.category.nameUk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Информация об источнике */}
      {article.isCurated && article.sourceUrl && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Джерело:</p>
              <p className="font-medium">{article.sourceName}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(article.sourceUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Перейти до джерела
            </Button>
          </div>
        </Card>
      )}

      {/* Статистика статьи */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{article.views} переглядів</span>
            <span>{article.likes} вподобань</span>
            <span>{article.saves} збережень</span>
          </div>
          <div>
            Опубліковано {new Date(article.publishedAt).toLocaleDateString('uk-UA')}
          </div>
        </div>
      </Card>
    </div>
  );
}
