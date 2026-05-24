import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card } from "@/components/ui/card";
import { Moon, Clock, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface SleepData {
  lastNight: number;
  average: number;
  target: number;
  history: Array<{
    date: string;
    hours: number;
  }>;
}

interface SleepChartProps {
  data: SleepData;
}

export function SleepChart({ data }: SleepChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' });
  };

  const lastNightProgress = (data.lastNight / data.target) * 100;
  const averageProgress = (data.average / data.target) * 100;

  const getSleepQuality = (hours: number) => {
    if (hours >= 8) return { label: "Відмінний", color: "text-green-400" };
    if (hours >= 7) return { label: "Хороший", color: "text-blue-400" };
    if (hours >= 6) return { label: "Задовільний", color: "text-orange-400" };
    return { label: "Недостатній", color: "text-red-400" };
  };

  const lastNightQuality = getSleepQuality(data.lastNight);
  const averageQuality = getSleepQuality(data.average);

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Сон минулої ночі</p>
                <p className="text-xl font-bold text-foreground">{data.lastNight} ч</p>
                <p className={`text-xs ${lastNightQuality.color}`}>
                  {lastNightQuality.label}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Середній сон</p>
                <p className="text-xl font-bold text-foreground">{data.average.toFixed(1)} ч</p>
                <p className={`text-xs ${averageQuality.color}`}>
                  {averageQuality.label}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Цільовий сон</p>
                <p className="text-xl font-bold text-foreground">{data.target} ч</p>
                <p className="text-xs text-muted-foreground">
                  {data.average >= data.target ? "Мета досягнута!" : "В процесі"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Sleep Quality Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Якість сну</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Минула ніч</span>
                  <span className="text-sm text-muted-foreground">{Math.round(lastNightProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(lastNightProgress, 100)}%` }}
                  />
                </div>
                <p className={`text-xs ${lastNightQuality.color}`}>
                  {lastNightQuality.label} сон
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Середнє за тиждень</span>
                  <span className="text-sm text-muted-foreground">{Math.round(averageProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(averageProgress, 100)}%` }}
                  />
                </div>
                <p className={`text-xs ${averageQuality.color}`}>
                  {averageQuality.label} сон
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Sleep History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Історія сну</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={[0, 10]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelFormatter={(value) => `Дата: ${formatDate(value)}`}
                    formatter={(value: number) => [`${value.toFixed(1)} ч`, 'Сон']}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#sleepGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Target Line */}
            <div className="flex items-center justify-center pt-4 border-t border-muted/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Рекомендована норма сну</p>
                <p className="text-2xl font-bold text-purple-400">{data.target} годин</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
