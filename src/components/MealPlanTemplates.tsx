import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Star, 
  Clock, 
  Target, 
  Users, 
  TrendingUp,
  CheckCircle,
  Zap,
  Heart,
  Leaf,
  Flame,
  Calendar,
  List,
  TrendingDown,
  Scale,
  Sprout,
  Beef,
  Fish,
  Wheat,
  Milk,
  Utensils
} from "lucide-react";
import { MealTemplate, DEFAULT_MEAL_TEMPLATES } from "@/lib/meal-planner";

interface MealPlanTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: MealTemplate) => void;
}

export function MealPlanTemplates({ open, onOpenChange, onSelectTemplate }: MealPlanTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      List,
      TrendingDown,
      TrendingUp,
      Scale,
      Leaf,
      Zap,
      Sprout,
      Beef,
      Fish,
      Wheat,
      Milk,
      Utensils
    };
    return iconMap[iconName] || Target;
  };

  const categories = [
    { value: "all", label: "Всі", icon: "List" },
    { value: "weight_loss", label: "Схуднення", icon: "TrendingDown" },
    { value: "muscle_gain", label: "Набір маси", icon: "TrendingUp" },
    { value: "maintenance", label: "Підтримка", icon: "Scale" },
    { value: "diet_specific", label: "Спеціальні дієти", icon: "Leaf" },
    { value: "quick_meals", label: "Швидкі страви", icon: "Zap" }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "weight_loss": return "TrendingDown";
      case "muscle_gain": return "TrendingUp";
      case "maintenance": return "Scale";
      case "diet_specific": return "Leaf";
      case "quick_meals": return "Zap";
      default: return "List";
    }
  };

  const getDietIcon = (diet: string) => {
    switch (diet) {
      case "vegetarian": return "Leaf";
      case "vegan": return "Sprout";
      case "keto": return "Zap";
      case "paleo": return "Beef";
      case "mediterranean": return "Fish";
      case "gluten_free": return "Wheat";
      case "dairy_free": return "Milk";
      default: return "Utensils";
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "high_protein": return <Target className="w-4 h-4 text-red-500" />;
      case "low_carb": return <Leaf className="w-4 h-4 text-green-500" />;
      case "high_fat": return <Heart className="w-4 h-4 text-pink-500" />;
      case "quick_prep": return <Zap className="w-4 h-4 text-yellow-500" />;
      case "ketosis": return <Flame className="w-4 h-4 text-orange-500" />;
      case "plant_based": return <Leaf className="w-4 h-4 text-green-500" />;
      case "balanced": return <Target className="w-4 h-4 text-blue-500" />;
      case "sustainable": return <Heart className="w-4 h-4 text-green-500" />;
      case "high_calorie": return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case "muscle_building": return <Target className="w-4 h-4 text-red-500" />;
      case "satiety": return <Heart className="w-4 h-4 text-purple-500" />;
      case "time_saving": return <Clock className="w-4 h-4 text-blue-500" />;
      case "simple": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getFeatureText = (feature: string) => {
    switch (feature) {
      case "high_protein": return "Високий білок";
      case "low_carb": return "Низькі вуглеводи";
      case "high_fat": return "Високі жири";
      case "quick_prep": return "Швидке приготування";
      case "ketosis": return "Кетоз";
      case "plant_based": return "Рослинна основа";
      case "balanced": return "Збалансовано";
      case "sustainable": return "Екологічно";
      case "high_calorie": return "Висококалорійно";
      case "muscle_building": return "Для м'язів";
      case "satiety": return "Насиченість";
      case "time_saving": return "Економія часу";
      case "simple": return "Просто";
      default: return feature;
    }
  };

  const filteredTemplates = DEFAULT_MEAL_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: MealTemplate) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Готові шаблони планів харчування
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Пошук шаблонів</Label>
              <Input
                id="search"
                placeholder="Введіть назву або опис шаблону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Категорії</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className="gap-1"
                    >
                      <IconComponent className="w-4 h-4" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{template.popularity}%</span>
                    </div>
                  </div>

                  {/* Category and Diet */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      {React.createElement(getIconComponent(getCategoryIcon(template.category)), { className: "w-3 h-3" })}
                      {template.category === "weight_loss" ? "Схуднення" :
                       template.category === "muscle_gain" ? "Набір маси" :
                       template.category === "maintenance" ? "Підтримка" :
                       template.category === "diet_specific" ? "Спеціальна дієта" :
                       template.category === "quick_meals" ? "Швидкі страви" : template.category}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      {React.createElement(getIconComponent(getDietIcon(template.dietType)), { className: "w-3 h-3" })}
                      {template.dietType === "vegetarian" ? "Вегетаріанська" :
                       template.dietType === "vegan" ? "Веганська" :
                       template.dietType === "keto" ? "Кето" :
                       template.dietType === "paleo" ? "Палео" :
                       template.dietType === "mediterranean" ? "Середземноморська" :
                       template.dietType === "gluten_free" ? "Без глютену" :
                       template.dietType === "dairy_free" ? "Без молочних" : "Стандартна"}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span>{template.targetCalories.min}-{template.targetCalories.max} ккал</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{template.mealsPerDay} прийомів/день</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {template.cookingTime === "quick" ? "До 30 хв" :
                           template.cookingTime === "extensive" ? "Понад 60 хв" : "30-60 хв"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {template.duration === "3_days" ? "3 дні" :
                           template.duration === "week" ? "Тиждень" :
                           template.duration === "2_weeks" ? "2 тижні" : "Місяць"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="text-sm font-medium mb-2">Особливості:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 4).map((feature) => (
                        <Badge key={feature} variant="outline" className="gap-1 text-xs">
                          {getFeatureIcon(feature)}
                          {getFeatureText(feature)}
                        </Badge>
                      ))}
                      {template.features.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.features.length - 4} ще
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Popularity Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Популярність</span>
                      <span>{template.popularity}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${template.popularity}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Шаблони не знайдено</h3>
              <p className="text-muted-foreground">
                Спробуйте змінити пошуковий запит або категорію
              </p>
            </div>
          )}

          {/* Selected Template Details */}
          {selectedTemplate && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Обраний шаблон</h3>
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Готовий до застосування
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Назва:</strong> {selectedTemplate.name}</p>
                <p><strong>Опис:</strong> {selectedTemplate.description}</p>
                <p><strong>Калорії:</strong> {selectedTemplate.targetCalories.min}-{selectedTemplate.targetCalories.max} ккал</p>
                <p><strong>Тривалість:</strong> {
                  selectedTemplate.duration === "3_days" ? "3 дні" :
                  selectedTemplate.duration === "week" ? "Тиждень" :
                  selectedTemplate.duration === "2_weeks" ? "2 тижні" : "Місяць"
                }</p>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
            <Button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Застосувати шаблон
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
