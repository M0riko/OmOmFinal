import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link to="/auth">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <span className="font-semibold text-lg tracking-tight">Умови використання</span>
        </div>
      </header>
      
      <main className="container max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-neutral dark:prose-invert prose-p:leading-relaxed prose-headings:font-semibold"
        >
          <h1 className="text-3xl font-bold mb-6">Умови використання OmOm</h1>
          <p className="text-muted-foreground mb-8">Останнє оновлення: 10 червня 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Прийняття умов</h2>
            <p className="mb-4">
              Використовуючи додаток OmOm (далі - "Додаток"), ви погоджуєтеся з цими Умовами використання. 
              Якщо ви не згодні з цими умовами, будь ласка, не використовуйте наш Додаток.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Опис сервісу</h2>
            <p className="mb-4">
              OmOm - це платформа для відстеження харчування, активності та води, а також для отримання консультацій від віртуальних тренерів. 
              Додаток надається "як є", і ми не гарантуємо, що він буде безперебійно працювати без помилок.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Обліковий запис</h2>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Ви відповідаєте за збереження конфіденційності ваших облікових даних.</li>
              <li>Ви зобов'язуєтесь надавати правдиву та актуальну інформацію під час реєстрації.</li>
              <li>Ми залишаємо за собою право заблокувати обліковий запис у разі порушення правил.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Медична інформація</h2>
            <p className="mb-4">
              Додаток OmOm не є медичним сервісом. Всі поради від віртуальних тренерів та розрахунки калорій мають рекомендаційний характер. 
              Перед початком будь-якої дієти або програми тренувань проконсультуйтеся з лікарем.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Зміни до умов</h2>
            <p className="mb-4">
              Ми можемо періодично оновлювати ці Умови. Продовжуючи використовувати Додаток після внесення змін, ви автоматично погоджуєтеся з новими умовами.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
