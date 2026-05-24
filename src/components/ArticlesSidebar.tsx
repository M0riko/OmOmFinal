import { TrendingUp, Users, Target, BookOpen, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ArticlesSidebarProps {
  recommendedTopics: Array<{
    id: string;
    name: string;
    articleCount: number;
    color: string;
  }>;
  userActivity: {
    weeklyReads: number;
    favoriteCategory: string;
    readingStreak: number;
  };
  onTopicClick: (topicId: string) => void;
}

export function ArticlesSidebar({ 
  recommendedTopics, 
  userActivity, 
  onTopicClick 
}: ArticlesSidebarProps) {
  const cardVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Recommended Topics */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Рекомендовані теми</h3>
            </div>
            
            <div className="space-y-3">
              {recommendedTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto hover:bg-muted/50"
                    onClick={() => onTopicClick(topic.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${topic.color}`} />
                      <span className="text-sm font-medium text-foreground">{topic.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-muted/50">
                      {topic.articleCount}
                    </Badge>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* User Activity */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-foreground">Ваша активність</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Прочитано цього тижня</span>
                </div>
                <span className="font-semibold text-foreground">{userActivity.weeklyReads}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Улюблена категорія</span>
                </div>
                <span className="font-semibold text-foreground">{userActivity.favoriteCategory}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Серія читання</span>
                </div>
                <span className="font-semibold text-foreground">{userActivity.readingStreak} днів</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Швидкі дії</h3>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => onTopicClick('trending')}
              >
                <TrendingUp className="w-4 h-4" />
                Популярні статті
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => onTopicClick('recent')}
              >
                <Clock className="w-4 h-4" />
                Останні публікації
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => onTopicClick('saved')}
              >
                <BookOpen className="w-4 h-4" />
                Збережені статті
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
