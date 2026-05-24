import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customProductsService, CustomProductFormData, CustomProduct } from "@/lib/custom-products";
import { Plus, Save, X, AlertCircle, CheckCircle, Package, Flame, Target, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type CustomProductModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct?: CustomProduct | null;
  onProductAdded?: (product: CustomProduct) => void;
};

const CATEGORIES = [
  "М'ясо та птиця",
  "Риба та морепродукти", 
  "Молочні продукти",
  "Овочі",
  "Фрукти",
  "Крупи та зернові",
  "Хлібобулочні вироби",
  "Напої",
  "Солодощі",
  "Приправи та спеції",
  "Горіхи та насіння",
  "Бобові",
  "Масла та жири",
  "Консерви",
  "Заморожені продукти",
  "Дитяче харчування",
  "Спортивне харчування",
  "Дієтичні продукти",
  "Інше"
];

export function CustomProductModal({ 
  open, 
  onOpenChange, 
  editingProduct, 
  onProductAdded 
}: CustomProductModalProps) {
  const [formData, setFormData] = useState<CustomProductFormData>({
    name: "",
    description: "",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    category: "",
    brand: ""
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing product changes
  useEffect(() => {
    if (open) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name,
          description: editingProduct.description || "",
          calories: editingProduct.calories,
          protein: editingProduct.protein,
          fat: editingProduct.fat,
          carbs: editingProduct.carbs,
          fiber: editingProduct.fiber || 0,
          sugar: editingProduct.sugar || 0,
          sodium: editingProduct.sodium || 0,
          category: editingProduct.category || "",
          brand: editingProduct.brand || ""
        });
      } else {
        setFormData({
          name: "",
          description: "",
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          category: "",
          brand: ""
        });
      }
      setErrors([]);
    }
  }, [open, editingProduct]);

  const handleInputChange = (field: keyof CustomProductFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const validation = customProductsService.validateProductData(formData);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsSubmitting(false);
        return;
      }

      let product: CustomProduct;
      
      if (editingProduct) {
        // Update existing product
        const updated = customProductsService.updateProduct(editingProduct.id, formData);
        if (!updated) {
          toast.error("Помилка оновлення продукту");
          setIsSubmitting(false);
          return;
        }
        product = updated;
        toast.success("Продукт успішно оновлено!");
      } else {
        // Create new product
        product = customProductsService.addProduct(formData);
        toast.success("Продукт успішно додано!");
      }

      // Call callback if provided
      if (onProductAdded) {
        onProductAdded(product);
      }

      // Close modal
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error("Помилка збереження продукту");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalMacros = () => {
    const total = formData.protein + formData.fat + formData.carbs;
    return Math.round(total * 10) / 10;
  };

  const isFormValid = () => {
    return formData.name.trim() !== "" && 
           formData.calories >= 0 && 
           formData.protein >= 0 && 
           formData.fat >= 0 && 
           formData.carbs >= 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-6 h-6 text-primary" />
            {editingProduct ? "Редагувати продукт" : "Додати власний продукт"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {editingProduct 
              ? "Внесіть зміни до вашого продукту" 
              : "Створіть власний продукт з точними значеннями КБЖУ"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Основна інформація
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Назва продукту *
                </Label>
                <Input
                  id="name"
                  placeholder="Наприклад: Домашній борщ"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Опис (необов'язково)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Додайте опис продукту..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-[80px] text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Категорія
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Оберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm font-medium">
                    Бренд (необов'язково)
                  </Label>
                  <Input
                    id="brand"
                    placeholder="Наприклад: Домашній"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Nutrition Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Поживна цінність (на 100г)
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories" className="text-sm font-medium">
                    Калорії (ккал) *
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    max="1000"
                    step="0.1"
                    value={formData.calories}
                    onChange={(e) => handleInputChange('calories', parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein" className="text-sm font-medium">
                    Білки (г) *
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => handleInputChange('protein', parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fat" className="text-sm font-medium">
                    Жири (г) *
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) => handleInputChange('fat', parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbs" className="text-sm font-medium">
                    Вуглеводи (г) *
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => handleInputChange('carbs', parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Additional nutrients */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiber" className="text-sm font-medium">
                    Клітковина (г)
                  </Label>
                  <Input
                    id="fiber"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) => handleInputChange('fiber', parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sugar" className="text-sm font-medium">
                    Цукор (г)
                  </Label>
                  <Input
                    id="sugar"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.sugar}
                    onChange={(e) => handleInputChange('sugar', parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sodium" className="text-sm font-medium">
                    Натрій (мг)
                  </Label>
                  <Input
                    id="sodium"
                    type="number"
                    min="0"
                    max="10000"
                    step="1"
                    value={formData.sodium}
                    onChange={(e) => handleInputChange('sodium', parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Nutrition summary */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Загальні макронутрієнти:
                  </span>
                  <Badge variant="outline" className="text-sm">
                    {calculateTotalMacros()}г
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Білки + Жири + Вуглеводи
                </div>
              </div>
            </div>
          </Card>

          {/* Errors */}
          {errors.length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Помилки валідації:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 h-12 text-base font-medium"
            >
              <X className="w-4 h-4 mr-2" />
              Скасувати
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="flex-1 h-12 text-base font-medium gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Збереження...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingProduct ? "Оновити продукт" : "Додати продукт"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
