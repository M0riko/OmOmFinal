import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Camera, X, Loader2 } from "lucide-react";
import { SmartFridgeProduct, ProductCategory, UnitType } from "@/lib/smart-fridge";
import { BarcodeScanner } from "./BarcodeScanner";
import { toast } from "sonner";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Partial<SmartFridgeProduct>) => void;
  onSearchProducts: (query: string) => void;
  searchResults: any[];
  searchLoading: boolean;
  onAddFromSearch: (product: any, quantity: { amount: number; unit: UnitType }, expiryDate?: string) => void;
}

const CATEGORIES: ProductCategory[] = [
  "М'ясо та риба",
  "Молочні продукти",
  "Овочі та фрукти",
  "Крупи та макарони",
  "Консерви",
  "Заморожені продукти",
  "Напої",
  "Солодощі",
  "Спеції та приправи",
  "Хліб та випічка",
  "Інше"
];

const UNITS: UnitType[] = ["г", "кг", "мл", "л", "шт", "пачка", "банка", "пляшка", "пучок", "голівка"];

export function AddProductModal({
  open,
  onOpenChange,
  onAddProduct,
  onSearchProducts,
  searchResults,
  searchLoading,
  onAddFromSearch
}: AddProductModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "search" | "barcode">("search");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  
  // Manual form state
  const [manualForm, setManualForm] = useState({
    name: "",
    brand: "",
    category: "" as ProductCategory | "",
    quantity: { amount: 1, unit: "шт" as UnitType },
    expiryDate: "",
    isInPantry: false,
    notes: ""
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchResult, setSelectedSearchResult] = useState<any>(null);
  const [searchQuantity, setSearchQuantity] = useState({ amount: 1, unit: "шт" as UnitType });
  const [searchExpiryDate, setSearchExpiryDate] = useState("");

  // Barcode state
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        onSearchProducts(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, onSearchProducts]);

  const handleManualSubmit = () => {
    if (!manualForm.name.trim()) {
      toast.error("Введіть назву продукту");
      return;
    }

    onAddProduct({
      name: manualForm.name,
      brand: manualForm.brand || undefined,
      category: manualForm.category || "Інше",
      quantity: manualForm.quantity,
      expiryDate: manualForm.expiryDate || undefined,
      isInPantry: manualForm.isInPantry,
      notes: manualForm.notes || undefined
    });

    // Reset form
    setManualForm({
      name: "",
      brand: "",
      category: "",
      quantity: { amount: 1, unit: "шт" },
      expiryDate: "",
      isInPantry: false,
      notes: ""
    });

    onOpenChange(false);
  };

  const handleSearchResultSelect = (product: any) => {
    setSelectedSearchResult(product);
  };

  const handleAddFromSearch = () => {
    if (!selectedSearchResult) {
      toast.error("Оберіть продукт з пошуку");
      return;
    }

    onAddFromSearch(selectedSearchResult, searchQuantity, searchExpiryDate || undefined);
    
    // Reset search form
    setSearchQuery("");
    setSelectedSearchResult(null);
    setSearchQuantity({ amount: 1, unit: "шт" });
    setSearchExpiryDate("");
    
    onOpenChange(false);
  };

  const handleBarcodeScanned = (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    setShowBarcodeScanner(false);
    
    // In a real app, you would look up the product by barcode
    toast.info(`Штрих-код ${scannedBarcode} відскановано. Пошук продукту...`);
    
    // For demo, we'll just show a message
    setTimeout(() => {
      toast.info("Продукт не знайдено в базі даних. Додайте вручну.");
      setActiveTab("manual");
    }, 2000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Додати продукт до холодильника</DialogTitle>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "search" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("search")}
              className="flex-1 gap-2"
            >
              <Search className="w-4 h-4" />
              Пошук
            </Button>
            <Button
              variant={activeTab === "barcode" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("barcode")}
              className="flex-1 gap-2"
            >
              <Camera className="w-4 h-4" />
              Штрих-код
            </Button>
            <Button
              variant={activeTab === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("manual")}
              className="flex-1 gap-2"
            >
              <Plus className="w-4 h-4" />
              Вручну
            </Button>
          </div>

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Пошук продукту в базі даних</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Введіть назву продукту..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  {searchLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Знайдені продукти:</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {searchResults.map((product, index) => (
                      <Card
                        key={index}
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedSearchResult === product ? "ring-2 ring-primary" : "hover:bg-muted"
                        }`}
                        onClick={() => handleSearchResultSelect(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{product.food_name}</h4>
                            {product.calories > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {Math.round(product.calories)} ккал • 
                                Б: {Math.round(product.protein)}г • 
                                Ж: {Math.round(product.fat)}г • 
                                В: {Math.round(product.carbohydrate)}г
                              </div>
                            )}
                          </div>
                          {selectedSearchResult === product && (
                            <Badge variant="default">Обрано</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedSearchResult && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium">Налаштування продукту:</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Кількість</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={searchQuantity.amount}
                          onChange={(e) => setSearchQuantity(prev => ({
                            ...prev,
                            amount: parseFloat(e.target.value) || 1
                          }))}
                          className="flex-1"
                        />
                        <Select
                          value={searchQuantity.unit}
                          onValueChange={(value: UnitType) => setSearchQuantity(prev => ({
                            ...prev,
                            unit: value
                          }))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map(unit => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Термін придатності</Label>
                      <Input
                        type="date"
                        value={searchExpiryDate}
                        onChange={(e) => setSearchExpiryDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddFromSearch} className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Додати до холодильника
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Barcode Tab */}
          {activeTab === "barcode" && (
            <div className="space-y-4 text-center">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Сканування штрих-коду</h3>
                <p className="text-muted-foreground mb-4">
                  Натисніть кнопку, щоб відсканувати штрих-код продукту
                </p>
              </div>
              
              <Button onClick={() => setShowBarcodeScanner(true)} className="gap-2">
                <Camera className="w-4 h-4" />
                Почати сканування
              </Button>

              {barcode && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Відсканований штрих-код:</strong> {barcode}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === "manual" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назва продукту *</Label>
                  <Input
                    id="name"
                    placeholder="Введіть назву..."
                    value={manualForm.name}
                    onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Бренд</Label>
                  <Input
                    id="brand"
                    placeholder="Бренд (необов'язково)"
                    value={manualForm.brand}
                    onChange={(e) => setManualForm(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Категорія</Label>
                  <Select
                    value={manualForm.category}
                    onValueChange={(value: ProductCategory) => setManualForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Кількість</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={manualForm.quantity.amount}
                      onChange={(e) => setManualForm(prev => ({
                        ...prev,
                        quantity: { ...prev.quantity, amount: parseFloat(e.target.value) || 1 }
                      }))}
                      className="flex-1"
                    />
                    <Select
                      value={manualForm.quantity.unit}
                      onValueChange={(value: UnitType) => setManualForm(prev => ({
                        ...prev,
                        quantity: { ...prev.quantity, unit: value }
                      }))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry">Термін придатності</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={manualForm.expiryDate}
                  onChange={(e) => setManualForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Примітки</Label>
                <Input
                  id="notes"
                  placeholder="Додаткові примітки (необов'язково)"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pantry"
                  checked={manualForm.isInPantry}
                  onChange={(e) => setManualForm(prev => ({ ...prev, isInPantry: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="pantry" className="text-sm">
                  Додати до кладовки (завжди є вдома)
                </Label>
              </div>

              <Button onClick={handleManualSubmit} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Додати продукт
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onBarcodeScanned={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </>
  );
}
