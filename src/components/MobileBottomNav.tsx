import { navItems } from "@/components/DashboardSidebar";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [sheetOpen, setSheetOpen] = useState(false);
  const mainPaths = ["/", "/recipes", "/meal-plan", "/fridge", "/profile"] as const;
  const extraPaths = ["/shopping", "/training", "/articles", "/ai-coach"] as const;
  const isExtrasActive = extraPaths.includes(location.pathname as any);
  
  const handleNavClick = (path: string) => {
    navigate(path);
    setSheetOpen(false);
  };

  // Короткі підписи для мобільних
  const getShortLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      "home": "Головна",
      "recipes": "Рецепти",
      "fridge": "Холодильник",
      "mealPlan": "План",
      "profile": "Профіль",
      "shopping": "Покупки",
      "training": "Тренування",
      "articles": "Статті",
      "aiCoach": "AI Коуч"
    };
    return labelMap[label] || t(label);
  };
  
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border h-[68px] flex justify-around items-center pb-[env(safe-area-inset-bottom)]"
      aria-label="Основна навігація"
    >
      {navItems
        .filter((item) => mainPaths.includes(item.path as any))
        .map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[52px] touch-manipulation transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`
              }
              aria-label={t(item.label)}
            >
              <HugeiconsIcon 
                icon={item.icon} 
                size={isActive ? 26 : 24}
                strokeWidth={isActive ? 2 : 1.5}
                className="transition-all duration-200"
              />
              <span className="text-[10px] sm:text-[11px] leading-tight font-medium mt-0.5">
                {getShortLabel(item.label)}
              </span>
            </NavLink>
          );
        })}
      
      {/* Кнопка меню для додаткових розділів */}
      {extraPaths.length > 0 && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[52px] touch-manipulation transition-all duration-200 active:scale-95 ${
                isExtrasActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
              aria-label="Більше опцій"
            >
              <HugeiconsIcon 
                icon={Menu01Icon} 
                size={isExtrasActive ? 26 : 24}
                strokeWidth={isExtrasActive ? 2 : 1.5}
              />
              <span className="text-[10px] sm:text-[11px] leading-tight font-medium mt-0.5">
                Більше
              </span>
            </button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="bg-card border-t border-border rounded-t-3xl pb-[calc(env(safe-area-inset-bottom)+1rem)] max-h-[50vh]"
          >
            <div className="space-y-4 pt-4">
              <h3 className="text-base font-semibold text-foreground px-2 mb-4">Додаткові розділи</h3>
              <div className="grid grid-cols-2 gap-3 px-2">
                {navItems
                  .filter((i) => extraPaths.includes(i.path as any))
                  .map((i) => {
                    const isActive = location.pathname === i.path;
                    return (
                      <button
                        key={i.path}
                        onClick={() => handleNavClick(i.path)}
                        className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all duration-200 min-h-[90px] active:scale-95 ${
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "bg-muted/50 text-foreground border border-border hover:bg-muted"
                        }`}
                        aria-label={t(i.label)}
                      >
                        <HugeiconsIcon 
                          icon={i.icon}
                          size={28}
                          strokeWidth={isActive ? 2 : 1.5}
                        />
                        <span className="text-xs font-medium text-center">{t(i.label)}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </nav>
  );
}
