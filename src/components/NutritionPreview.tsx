import { Flame, Target, Zap, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NutritionPreviewProps {
  product: any;
  grams: number;
  onGramsChange: (grams: number) => void;
  macros: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
  isCustom?: boolean;
}

export function NutritionPreview({ 
  product, 
  grams, 
  onGramsChange, 
  macros, 
  isCustom = false 
}: NutritionPreviewProps) {
  const quickAmounts = [50, 100, 150, 200];

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-lg text-foreground">Поживна цінність</h4>
          </div>
          <div className="flex gap-2">
            {isCustom ? (
              <Badge className="bg-green-500 text-white border-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Мої продукти
              </Badge>
            ) : (
              <Badge className="bg-blue-500 text-white border-0">
                <Target className="w-3 h-3 mr-1" />
                FatSecret
              </Badge>
            )}
          </div>
        </div>

        {/* Quantity Input */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Кількість (грами)</label>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="100"
              value={grams}
              onChange={(e) => onGramsChange(Number(e.target.value) || 0)}
              className="flex-1 h-12 text-base border-2 focus:border-primary/50"
              min="1"
            />
            <div className="flex gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={grams === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => onGramsChange(amount)}
                  className={cn(
                    "h-12 px-4 font-medium transition-all duration-300",
                    grams === amount 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "hover:bg-primary/10"
                  )}
                >
                  {amount}г
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
            <div className="text-2xl font-bold text-primary mb-1">
              {Math.round(macros.calories)}
            </div>
            <div className="text-xs text-primary/80 font-semibold">Ккал</div>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(macros.protein)}г
            </div>
            <div className="text-xs text-blue-600/80 font-semibold">Білки</div>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {Math.round(macros.fats)}г
            </div>
            <div className="text-xs text-yellow-600/80 font-semibold">Жири</div>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(macros.carbs)}г
            </div>
            <div className="text-xs text-green-600/80 font-semibold">Вуглеводи</div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg">
            {isCustom ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Точні дані • {grams}г
                </span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Дані з FatSecret API • {grams}г
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
