import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card } from "@/components/ui/card";
import { Droplets, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface WaterData {
  today: number;
  target: number;
  history: Array<{
    date: string;
    amount: number;
  }>;
}

interface WaterChartProps {
  data: WaterData;
}

export function WaterChart({ data }: WaterChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' });
  };

  const progress = (data.today / data.target) * 100;
  const average = data.history.reduce((sum, day) => sum + day.amount, 0) / data.history.length;

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Випито сьогодні</p>
                <p className="text-xl font-bold text-foreground">{data.today} л</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(progress)}% від цілі
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
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Цільова кількість</p>
                <p className="text-xl font-bold text-foreground">{data.target} л</p>
                <p className="text-xs text-muted-foreground">
                  Залишилося: {(data.target - data.today).toFixed(1)} л
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
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Середнє за тиждень</p>
                <p className="text-xl font-bold text-foreground">{average.toFixed(1)} л</p>
                <p className="text-xs text-muted-foreground">
                  {average >= data.target ? "Мета досягнута!" : "В процесі"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Progress Ring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Прогрес сьогодні</h3>
            
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#06B6D4"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{Math.round(progress)}%</p>
                    <p className="text-sm text-muted-foreground">{data.today} / {data.target} л</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Історія споживання води</h3>
            
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
                    formatter={(value: number) => [`${value.toFixed(1)} л`, 'Вода']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#06B6D4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Target Line */}
            <div className="flex items-center justify-center pt-4 border-t border-muted/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Рекомендована норма</p>
                <p className="text-2xl font-bold text-cyan-400">{data.target} л/день</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
