import { Trophy, Target, Zap, Clock, TrendingUp, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface PersonalRecord {
  id: string;
  title: string;
  value: string;
  unit: string;
  category: "strength" | "endurance" | "speed" | "flexibility";
  date: string;
  previousRecord?: string;
  improvement?: number;
  icon: any;
}

interface ProfilePersonalRecordsProps {
  records: PersonalRecord[];
}

export function ProfilePersonalRecords({ records }: ProfilePersonalRecordsProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "strength": return "from-red-500 to-red-600";
      case "endurance": return "from-blue-500 to-blue-600";
      case "speed": return "from-green-500 to-green-600";
      case "flexibility": return "from-purple-500 to-purple-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case "strength": return "from-red-500/10 to-red-500/5";
      case "endurance": return "from-blue-500/10 to-blue-500/5";
      case "speed": return "from-green-500/10 to-green-500/5";
      case "flexibility": return "from-purple-500/10 to-purple-500/5";
      default: return "from-gray-500/10 to-gray-500/5";
    }
  };

  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case "strength": return "border-red-500/30";
      case "endurance": return "border-blue-500/30";
      case "speed": return "border-green-500/30";
      case "flexibility": return "border-purple-500/30";
      default: return "border-gray-500/30";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "strength": return "Сила";
      case "endurance": return "Выносливость";
      case "speed": return "Скорость";
      case "flexibility": return "Гибкость";
      default: return "Другое";
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-foreground">Личные рекорды</h3>
          </div>

          {records.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((record, index) => {
                const IconComponent = record.icon;
                
                return (
                  <motion.div
                    key={record.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`p-4 bg-gradient-to-br border-2 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${getCategoryBgColor(record.category)} ${getCategoryBorderColor(record.category)}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center shadow-lg ${getCategoryColor(record.category)}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <Badge variant="outline" className="text-xs bg-muted/50">
                            {getCategoryLabel(record.category)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">{record.title}</h4>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-foreground">{record.value}</span>
                            <span className="text-sm text-muted-foreground">{record.unit}</span>
                          </div>
                          
                          {record.improvement && record.improvement > 0 && (
                            <div className="flex items-center gap-1 text-green-400">
                              <TrendingUp className="w-3 h-3" />
                              <span className="text-xs font-medium">+{record.improvement}%</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(record.date).toLocaleDateString('uk-UA')}</span>
                          </div>
                          
                          {record.previousRecord && (
                            <div className="text-xs text-muted-foreground">
                              Предыдущий: {record.previousRecord} {record.unit}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Пока нет рекордов</h4>
              <p className="text-muted-foreground">
                Начните тренироваться, чтобы установить свои первые рекорды!
              </p>
            </div>
          )}

          {/* Summary Stats */}
          {records.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-muted/20"
            >
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{records.length}</div>
                <div className="text-xs text-muted-foreground">Всего рекордов</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {records.filter(r => r.improvement && r.improvement > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">Улучшений</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {new Set(records.map(r => r.category)).size}
                </div>
                <div className="text-xs text-muted-foreground">Категорий</div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
