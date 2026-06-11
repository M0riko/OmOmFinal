import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ShoppingHeaderBar } from "@/components/ShoppingHeaderBar";
import { ShoppingSummaryCards } from "@/components/ShoppingSummaryCards";
import { ShoppingTabsNavigation } from "@/components/ShoppingTabsNavigation";
import { ShoppingSearchFilterBar } from "@/components/ShoppingSearchFilterBar";
import { ShoppingAddProductForm } from "@/components/ShoppingAddProductForm";
import { ShoppingProductList } from "@/components/ShoppingProductList";
import { ShoppingEmptyState } from "@/components/ShoppingEmptyState";
import { ShoppingSmartAssistant } from "@/components/ShoppingSmartAssistant";
import { ShoppingStoreModeView } from "@/components/ShoppingStoreModeView";
import { AutoAddToShoppingList } from "@/components/AutoAddToShoppingList";
import { ShoppingStatistics } from "@/components/ShoppingStatistics";
import { AddProductModal } from "@/components/AddProductModal";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useState, useCallback } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { useShoppingList } from "@/hooks/useShoppingList";
import { toast } from "sonner";

export default function Shopping() {
  const { 
    items, 
    categories, 
    stats, 
    isStoreMode, 
    setIsStoreMode,
    addItem,
    toggleItem,
    removeItem,
    getItemsByCategory,
    getSuggestions
  } = useShoppingList();
  
  const [title, setTitle] = useState("");
  const [qty, setQty] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "auto" | "categories" | "statistics">("list");
  
  // Search Modal State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { earn } = useAchievements();

  const priorityColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", 
    high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  };

  const priorityLabels = {
    low: "Низький",
    medium: "Середній",
    high: "Високий"
  };

  function handleAddItem() {
    if (!title) return;
    
    addItem({
      name: title,
      quantity: parseFloat(qty) || 1,
      unit: "шт",
      category: category || "other",
      priority,
      isAutoAdded: false,
      source: "manual",
      estimatedPrice: Math.round(Math.random() * 100 + 10)
    });
    
    if (items.length + 1 >= 3) earn("shopping_3");
    setTitle(""); 
    setQty(""); 
    setCategory(""); 
    setPriority("medium");
    toast.success("Товар додано до списку!");
  }

  function handleToggle(id: string) {
    toggleItem(id);
  }

  function handleRemove(id: string) {
    removeItem(id);
    toast.success("Товар видалено!");
  }

  function handleItemsAdded(count: number) {
    if (count > 0) {
      toast.success(`Додано ${count} товарів до списку покупок!`);
    }
  }

  const handleSearchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { apiService } = await import("@/lib/api");
      const [fatSecretResults, offResults] = await Promise.all([
        apiService.searchFoodsWithNutrition(searchQuery, 10),
        apiService.searchOpenFoodFacts(searchQuery, 10)
      ]);
      
      const mappedOffResults = offResults.map(off => ({
        food_id: off.id,
        food_name: off.brands ? `${off.name} (${off.brands})` : off.name,
        calories: off.calories,
        protein: off.protein,
        fat: off.fat,
        carbohydrate: off.carbs,
        is_off: true,
        image_url: off.image_url
      }));

      setSearchResults([...mappedOffResults, ...fatSecretResults]);
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Помилка пошуку продуктів");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleAddFromSearch = (product: any, quantityObj: { amount: number; unit: any }) => {
    addItem({
      name: product.food_name,
      quantity: quantityObj.amount,
      unit: quantityObj.unit,
      category: "other", // Can be improved with auto-categorization
      priority: "medium",
      isAutoAdded: false,
      source: "manual",
      estimatedPrice: Math.round(Math.random() * 100 + 10)
    });
    
    toast.success("Товар додано до списку!");
  };

  const handleCardClick = (type: "total" | "completed" | "remaining" | "cost") => {
    switch (type) {
      case "completed":
        setShowCompleted(true);
        setActiveTab("list");
        break;
      case "remaining":
        setShowCompleted(false);
        setActiveTab("list");
        break;
      default:
        setActiveTab("list");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion);
  };

  const handleViewFridge = () => {
    toast.info("Перехід до холодильника");
  };

  const handleViewRecipes = () => {
    toast.info("Перехід до рецептів");
  };

  const handleAutoAdd = () => {
    setActiveTab("auto");
  };

  // Если включен режим магазина, показываем специальный интерфейс
  if (isStoreMode) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <MobileHeader />
          <main className="p-4 pb-20 md:pb-8 md:p-8 max-w-6xl mx-auto w-full">
            <ShoppingStoreModeView 
              items={items}
              onToggleItem={handleToggle}
              onExitStoreMode={() => setIsStoreMode(false)}
            />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    );
  }

  // Фильтрация товаров
  const filteredItems = items.filter(item => {
    if (!showCompleted && item.isCompleted) return false;
    if (query.trim() && !item.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (selectedCategory && selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedPriority && selectedPriority !== "all" && item.priority !== selectedPriority) return false;
    return true;
  });

  const groupedItems = getItemsByCategory();

  const getTabContent = () => {
    switch (activeTab) {
      case "list":
        return (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <ShoppingSearchFilterBar
              searchQuery={query}
              onSearchChange={setQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              showCompleted={showCompleted}
              onToggleCompleted={() => setShowCompleted(!showCompleted)}
              categories={categories}
            />

            {/* Add Product Form */}
            <ShoppingAddProductForm
              title={title}
              onTitleChange={setTitle}
              quantity={qty}
              onQuantityChange={setQty}
              category={category}
              onCategoryChange={setCategory}
              priority={priority}
              onPriorityChange={setPriority}
              onAddProduct={handleAddItem}
              categories={categories}
              suggestions={["Молоко", "Хліб", "Яйця", "Масло", "Сир", "Йогурт"]}
              onSuggestionClick={handleSuggestionClick}
              onSearchDb={() => setIsSearchModalOpen(true)}
            />

            {/* Product List or Empty State */}
            {filteredItems.length > 0 ? (
              <ShoppingProductList
                items={filteredItems}
                onToggleItem={handleToggle}
                onRemoveItem={handleRemove}
              />
            ) : (
              <ShoppingEmptyState
                onAddProduct={() => setTitle("")}
                onAutoAdd={handleAutoAdd}
              />
            )}

            {/* Smart Assistant */}
            <ShoppingSmartAssistant
              fridgeItems={12} // TODO: Get from fridge hook
              expiringItems={3} // TODO: Get from fridge hook
              recipeSuggestions={8} // TODO: Get from recipes
              onViewFridge={handleViewFridge}
              onViewRecipes={handleViewRecipes}
              onAutoAdd={handleAutoAdd}
            />
          </div>
        );

      case "auto":
        return <AutoAddToShoppingList onItemsAdded={handleItemsAdded} />;

      case "categories":
        return (
          <Card className="p-6 bg-card/30 backdrop-blur-sm border border-muted/30 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Категорії товарів</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 border rounded-lg bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{cat.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {stats.categoryBreakdown[cat.id] || 0} товарів
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );

      case "statistics":
        return <ShoppingStatistics />;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-4 pb-20 md:pb-8 md:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <ShoppingHeaderBar onStoreMode={() => setIsStoreMode(true)} />

          {/* Summary Cards */}
          <ShoppingSummaryCards
            totalItems={stats.totalItems}
            completedItems={stats.completedItems}
            remainingItems={stats.totalItems - stats.completedItems}
            estimatedCost={stats.totalEstimatedCost}
            onCardClick={handleCardClick}
          />

          {/* Tabs Navigation */}
          <ShoppingTabsNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          {getTabContent()}

          {/* Search Modal */}
          <AddProductModal
            open={isSearchModalOpen}
            onOpenChange={setIsSearchModalOpen}
            onAddProduct={(p) => {
              addItem({
                name: p.name || "",
                quantity: p.quantity?.amount || 1,
                unit: p.quantity?.unit || "шт",
                category: p.category || "other",
                priority: "medium",
                isAutoAdded: false,
                source: "manual",
                estimatedPrice: 0
              });
              toast.success("Товар додано до списку!");
            }}
            onSearchProducts={handleSearchProducts}
            searchResults={searchResults}
            searchLoading={searchLoading}
            onAddFromSearch={handleAddFromSearch}
          />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}