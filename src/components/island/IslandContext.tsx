// src/components/island/IslandContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type IslandState = 
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "success"; message: string; thumbnail?: string; downloadUrl?: string }
  | { type: "error"; message: string };

type IslandContextType = {
  state: IslandState;
  setState: (state: IslandState) => void;
  clearState: () => void;
};

const IslandContext = createContext<IslandContextType | undefined>(undefined);

export function IslandProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IslandState>({ type: "idle" });

  const clearState = () => setState({ type: "idle" });

  return (
    <IslandContext.Provider value={{ state, setState, clearState }}>
      {children}
    </IslandContext.Provider>
  );
}

export function useIsland() {
  const context = useContext(IslandContext);
  if (!context) throw new Error("useIsland must be used within IslandProvider");
  return context;
}