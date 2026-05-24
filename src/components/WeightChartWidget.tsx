import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Plus, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightChartWidgetProps {
  currentWeight?: number;
}

export function WeightChartWidget({ currentWeight = 70 }: WeightChartWidgetProps) {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Загружаем данные из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weight_entries');
    if (saved) {
      setWeightEntries(JSON.parse(saved));
    } else {
      // Создаем демо-данные
      const demoData = generateDemoData();
      setWeightEntries(demoData);
    }
  }, []);

  // Сохраняем данные в localStorage
  useEffect(() => {
    localStorage.setItem('weight_entries', JSON.stringify(weightEntries));
  }, [weightEntries]);

  const generateDemoData = (): WeightEntry[] => {
    const data: WeightEntry[] = [];
    const today = new Date();
    const baseWeight = currentWeight;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const weight = baseWeight + (Math.random() - 0.5) * 0.5; // ±0.25 кг
      data.push({
        date: date.toISOString().split('T')[0],
        weight: Math.round(weight * 10) / 10
      });
    }
    return data;
  };

  const addWeightEntry = () => {
    const weight = parseFloat(newWeight);
    if (weight > 0) {
      const today = new Date().toISOString().split('T')[0];
      const newEntry: WeightEntry = { date: today, weight };
      
      setWeightEntries(prev => {
        const filtered = prev.filter(entry => entry.date !== today);
        return [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
      });
      
      setNewWeight('');
      setIsDialogOpen(false);
    }
  };

  const getFilteredData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return weightEntries.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );
  };

  const getWeightChange = () => {
    const data = getFilteredData();
    if (data.length < 2) return null;
    
    const first = data[0].weight;
    const last = data[data.length - 1].weight;
    const change = last - first;
    
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      percentage: Math.abs((change / first) * 100)
    };
  };

  const getMinMaxWeight = () => {
    const data = getFilteredData();
    if (data.length === 0) return { min: 0, max: 0 };
    
    const weights = data.map(entry => entry.weight);
    return {
      min: Math.min(...weights),
      max: Math.max(...weights)
    };
  };

  const renderSimpleChart = () => {
    const data = getFilteredData();
    if (data.length === 0) return null;

    const { min, max } = getMinMaxWeight();
    const range = max - min || 1;

    return (
      <div className="flex items-end justify-between h-20 gap-1">
        {data.map((entry, index) => {
          const height = ((entry.weight - min) / range) * 100;
          return (
            <div key={entry.date} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-primary rounded-t-sm transition-all duration-300"
                style={{ height: `${height}%` }}
                title={`${entry.date}: ${entry.weight} кг`}
              />
              <span className="text-xs text-muted-foreground mt-1">
                {new Date(entry.date).getDate()}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const weightChange = getWeightChange();
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : currentWeight;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold">Вес</h3>
        </div>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className="h-6 text-xs px-2"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Текущий вес и изменение */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{latestWeight} кг</span>
          {weightChange && (
            <div className={`flex items-center gap-1 text-sm ${
              weightChange.isPositive ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
            }`}>
              {weightChange.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {weightChange.isPositive ? '+' : '-'}{weightChange.value.toFixed(1)} кг
              </span>
            </div>
          )}
        </div>
        {weightChange && (
          <p className="text-xs text-muted-foreground">
            За {timeRange === '7d' ? '7 дней' : timeRange === '30d' ? '30 дней' : '90 дней'}
          </p>
        )}
      </div>

      {/* Простой график */}
      <div className="mb-4">
        {renderSimpleChart()}
      </div>

      {/* Кнопка добавления */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Добавить вес
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый вес</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Вес (кг)</label>
              <Input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="70.5"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addWeightEntry} className="flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
