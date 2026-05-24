import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts";
import { Card } from "@/components/ui/card";
import { Dumbbell, Clock, Zap, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface WorkoutData {
  thisWeek: number;
  lastWeek: number;
  totalTime: number;
  caloriesBurned: number;
  history: Array<{
    date: string;
    duration: number;
    calories: number;
  }>;
}

interface WorkoutTrendsProps {
  data: WorkoutData;
}

export function WorkoutTrends({ data }: WorkoutTrendsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' });
  };

  const weeklyChange = data.thisWeek - data.lastWeek;
  const weeklyChangePercent = data.lastWeek > 0 ? (weeklyChange / data.lastWeek) * 100 : 0;

  const getChangeColor = (change: number) => {
    return change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-400";
  };

  const getChangeIcon = (change: number) => {
    return change > 0 ? TrendingUp : TrendingUp; // Can add TrendingDown if needed
  };

  const ChangeIcon = getChangeIcon(weeklyChange);

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Тренувань на тиждень</p>
                <p className="text-xl font-bold text-foreground">{data.thisWeek}</p>
                <div className={`flex items-center gap-1 text-xs ${getChangeColor(weeklyChange)}`}>
                  <ChangeIcon className="w-3 h-3" />
                  <span>{Math.abs(weeklyChangePercent).toFixed(1)}%</span>
                </div>
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
                <p className="text-sm text-muted-foreground">Загальний час</p>
                <p className="text-xl font-bold text-foreground">{data.totalTime} хв</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(data.totalTime / 60)} годин
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
          <Card className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Калорій спалено</p>
                <p className="text-xl font-bold text-foreground">{data.caloriesBurned}</p>
                <p className="text-xs text-muted-foreground">цього тижня</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Середній час</p>
                <p className="text-xl font-bold text-foreground">
                  {data.thisWeek > 0 ? Math.round(data.totalTime / data.thisWeek) : 0} хв
                </p>
                <p className="text-xs text-muted-foreground">за тренування</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Duration Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Тривалість тренувань</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelFormatter={(value) => `Дата: ${formatDate(value)}`}
                    formatter={(value: number) => [`${value} хв`, 'Тривалість']}
                  />
                  <Area
                    type="monotone"
                    dataKey="duration"
                    stroke="#F97316"
                    strokeWidth={2}
                    fill="url(#durationGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Calories Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Калорії за тренування</h3>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.history}>
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelFormatter={(value) => `Дата: ${formatDate(value)}`}
                    formatter={(value: number) => [`${value.toFixed(0)} ккал`, 'Калорії']}
                  />
                  <Bar 
                    dataKey="calories" 
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
