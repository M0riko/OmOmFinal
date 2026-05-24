import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Target, Scale } from "lucide-react";
import { motion } from "framer-motion";

interface WeightData {
  current: number;
  target: number;
  history: Array<{
    date: string;
    weight: number;
  }>;
  trend: number;
  bmi: number;
}

interface WeightChartProps {
  data: WeightData;
}

export function WeightChart({ data }: WeightChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' });
  };

  const getTrendIcon = (trend: number) => {
    return trend < 0 ? TrendingDown : TrendingUp;
  };

  const getTrendColor = (trend: number) => {
    return trend < 0 ? "text-green-400" : "text-red-400";
  };

  const getTrendLabel = (trend: number) => {
    return trend < 0 ? "Зниження" : "Збільшення";
  };

  const TrendIcon = getTrendIcon(data.trend);

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Поточна вага</p>
                <p className="text-xl font-bold text-foreground">{data.current} кг</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Цільова вага</p>
                <p className="text-xl font-bold text-foreground">{data.target} кг</p>
                <p className="text-xs text-muted-foreground">
                  Залишилося: {(data.current - data.target).toFixed(1)} кг
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
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <TrendIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Тренд</p>
                <p className={`text-xl font-bold ${getTrendColor(data.trend)}`}>
                  {Math.abs(data.trend).toFixed(1)} кг/нед
                </p>
                <p className={`text-xs ${getTrendColor(data.trend)}`}>
                  {getTrendLabel(data.trend)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Динамика веса</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">Вес</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">Цель</span>
                </div>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
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
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelFormatter={(value) => `Дата: ${formatDate(value)}`}
                    formatter={(value: number) => [`${value.toFixed(1)} кг`, 'Вага']}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#weightGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Target Line */}
            <div className="flex items-center justify-center pt-4 border-t border-muted/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Цільова вага</p>
                <p className="text-2xl font-bold text-green-400">{data.target} кг</p>
                <p className="text-xs text-muted-foreground">
                  ІМТ: {data.bmi.toFixed(1)} (Нормальна вага)
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
