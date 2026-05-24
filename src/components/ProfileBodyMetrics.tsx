import { Edit3, Target, Scale, Ruler, Calculator, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useState } from "react";

interface BodyMetricsData {
  weight: number;
  height: number;
  bmi: number;
  targetWeight: number;
  weightChange: number;
  lastUpdated: string;
}

interface ProfileBodyMetricsProps {
  metrics: BodyMetricsData;
  onUpdateMetrics: (newMetrics: Partial<BodyMetricsData>) => void;
}

export function ProfileBodyMetrics({ metrics, onUpdateMetrics }: ProfileBodyMetricsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    weight: metrics.weight.toString(),
    height: metrics.height.toString(),
    targetWeight: metrics.targetWeight.toString()
  });

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Недостаток веса", color: "text-blue-400" };
    if (bmi < 25) return { label: "Нормальный вес", color: "text-green-400" };
    if (bmi < 30) return { label: "Избыточный вес", color: "text-orange-400" };
    return { label: "Ожирение", color: "text-red-400" };
  };

  const getWeightTrend = (change: number) => {
    if (change > 0) return { icon: TrendingUp, color: "text-red-400", label: "Увеличение" };
    if (change < 0) return { icon: TrendingDown, color: "text-green-400", label: "Снижение" };
    return { icon: TrendingDown, color: "text-gray-400", label: "Без изменений" };
  };

  const handleSave = () => {
    const newMetrics = {
      weight: parseFloat(editData.weight),
      height: parseFloat(editData.height),
      targetWeight: parseFloat(editData.targetWeight)
    };
    
    // Calculate BMI
    const heightInMeters = newMetrics.height / 100;
    newMetrics.bmi = newMetrics.weight / (heightInMeters * heightInMeters);
    
    // Calculate weight change
    newMetrics.weightChange = newMetrics.weight - metrics.weight;
    newMetrics.lastUpdated = new Date().toISOString();
    
    onUpdateMetrics(newMetrics);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      weight: metrics.weight.toString(),
      height: metrics.height.toString(),
      targetWeight: metrics.targetWeight.toString()
    });
    setIsEditing(false);
  };

  const bmiCategory = getBMICategory(metrics.bmi);
  const weightTrend = getWeightTrend(metrics.weightChange);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Мои параметры</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? "Отмена" : "Редактировать"}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium">Вес (кг)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={editData.weight}
                    onChange={(e) => setEditData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="70"
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-medium">Рост (см)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={editData.height}
                    onChange={(e) => setEditData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="175"
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight" className="text-sm font-medium">Целевой вес (кг)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    value={editData.targetWeight}
                    onChange={(e) => setEditData(prev => ({ ...prev, targetWeight: e.target.value }))}
                    placeholder="65"
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Target className="w-4 h-4" />
                  Сохранить
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Weight */}
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Вес</p>
                    <p className="text-xl font-bold text-foreground">{metrics.weight} кг</p>
                    {metrics.weightChange !== 0 && (
                      <div className={`flex items-center gap-1 text-xs ${weightTrend.color}`}>
                        <weightTrend.icon className="w-3 h-3" />
                        <span>{Math.abs(metrics.weightChange).toFixed(1)} кг</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Height */}
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Рост</p>
                    <p className="text-xl font-bold text-foreground">{metrics.height} см</p>
                  </div>
                </div>
              </div>

              {/* BMI */}
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ИМТ</p>
                    <p className="text-xl font-bold text-foreground">{metrics.bmi.toFixed(1)}</p>
                    <p className={`text-xs ${bmiCategory.color}`}>{bmiCategory.label}</p>
                  </div>
                </div>
              </div>

              {/* Target Weight */}
              <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Цель</p>
                    <p className="text-xl font-bold text-foreground">{metrics.targetWeight} кг</p>
                    <p className="text-xs text-muted-foreground">
                      Осталось: {(metrics.weight - metrics.targetWeight).toFixed(1)} кг
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center">
            Последнее обновление: {new Date(metrics.lastUpdated).toLocaleDateString('uk-UA')}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
