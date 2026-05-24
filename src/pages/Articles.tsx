import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Apple,
  Dumbbell,
  Moon,
  Zap,
  ChefHat,
  Brain,
  Shield,
  Pill,
  Microscope,
  Target
} from "lucide-react";
import { useState, useMemo } from "react";
import { useArticles } from "@/hooks/useArticles";
import { ArticleAnalytics } from "@/components/ArticleAnalytics";
import { ArticleReader } from "@/components/ArticleReader";
import { CreateArticleModal } from "@/components/CreateArticleModal";
import { Article } from "@/lib/article-types";

// New components
import { ArticlesHeaderBar } from "@/components/ArticlesHeaderBar";
import { ArticlesUserInsightBanner } from "@/components/ArticlesUserInsightBanner";
import { ArticlesTabsNavigation } from "@/components/ArticlesTabsNavigation";
import { ArticlesPersonalizedFeed } from "@/components/ArticlesPersonalizedFeed";
import { ArticlesTrendingSection } from "@/components/ArticlesTrendingSection";
import { ArticlesArticleCard } from "@/components/ArticlesArticleCard";
import { ArticlesSidebar } from "@/components/ArticlesSidebar";
import { ArticlesBottomStats } from "@/components/ArticlesBottomStats";

export default function Articles() {
  const { 
    allArticles, 
    allCategories, 
    getArticlesByCategory, 
    getFeaturedArticles, 
    getRecentArticles, 
    searchArticles,
    getPopularArticles,
    savedArticles,
    isArticleSaved,
    saveArticle,
    likeArticle,
    isArticleLiked
  } = useArticles();

  const [activeTab, setActiveTab] = useState<"feed" | "categories" | "saved" | "analytics">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">("recent");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showReader, setShowReader] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Фильтрация и поиск статей
  const filteredArticles = useMemo(() => {
    let articles = allArticles;

    // Поиск
    if (searchQuery) {
      articles = searchArticles(searchQuery);
    }

    // Фильтр по категории
    if (selectedCategory && selectedCategory !== "all") {
      articles = articles.filter(article => article.category.id === selectedCategory);
    }
    
    // Сортировка
      switch (sortBy) {
      case "popular":
        articles = articles.sort((a, b) => (b.views + b.likes + b.saves) - (a.views + a.likes + a.saves));
        break;
      case "trending":
        articles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case "recent":
        default:
        articles = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
    }

    return articles;
  }, [allArticles, searchQuery, selectedCategory, sortBy, searchArticles]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setShowReader(true);
  };

  const handleCloseReader = () => {
    setShowReader(false);
    setSelectedArticle(null);
  };

  // Helper functions
  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case 'nutrition': return "bg-green-500";
      case 'training': return "bg-blue-500";
      case 'recovery': return "bg-purple-500";
      case 'motivation': return "bg-orange-500";
      case 'recipes': return "bg-red-500";
      case 'science': return "bg-cyan-500";
      case 'supplements': return "bg-yellow-500";
      case 'mental_health': return "bg-pink-500";
      case 'injury_prevention': return "bg-indigo-500";
      default: return "bg-gray-500";
    }
  };

  // Computed values for new components
  const personalizedArticles = useMemo(() => {
    return allArticles.slice(0, 5);
  }, [allArticles]);

  const trendingArticles = useMemo(() => {
    return allArticles
      .sort((a, b) => (b.views + b.likes + b.saves) - (a.views + a.likes + a.saves))
      .slice(0, 4);
  }, [allArticles]);

  const newArticles = useMemo(() => {
    return allArticles
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 4);
  }, [allArticles]);

  const recommendedTopics = useMemo(() => {
    return allCategories.map(category => ({
      id: category.id,
      name: category.nameUk,
      articleCount: allArticles.filter(article => article.category.id === category.id).length,
      color: getCategoryColor(category.id)
    })).filter(topic => topic.articleCount > 0).slice(0, 6);
  }, [allCategories, allArticles]);

  const userActivity = useMemo(() => {
    return {
      weeklyReads: Math.floor(Math.random() * 10) + 5, // Mock data
      favoriteCategory: allCategories[0]?.nameUk || "Тренування",
      readingStreak: Math.floor(Math.random() * 15) + 3 // Mock data
    };
  }, [allCategories]);

  const userStats = useMemo(() => {
    return {
      articlesRead: savedArticles.length + Math.floor(Math.random() * 20),
      readingStreak: userActivity.readingStreak,
      favoriteCategory: userActivity.favoriteCategory,
      weeklyGoal: 5,
      weeklyProgress: userActivity.weeklyReads
    };
  }, [savedArticles, userActivity]);

  // Handlers
  const handleCreateArticle = () => {
    setShowCreateModal(true);
  };

  const handleOpenSettings = () => {
    // TODO: Implement settings
    console.log("Open settings");
  };

  const handleTopicClick = (topicId: string) => {
    if (topicId === 'trending') {
      setSortBy('popular');
      setActiveTab('categories');
    } else if (topicId === 'recent') {
      setSortBy('recent');
      setActiveTab('categories');
    } else if (topicId === 'saved') {
      setActiveTab('saved');
    } else {
      setSelectedCategory(topicId);
      setActiveTab('categories');
    }
  };

  const handleViewAnalytics = () => {
    setActiveTab('analytics');
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

  const getTabContent = () => {
    switch (activeTab) {
      case "feed":
  return (
          <div className="space-y-6">
            <ArticlesUserInsightBanner
              articlesRead={userStats.articlesRead}
              readingStreak={userStats.readingStreak}
              favoriteCategory={userStats.favoriteCategory}
              weeklyGoal={userStats.weeklyGoal}
              weeklyProgress={userStats.weeklyProgress}
            />
            
            <ArticlesPersonalizedFeed
              articles={personalizedArticles}
              onArticleClick={handleArticleClick}
              onViewAll={() => setActiveTab('categories')}
            />
            
            <ArticlesTrendingSection
              trendingArticles={trendingArticles}
              newArticles={newArticles}
              onArticleClick={handleArticleClick}
              onViewAllTrending={() => {
                setSortBy('popular');
                setActiveTab('categories');
              }}
              onViewAllNew={() => {
                setSortBy('recent');
                setActiveTab('categories');
              }}
            />
          </div>
        );
        
      case "categories":
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-4 md:p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Пошук статей..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-base bg-card/50 border-muted/30"
                          />
                        </div>
                      </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48 h-12 bg-card/50 border-muted/30">
                        <SelectValue placeholder="Всі категорії" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всі категорії</SelectItem>
                          {allCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(category.id)}
                                {category.nameUk}
                              </div>
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full md:w-48 h-12 bg-card/50 border-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="recent">Нещодавні</SelectItem>
                          <SelectItem value="popular">Популярні</SelectItem>
                          <SelectItem value="trending">Трендові</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                </Card>

            {/* Articles List */}
                <div className="space-y-4">
                  {filteredArticles.map(article => (
                <ArticlesArticleCard
                      key={article.id} 
                  article={article}
                  isLiked={isArticleLiked(article.id)}
                  isSaved={isArticleSaved(article.id)}
                  onArticleClick={handleArticleClick}
                  onLike={likeArticle}
                  onSave={saveArticle}
                />
                                  ))}
                                </div>

            {/* Empty State */}
                {filteredArticles.length === 0 && (
              <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                                </div>
                      <div>
                        <h3 className="text-lg font-semibold">Статті не знайдено</h3>
                        <p className="text-muted-foreground">
                          Спробуйте змінити пошуковий запит або фільтри
                        </p>
                          </div>
                        </div>
                      </Card>
              )}
          </div>
        );

      case "saved":
        return (
                <div className="space-y-4">
                  {savedArticles.length > 0 ? (
                    savedArticles.map(article => (
                <ArticlesArticleCard
                        key={article.id} 
                  article={article}
                  isLiked={isArticleLiked(article.id)}
                  isSaved={isArticleSaved(article.id)}
                  onArticleClick={handleArticleClick}
                  onLike={likeArticle}
                  onSave={saveArticle}
                  variant="compact"
                />
                    ))
                  ) : (
              <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
                  <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                          <h3 className="text-lg font-semibold">Немає збережених статей</h3>
                          <p className="text-muted-foreground">
                            Зберігайте статті, які вас цікавлять, для подальшого читання
                          </p>
                    </div>
                  </div>
                </Card>
              )}
                </div>
        );
        
      case "analytics":
        return <ArticleAnalytics />;
        
      default:
        return null;
    }
  };

  if (showReader && selectedArticle) {
    return <ArticleReader article={selectedArticle} onClose={handleCloseReader} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Боковая панель */}
        <DashboardSidebar />
        
        {/* Основной контент */}
        <div className="flex-1 lg:ml-64">
          {/* Мобильный заголовок */}
          <MobileHeader />
          
          <div className="p-4 lg:p-8">
            {/* Header */}
            <ArticlesHeaderBar
              onCreateArticle={handleCreateArticle}
              onOpenSettings={handleOpenSettings}
            />

            {/* Tabs Navigation */}
            <ArticlesTabsNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {getTabContent()}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <ArticlesSidebar
                  recommendedTopics={recommendedTopics}
                  userActivity={userActivity}
                  onTopicClick={handleTopicClick}
                />
              </div>
            </div>

            {/* Bottom Stats */}
            {activeTab === "feed" && (
              <div className="mt-8">
                <ArticlesBottomStats
                  totalArticlesRead={userStats.articlesRead}
                  weeklyGoal={userStats.weeklyGoal}
                  weeklyProgress={userStats.weeklyProgress}
                  readingStreak={userStats.readingStreak}
                  onViewAnalytics={handleViewAnalytics}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Мобильная навигация */}
        <MobileBottomNav />

      {/* Create Article Modal */}
      {showCreateModal && (
        <CreateArticleModal 
          onArticleCreated={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}