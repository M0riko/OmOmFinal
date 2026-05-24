import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Sparkles, 
  Loader2, 
  Info, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  Lightbulb,
  Package,
  Calendar,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { getGeminiService, ProductAnalysisRequest, ProductAnalysis } from "@/lib/gemini-ai";

interface AIProductAnalyzerProps {
  onProductAnalyzed?: (analysis: ProductAnalysis) => void;
  onAddToFavorites?: (product: any) => void;
}

export function AIProductAnalyzer({ onProductAnalyzed, onAddToFavorites }: AIProductAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const categoryOptions = [
    "М'ясо та риба",
    "Молочні продукти", 
    "Фрукти та овочі",
    "Крупи та злаки",
    "Хлібобулочні вироби",
    "Кондитерські вироби",
    "Напої",
    "Консерви",
    "Заморожені продукти",
    "Спеції та приправи",
    "Олії та жири",
    "Горіхи та сухофрукти"
  ];

  const analyzeProduct = async () => {
    if (!productName.trim()) {
      toast.error("Введите название продукта");
      return;
    }

    setIsAnalyzing(true);
    try {
      const geminiService = getGeminiService();
      
      const request: ProductAnalysisRequest = {
        productName: productName.trim(),
        category: category || undefined,
        brand: brand || undefined
      };

      const productAnalysis = await geminiService.analyzeProduct(request);
      setAnalysis(productAnalysis);
      onProductAnalyzed?.(productAnalysis);
      toast.success("Анализ продукта завершен!");
    } catch (error) {
      console.error("Error analyzing product:", error);
      toast.error("Ошибка при анализе продукта. Попробуйте еще раз.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyAnalysis = () => {
    if (!analysis) return;
    
    const analysisText = `
Анализ продукта: ${productName}

Категория: ${analysis.category}
Описание: ${analysis.description}

Советы по хранению:
${analysis.storageAdvice}

Примерный срок годности: ${analysis.estimatedExpiry}

Советы по питанию:
${analysis.nutritionTips.map(tip => `• ${tip}`).join('\n')}

Польза для здоровья:
${analysis.healthBenefits.map(benefit => `• ${benefit}`).join('\n')}

Предупреждения:
${analysis.warnings.map(warning => `• ${warning}`).join('\n')}

Альтернативы:
${analysis.alternatives.map(alt => `• ${alt}`).join('\n')}
`;

    navigator.clipboard.writeText(analysisText);
    toast.success("Анализ скопирован в буфер обмена!");
  };

  return (
    <div className="space-y-6">
      {/* AI Product Analyzer Card */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900">AI Анализатор Продуктов</h3>
            <p className="text-sm text-green-700">
              Получайте подробную информацию о продуктах питания
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Название продукта *</Label>
              <Input
                placeholder="Например: куриная грудка, яблоко, молоко..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeProduct()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Категория</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Бренд</Label>
              <Input
                placeholder="Например: Наша Ряба, Молочный край..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={analyzeProduct}
            disabled={isAnalyzing || !productName.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Анализируем продукт...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Анализировать продукт
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">Анализ: {productName}</h3>
                <Badge variant="secondary" className="mt-1">{analysis.category}</Badge>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={copyAnalysis}>
              <Package className="w-4 h-4 mr-2" />
              Копировать
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Описание
                </h4>
                <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg">
                  {analysis.description}
                </p>
              </div>

              {/* Storage Advice */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Советы по хранению
                </h4>
                <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg">
                  {analysis.storageAdvice}
                </p>
              </div>

              {/* Expiry */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Срок годности
                </h4>
                <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg">
                  {analysis.estimatedExpiry}
                </p>
              </div>

              {/* Nutrition Tips */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Советы по питанию
                </h4>
                <div className="space-y-2">
                  {analysis.nutritionTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Health Benefits */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Польза для здоровья
                </h4>
                <div className="space-y-2">
                  {analysis.healthBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {analysis.warnings.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Предупреждения
                  </h4>
                  <div className="space-y-2">
                    {analysis.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-700">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Альтернативы
                </h4>
                <div className="space-y-2">
                  {analysis.alternatives.map((alternative, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                      <Package className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{alternative}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => onAddToFavorites?.({
                name: productName,
                category: analysis.category,
                description: analysis.description,
                analysis: analysis
              })}
              className="flex-1"
            >
              <Heart className="w-4 h-4 mr-2" />
              Добавить в избранное
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setProductName("");
                setCategory("");
                setBrand("");
                setAnalysis(null);
              }}
              className="flex-1"
            >
              Анализировать другой продукт
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

