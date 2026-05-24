import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  SlidersHorizontal, 
  X, 
  Target, 
  Clock, 
  Zap,
  Save,
  RotateCcw
} from "lucide-react";
import { useState, useEffect } from "react";

interface AdvancedFilters {
  calories: [number, number];
  protein: [number, number];
  carbs: [number, number];
  fat: [number, number];
  time: [number, number];
  dishTypes: string[];
  diets: string[];
  allergies: string[];
}

interface AdvancedRecipeFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: AdvancedFilters) => void;
  currentFilters?: AdvancedFilters;
}

const defaultFilters: AdvancedFilters = {
  calories: [0, 1000],
  protein: [0, 50],
  carbs: [0, 100],
  fat: [0, 50],
  time: [0, 120],
  dishTypes: [],
  diets: [],
  allergies: []
};

const dishTypeOptions = [
  { value: 'main course', label: 'Основна страва' },
  { value: 'side dish', label: 'Гарнір' },
  { value: 'dessert', label: 'Десерт' },
  { value: 'appetizer', label: 'Закуска' },
  { value: 'salad', label: 'Салат' },
  { value: 'bread', label: 'Хліб' },
  { value: 'breakfast', label: 'Сніданок' },
  { value: 'soup', label: 'Суп' },
  { value: 'beverage', label: 'Напій' },
  { value: 'sauce', label: 'Соус' },
  { value: 'snack', label: 'Перекус' }
];

const dietOptions = [
  { value: 'gluten free', label: 'Без глютену' },
  { value: 'ketogenic', label: 'Кетогенна' },
  { value: 'vegetarian', label: 'Вегетаріанська' },
  { value: 'lacto vegetarian', label: 'Лакто-вегетаріанська' },
  { value: 'ovo vegetarian', label: 'Ово-вегетаріанська' },
  { value: 'vegan', label: 'Веганська' },
  { value: 'pescetarian', label: 'Пескетаріанська' },
  { value: 'paleo', label: 'Палео' },
  { value: 'primal', label: 'Примальна' },
  { value: 'low fodmap', label: 'Низький FODMAP' },
  { value: 'whole30', label: 'Whole30' }
];

const allergyOptions = [
  { value: 'dairy', label: 'Молочні продукти' },
  { value: 'eggs', label: 'Яйця' },
  { value: 'fish', label: 'Риба' },
  { value: 'shellfish', label: 'Молюски' },
  { value: 'tree nuts', label: 'Горіхи' },
  { value: 'peanuts', label: 'Арахіс' },
  { value: 'wheat', label: 'Пшениця' },
  { value: 'soybeans', label: 'Соя' },
  { value: 'sesame', label: 'Кунжут' }
];

export function AdvancedRecipeFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters = defaultFilters 
}: AdvancedRecipeFiltersProps) {
  const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);
  const [savedFilters, setSavedFilters] = useState<AdvancedFilters | null>(null);

  useEffect(() => {
    // Загружаем сохраненные фильтры из localStorage
    const saved = localStorage.getItem('omomo_recipe_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedFilters(parsed);
        setFilters(parsed);
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  const handleSliderChange = (key: keyof Pick<AdvancedFilters, 'calories' | 'protein' | 'carbs' | 'fat' | 'time'>, value: number[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value as [number, number]
    }));
  };

  const handleCheckboxChange = (key: keyof Pick<AdvancedFilters, 'dishTypes' | 'diets' | 'allergies'>, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }));
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const saveFilters = () => {
    localStorage.setItem('omomo_recipe_filters', JSON.stringify(filters));
    setSavedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const loadSavedFilters = () => {
    if (savedFilters) {
      setFilters(savedFilters);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    
    // Проверяем слайдеры
    if (filters.calories[0] !== defaultFilters.calories[0] || filters.calories[1] !== defaultFilters.calories[1]) count++;
    if (filters.protein[0] !== defaultFilters.protein[0] || filters.protein[1] !== defaultFilters.protein[1]) count++;
    if (filters.carbs[0] !== defaultFilters.carbs[0] || filters.carbs[1] !== defaultFilters.carbs[1]) count++;
    if (filters.fat[0] !== defaultFilters.fat[0] || filters.fat[1] !== defaultFilters.fat[1]) count++;
    if (filters.time[0] !== defaultFilters.time[0] || filters.time[1] !== defaultFilters.time[1]) count++;
    
    // Проверяем чекбоксы
    count += filters.dishTypes.length + filters.diets.length + filters.allergies.length;
    
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Розширені фільтри</h3>
                <p className="text-sm text-muted-foreground">
                  Налаштуйте пошук під ваші фітнес-цілі
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {getActiveFiltersCount()} активних
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Левая колонка - КБЖУ и время */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Калорійність та БЖУ
                </h4>
                
                <div className="space-y-6">
                  {/* Калории */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Калориї (ккал)</label>
                      <span className="text-sm text-muted-foreground">
                        {filters.calories[0]} - {filters.calories[1]}
                      </span>
                    </div>
                    <Slider
                      value={filters.calories}
                      onValueChange={(value) => handleSliderChange('calories', value)}
                      max={2000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                  </div>

                  {/* Белки */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Білки (г)</label>
                      <span className="text-sm text-muted-foreground">
                        {filters.protein[0]} - {filters.protein[1]}
                      </span>
                    </div>
                    <Slider
                      value={filters.protein}
                      onValueChange={(value) => handleSliderChange('protein', value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Углеводы */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Вуглеводи (г)</label>
                      <span className="text-sm text-muted-foreground">
                        {filters.carbs[0]} - {filters.carbs[1]}
                      </span>
                    </div>
                    <Slider
                      value={filters.carbs}
                      onValueChange={(value) => handleSliderChange('carbs', value)}
                      max={200}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Жиры */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Жири (г)</label>
                      <span className="text-sm text-muted-foreground">
                        {filters.fat[0]} - {filters.fat[1]}
                      </span>
                    </div>
                    <Slider
                      value={filters.fat}
                      onValueChange={(value) => handleSliderChange('fat', value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Время приготовления */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Час приготування
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Хвилини</label>
                    <span className="text-sm text-muted-foreground">
                      {filters.time[0]} - {filters.time[1]} хв
                    </span>
                  </div>
                  <Slider
                    value={filters.time}
                    onValueChange={(value) => handleSliderChange('time', value)}
                    max={180}
                    min={0}
                    step={15}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Правая колонка - Типы блюд, диеты, аллергии */}
            <div className="space-y-6">
              {/* Типы блюд */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Тип страви
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {dishTypeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dish-${option.value}`}
                        checked={filters.dishTypes.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('dishTypes', option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`dish-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Диеты */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Дієта</h4>
                <div className="grid grid-cols-1 gap-3">
                  {dietOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diet-${option.value}`}
                        checked={filters.diets.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('diets', option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`diet-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Аллергии */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Алергії та обмеження</h4>
                <div className="grid grid-cols-1 gap-3">
                  {allergyOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${option.value}`}
                        checked={filters.allergies.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('allergies', option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`allergy-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
            <Button onClick={applyFilters} className="flex-1 gap-2">
              <Target className="w-4 h-4" />
              Застосувати фільтри
            </Button>
            <Button 
              variant="outline" 
              onClick={saveFilters}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Зберегти
            </Button>
            {savedFilters && (
              <Button 
                variant="outline" 
                onClick={loadSavedFilters}
                className="gap-2"
              >
                Завантажити збережені
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Скинути
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
