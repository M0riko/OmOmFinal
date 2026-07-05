import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/hooks/useI18n";

export function MobileHeader() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  return (
    <div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border p-4 flex items-center justify-between">
      <span className="font-bold text-lg text-foreground tracking-tight">AmAm</span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <HugeiconsIcon icon={Sun03Icon} size={20} /> : <HugeiconsIcon icon={Moon02Icon} size={20} />}
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setLocale(locale === "uk" ? "en" : "uk")}>{locale.toUpperCase()}</Button>
      </div>
    </div>
  );
}
