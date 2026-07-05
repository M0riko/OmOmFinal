import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "military"]}>
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = useNextTheme;


