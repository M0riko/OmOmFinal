import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { DailyProvider } from "./hooks/useDaily";
import { WaterProvider } from "./hooks/useWater";
import { WeightProvider } from "./hooks/useWeight";
import { ModalsProvider } from "@/hooks/useModals";
import { ThemeProvider } from "@/hooks/useTheme";
import { I18nProvider } from "@/hooks/useI18n";
import { AchievementsProvider } from "@/hooks/useAchievements";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <I18nProvider>
      <AuthProvider>
        <AchievementsProvider>
          <DailyProvider>
            <WaterProvider>
              <WeightProvider>
                <ModalsProvider>
                  <App />
                </ModalsProvider>
              </WeightProvider>
            </WaterProvider>
          </DailyProvider>
        </AchievementsProvider>
      </AuthProvider>
    </I18nProvider>
  </ThemeProvider>,
);
