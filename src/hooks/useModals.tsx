import { createContext, useContext, useMemo, useState } from "react";

type ModalsContextValue = {
  addItemOpen: boolean;
  addItemPreset?: "meal" | "product";
  openAddItem: (preset?: "meal" | "product") => void;
  setAddItemOpen: (o: boolean) => void;
};

const ModalsContext = createContext<ModalsContextValue | undefined>(undefined);

export function ModalsProvider({ children }: { children: React.ReactNode }) {
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemPreset, setAddItemPreset] = useState<"meal" | "product" | undefined>(undefined);

  function openAddItem(preset?: "meal" | "product") {
    setAddItemPreset(preset);
    setAddItemOpen(true);
  }

  const value = useMemo<ModalsContextValue>(
    () => ({ addItemOpen, addItemPreset, openAddItem, setAddItemOpen }),
    [addItemOpen, addItemPreset],
  );

  return <ModalsContext.Provider value={value}>{children}</ModalsContext.Provider>;
}

export function useModals() {
  const ctx = useContext(ModalsContext);
  if (!ctx) throw new Error("useModals must be used within ModalsProvider");
  return ctx;
}


