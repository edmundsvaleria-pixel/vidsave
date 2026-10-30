// src/components/island/DynamicIsland.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useIsland } from "./IslandContext";
import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function DynamicIsland() {
  const { state, clearState } = useIsland();

  // Auto-hide success or error messages after 4 seconds
  useEffect(() => {
    if (state.type === "success" || state.type === "error") {
      const timer = setTimeout(() => clearState(), 4000);
      return () => clearTimeout(timer);
    }
  }, [state, clearState]);

  return (
    <div className="pointer-events-none fixed top-4 left-0 right-0 z-[100] flex justify-center">
      <motion.div
        layout
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ 
          y: 0, 
          opacity: 1, 
          scale: 1,
          width: state.type === "idle" ? "120px" : "auto",
          height: state.type === "idle" ? "36px" : "auto",
          backgroundColor: state.type === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(0, 0, 0, 0.85)",
          borderColor: state.type === "error" ? "rgba(255, 255, 255, 0.2)" : "rgba(39, 39, 42, 0.8)"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="pointer-events-auto flex items-center justify-center overflow-hidden rounded-full border border-[#27272A] px-4 py-2 shadow-2xl backdrop-blur-xl"
      >
        <AnimatePresence mode="wait">
          {/* IDLE STATE */}
          {state.type === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]" />
              <span className="text-[10px] font-medium text-white/50">VidSave</span>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {state.type === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              className="flex items-center gap-3 px-2"
            >
              <Loader2 size={16} className="animate-spin text-[#3B82F6]" />
              <span className="text-[12px] font-medium text-white">{state.message}</span>
            </motion.div>
          )}

          {/* SUCCESS STATE */}
          {state.type === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              className="flex items-center gap-3 px-2"
            >
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="text-[12px] font-medium text-white">{state.message}</span>
            </motion.div>
          )}

          {/* ERROR STATE */}
          {state.type === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              className="flex items-center gap-3 px-2"
            >
              <AlertCircle size={16} className="text-white" />
              <span className="text-[12px] font-medium text-white">{state.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}