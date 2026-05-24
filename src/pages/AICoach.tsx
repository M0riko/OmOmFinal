import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AICoachChat } from "@/components/AICoachChat";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

export default function AICoach() {
  const { t } = useI18n();
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <MobileHeader />
        <main className="p-4 pb-20 md:pb-8 md:p-8 max-w-4xl mx-auto w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20 shadow-lg mb-6">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {t("aiCoachTitle")}
                </h1>
                <p className="text-muted-foreground">
                  {t("personalAssistant")}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]"
          >
            <AICoachChat />
          </motion.div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
