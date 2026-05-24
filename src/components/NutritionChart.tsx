import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { Card } from "@/components/ui/card";
import { Utensils, Target, TrendingUp, Apple } from "lucide-react";
import { motion } from "framer-motion";

interface NutritionData {
  dailyCalories: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  history: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

interface NutritionChartProps {
  data: NutritionData;
}

export function NutritionChart({ data }: NutritionChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' });
  };

  const macroData = [
    { name: 'Білки', value: data.macros.protein, color: '#3B82F6' },
    { name: 'Вуглеводи', value: data.macros.carbs, color: '#10B981' },
    { name: 'Жири', value: data.macros.fat, color: '#F59E0B' }
  ];

  const caloriesProgress = (data.dailyCalories / data.targetCalories) * 100;

  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Калорії сьогодні</p>
                <p className="text-xl font-bold text-foreground">{data.dailyCalories}</p>
                <p className="text-xs text-muted-foreground">
                  з {data.targetCalories} ккал
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
                <p className="text-sm text-muted-foreground">Прогрес</p>
                <p className="text-xl font-bold text-foreground">{Math.round(caloriesProgress)}%</p>
                <p className="text-xs text-muted-foreground">
                  {caloriesProgress >= 100 ? "Мета досягнута!" : "В процесі"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Macros Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Розподіл макронутрієнтів</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {macroData.map((macro, index) => (
                  <div key={macro.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: macro.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{macro.name}</span>
                        <span className="text-sm text-muted-foreground">{macro.value}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${macro.value}%`,
                            backgroundColor: macro.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Calories History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Історія калорій</h3>
            
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
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Target Line */}
            <div className="flex items-center justify-center pt-4 border-t border-muted/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Цільові калорії</p>
                <p className="text-2xl font-bold text-green-400">{data.targetCalories} ккал/день</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
