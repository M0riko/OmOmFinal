import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FOODS, calculateMacrosForGrams } from "@/lib/foods";
import { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: {
    id: string;
    name: string;
    time?: string;
    mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  } | null;
  onSave: (id: string, updates: { name: string; time?: string; mealType?: "breakfast" | "lunch" | "dinner" | "snack"; foodId?: string; grams?: number; }) => void;
};

export function EditEntryModal({ open, onOpenChange, initial, onSave }: Props) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [foodId, setFoodId] = useState<string>(FOODS[0]?.id || "");
  const [grams, setGrams] = useState<number | "">(100);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setTime(initial.time || "");
      setMealType(initial.mealType || "breakfast");
      if ((initial as any).foodId) setFoodId((initial as any).foodId);
      if ((initial as any).grams) setGrams((initial as any).grams);
    }
  }, [initial]);

  function submit() {
    if (!initial) return;
    onSave(initial.id, { name, time, mealType, foodId, grams: typeof grams === "number" ? grams : Number(grams) || 0 });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редагування запису</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Назва" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Час (наприклад 08:15)" value={time} onChange={(e) => setTime(e.target.value)} />
          <Select value={mealType} onValueChange={(v) => setMealType(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Прийом їжі" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Сніданок</SelectItem>
              <SelectItem value="lunch">Обід</SelectItem>
              <SelectItem value="dinner">Вечеря</SelectItem>
              <SelectItem value="snack">Перекус</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select value={foodId} onValueChange={setFoodId}>
              <SelectTrigger><SelectValue placeholder="Продукт" /></SelectTrigger>
              <SelectContent className="max-h-64 overflow-auto">
                {FOODS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Грами" value={grams} onChange={(e) => setGrams(Number(e.target.value) || "")} />
          </div>
          <div className="text-xs text-muted-foreground">
            {(() => {
              const f = FOODS.find((x) => x.id === foodId) || FOODS[0];
              const g = typeof grams === "number" ? grams : Number(grams) || 0;
              const m = f ? calculateMacrosForGrams(f, g) : { calories: 0, protein: 0, fats: 0, carbs: 0 };
              return `Калорії ${m.calories} • Б ${m.protein}г • Ж ${m.fats}г • В ${m.carbs}г`;
            })()}
          </div>
          <Button className="w-full" onClick={submit} disabled={!name}>Зберегти</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


