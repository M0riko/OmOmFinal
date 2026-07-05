import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link to="/auth">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <span className="font-semibold text-lg tracking-tight">Політика конфіденційності</span>
        </div>
      </header>
      
      <main className="container max-w-3xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-neutral dark:prose-invert prose-p:leading-relaxed prose-headings:font-semibold"
        >
          <h1 className="text-3xl font-bold mb-6">Політика конфіденційності AmAm</h1>
          <p className="text-muted-foreground mb-8">Останнє оновлення: 10 червня 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Які дані ми збираємо</h2>
            <p className="mb-4">
              Ми збираємо інформацію, яку ви надаєте нам безпосередньо під час використання додатку:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Реєстраційні дані (ім'я, email).</li>
              <li>Біометричні дані (вік, вага, зріст, стать), необхідні для розрахунку норм калорій.</li>
              <li>Дані про ваше харчування, споживання води та фізичну активність.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Як ми використовуємо ваші дані</h2>
            <p className="mb-4">Ми використовуємо зібрану інформацію для:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Розрахунку персональних норм калорій та макроелементів.</li>
              <li>Персоналізації рекомендацій від віртуальних тренерів.</li>
              <li>Покращення роботи додатку та виправлення помилок.</li>
              <li>Забезпечення безпеки вашого облікового запису.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Захист та зберігання даних</h2>
            <p className="mb-4">
              Всі ваші дані надійно шифруються та зберігаються на захищених серверах. Паролі хешуються, і ми не маємо до них доступу. 
              Ви можете в будь-який момент видалити свій обліковий запис і всі пов'язані з ним дані через налаштування додатку.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Передача даних третім особам</h2>
            <p className="mb-4">
              Ми не продаємо і не передаємо ваші особисті дані стороннім рекламним компаніям. 
              Ваші дані можуть передаватися надійним партнерам (наприклад, для генерації відповідей ШІ-тренерів), лише у знеособленому вигляді.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Ваші права</h2>
            <p className="mb-4">
              Ви маєте повне право на доступ до своїх даних, їх редагування або видалення. 
              Якщо у вас виникли питання щодо політики конфіденційності, будь ласка, зверніться до нашої служби підтримки.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
