import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  KitchenUtensilsIcon,
  RefrigeratorIcon,
  Calendar03Icon,
  ShoppingCart01Icon,
  Dumbbell03Icon,
  BookOpen01Icon,
  AiBrain01Icon,
  UserIcon,
  Add01Icon,
  Sun03Icon,
  Moon02Icon,
} from '@hugeicons/core-free-icons';
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useModals } from "@/hooks/useModals";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/hooks/useI18n";

export const navItems = [
  { icon: Home01Icon, label: "home", path: "/" },
  { icon: KitchenUtensilsIcon, label: "recipes", path: "/recipes" },
  { icon: RefrigeratorIcon, label: "fridge", path: "/fridge" },
  { icon: Calendar03Icon, label: "mealPlan", path: "/meal-plan" },
  { icon: ShoppingCart01Icon, label: "shopping", path: "/shopping" },
  { icon: Dumbbell03Icon, label: "training", path: "/training" },
  { icon: BookOpen01Icon, label: "articles", path: "/articles" },
  { icon: AiBrain01Icon, label: "aiCoach", path: "/ai-coach" },
  { icon: UserIcon, label: "profile", path: "/profile" },
] as const;


export function DashboardSidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { openAddItem } = useModals();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [authOpen, setAuthOpen] = useState(false);

  const quickActions = [
    { icon: Add01Icon, label: t("addFood"), action: "add-food" as const },
    { icon: Add01Icon, label: t("addProduct"), action: "add-product" as const },
  ];
  return (
    <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">O</span>
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">OmOm</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <HugeiconsIcon icon={item.icon} size={22} strokeWidth={1.5} />
              <span>{t(item.label as keyof typeof t)}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-3">
        <div className="flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <HugeiconsIcon icon={Sun03Icon} size={18} /> : <HugeiconsIcon icon={Moon02Icon} size={18} />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocale(locale === "uk" ? "en" : "uk")}>{locale.toUpperCase()}</Button>
        </div>
        <div className="px-4 py-3 rounded-xl bg-sidebar-accent/40 flex items-center justify-between">
          {isAuthenticated ? (
            <>
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <Button size="sm" variant="outline" onClick={logout}>{t("logout")}</Button>
            </>
          ) : (
            <Button size="sm" className="w-full" onClick={() => (window.location.href = "/auth")}>{t("login")}</Button>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground px-4">{t("quickActions")}</p>
        {quickActions.map((action) => (
          <Button
            key={action.action}
            variant="outline"
            className="w-full justify-start gap-2"
            size="sm"
            onClick={() => openAddItem(action.action === "add-food" ? "meal" : "product")}
          >
            <HugeiconsIcon icon={action.icon} size={16} />
            {action.label}
          </Button>
        ))}
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </aside>
  );
}
