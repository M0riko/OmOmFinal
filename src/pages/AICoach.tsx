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
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileHeader />
        <main className="flex-1 p-2 md:p-6 max-w-4xl mx-auto w-full h-[calc(100vh-64px)] pb-20 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            <AICoachChat />
          </motion.div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
