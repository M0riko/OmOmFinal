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
  Sun03Icon,
  Moon02Icon,
  UserGroupIcon,
  MusicNote01Icon,
  Activity01Icon,
  Shield01Icon,
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
  { icon: UserGroupIcon, label: "trainers", path: "/trainers" },
  { icon: MusicNote01Icon, label: "music", path: "/music" },
  { icon: BookOpen01Icon, label: "articles", path: "/articles" },
  { icon: AiBrain01Icon, label: "aiCoach", path: "/ai-coach" },
  { icon: UserIcon, label: "profile", path: "/profile" },
  { icon: Activity01Icon, label: "monitoring", path: "http://pwr.inf.ua/mhealth/", external: true },
] as const;


export function DashboardSidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">AmAm</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isExternal = 'external' in item && item.external;
            const content = (
              <>
                <HugeiconsIcon icon={item.icon} size={22} strokeWidth={1.5} />
                <span>{t(item.label as any)}</span>
              </>
            );

            if (isExternal) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50"
                >
                  {content}
                </a>
              );
            }

            return (
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
                {content}
              </NavLink>
            );
          })}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-purple-400 hover:text-purple-300",
                  isActive
                    ? "bg-purple-950/40 text-purple-300 font-medium border border-purple-800/30"
                    : "hover:bg-purple-950/20"
                )
              }
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              </span>
              <span>{locale === 'uk' ? 'Адмін Панель' : 'Admin Panel'}</span>
            </NavLink>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-3">
        <div className="flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (theme === "light") setTheme("dark");
              else if (theme === "dark") setTheme("military");
              else setTheme("light");
            }}
          >
            {theme === "dark" && <HugeiconsIcon icon={Shield01Icon} size={18} />}
            {theme === "military" && <HugeiconsIcon icon={Sun03Icon} size={18} />}
            {theme !== "dark" && theme !== "military" && <HugeiconsIcon icon={Moon02Icon} size={18} />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocale(locale === "uk" ? "en" : "uk")}>{locale.toUpperCase()}</Button>
        </div>
        <div className="px-4 py-3 rounded-xl bg-sidebar-accent/40 flex items-center justify-between">
          {isAuthenticated ? (
            <>
              <div className="text-sm truncate mr-2">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
              </div>
              <Button size="sm" variant="outline" onClick={logout} className="flex-shrink-0">{t("logout")}</Button>
            </>
          ) : (
            <Button size="sm" className="w-full" onClick={() => (window.location.href = "/auth")}>{t("login")}</Button>
          )}
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </aside>
  );
}
