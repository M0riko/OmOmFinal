import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Camera, 
  Barcode, 
  Zap, 
  Star, 
  Brain,
  Tag,
  FolderOpen,
  ChefHat,
  Globe
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export function PremierFeatures() {
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [barcodeResult, setBarcodeResult] = useState<any>(null);
  const [nlpQuery, setNlpQuery] = useState("");
  const [nlpResult, setNlpResult] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Autocomplete Search
  const handleAutocomplete = async (query: string) => {
    if (!query.trim()) {
      setAutocompleteResults([]);
      return;
    }

    setLoading("autocomplete");
    try {
      const results = await apiService.autocompleteSearch(query, 10);
      setAutocompleteResults(results);
    } catch (error) {
      toast.error("Помилка автодоповнення");
    } finally {
      setLoading(null);
    }
  };

  // Barcode Scanning
  const handleBarcodeScan = async () => {
    if (!barcode.trim()) {
      toast.error("Введіть штрих-код");
      return;
    }

    setLoading("barcode");
    try {
      const result = await apiService.scanBarcode(barcode);
      setBarcodeResult(result);
      if (result) {
        toast.success(`Знайдено: ${result.food_name}`);
      } else {
        toast.error("Продукт не знайдено");
      }
    } catch (error) {
      toast.error("Помилка сканування штрих-коду");
    } finally {
      setLoading(null);
    }
  };

  // Natural Language Processing
  const handleNLP = async () => {
    if (!nlpQuery.trim()) {
      toast.error("Введіть запит");
      return;
    }

    setLoading("nlp");
    try {
      const result = await apiService.processNaturalLanguageQuery(nlpQuery);
      setNlpResult(result);
      toast.success("Запит оброблено");
    } catch (error) {
      toast.error("Помилка обробки запиту");
    } finally {
      setLoading(null);
    }
  };

  // Image Recognition
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageResults, setImageResults] = useState<any[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleImageRecognition = async () => {
    if (!imageFile) {
      toast.error("Виберіть зображення");
      return;
    }

    setLoading("image");
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string;
          const results = await apiService.recognizeFoodFromImage(imageData);
          setImageResults(results);
          if (results.length > 0) {
            toast.success(`Розпізнано ${results.length} продуктів!`);
          } else {
            toast.info("Продукти не розпізнано на зображенні");
          }
        } catch (error) {
          toast.error("Помилка розпізнавання зображення");
        } finally {
          setLoading(null);
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      toast.error("Помилка завантаження зображення");
      setLoading(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold">Premier Функції</h2>
        <Badge variant="secondary" className="gap-1">
          <Star className="w-3 h-3" />
          Premium
        </Badge>
      </div>

      <Tabs defaultValue="autocomplete" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="autocomplete" className="gap-2">
            <Search className="w-4 h-4" />
            Автодоповнення
          </TabsTrigger>
          <TabsTrigger value="barcode" className="gap-2">
            <Barcode className="w-4 h-4" />
            Штрих-код
          </TabsTrigger>
          <TabsTrigger value="nlp" className="gap-2">
            <Brain className="w-4 h-4" />
            NLP
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <Camera className="w-4 h-4" />
            Зображення
          </TabsTrigger>
        </TabsList>

        <TabsContent value="autocomplete" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Автодоповнення пошуку</label>
            <Input
              placeholder="Почніть вводити назву продукту..."
              value={autocompleteQuery}
              onChange={(e) => {
                setAutocompleteQuery(e.target.value);
                handleAutocomplete(e.target.value);
              }}
            />
            {loading === "autocomplete" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 animate-pulse" />
                Пошук...
              </div>
            )}
            {autocompleteResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Результати:</h4>
                <div className="space-y-1">
                  {autocompleteResults.map((result, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      {result.text || result.name || JSON.stringify(result)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="barcode" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Сканування штрих-коду</label>
            <div className="flex gap-2">
              <Input
                placeholder="Введіть штрих-код..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
              <Button 
                onClick={handleBarcodeScan}
                disabled={loading === "barcode"}
                className="gap-2"
              >
                <Barcode className="w-4 h-4" />
                Сканувати
              </Button>
            </div>
            {loading === "barcode" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 animate-pulse" />
                Сканування...
              </div>
            )}
            {barcodeResult && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-medium text-green-800">Знайдено:</h4>
                <p className="text-green-700">{barcodeResult.food_name}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="nlp" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Обробка природної мови</label>
            <div className="space-y-2">
              <Input
                placeholder="Наприклад: 'Я хочу сніданок з яйцями та хлібом'"
                value={nlpQuery}
                onChange={(e) => setNlpQuery(e.target.value)}
              />
              <Button 
                onClick={handleNLP}
                disabled={loading === "nlp"}
                className="gap-2"
              >
                <Brain className="w-4 h-4" />
                Обробити
              </Button>
            </div>
            {loading === "nlp" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 animate-pulse" />
                Обробка...
              </div>
            )}
            {nlpResult && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-800">Результат:</h4>
                <pre className="text-sm text-blue-700 whitespace-pre-wrap">
                  {JSON.stringify(nlpResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Розпізнавання зображень</label>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Завантажте зображення продукту для розпізнавання
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button asChild className="gap-2 cursor-pointer">
                    <span>
                      <Camera className="w-4 h-4" />
                      Завантажити зображення
                    </span>
                  </Button>
                </label>
              </div>
              
              {imageFile && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Вибрано: {imageFile.name}
                  </p>
                  <Button 
                    onClick={handleImageRecognition}
                    disabled={loading === "image"}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Розпізнати продукт
                  </Button>
                </div>
              )}
              
              {loading === "image" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 animate-pulse" />
                  Розпізнавання...
                </div>
              )}
              
              {imageResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Розпізнані продукти:</h4>
                  <div className="space-y-1">
                    {imageResults.map((result, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                        <h5 className="font-medium text-green-800">{result.food_name}</h5>
                        <p className="text-sm text-green-700">
                          {result.calories} ккал • Білки: {result.protein}г • Жири: {result.fat}г • Вуглеводи: {result.carbs}г
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Доступні Premier функції:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-green-500" />
            <span>Автодоповнення пошуку</span>
          </div>
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-green-500" />
            <span>Сканування штрих-кодів</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-green-500" />
            <span>Обробка природної мови</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-green-500" />
            <span>Розпізнавання зображень</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-500" />
            <span>Бренди продуктів</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-green-500" />
            <span>Категорії продуктів</span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-green-500" />
            <span>Типи рецептів</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-500" />
            <span>Повна локалізація</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
