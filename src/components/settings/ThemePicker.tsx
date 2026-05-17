"use client";
import { ThemeMode } from "@/types";
import { Sun, Moon, Contrast, Monitor } from "lucide-react";

const THEMES: { id: ThemeMode; icon: typeof Sun; label: string }[] = [
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "light", icon: Sun, label: "Light" },
  { id: "sepia", icon: Contrast, label: "Sepia" },
  { id: "system", icon: Monitor, label: "System" },
];

interface ThemePickerProps {
  theme: ThemeMode;
  onChange: (t: ThemeMode) => void;
}

export function ThemePicker({ theme, onChange }: ThemePickerProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {THEMES.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all ${theme === id
              ? "bg-(--bg-accent) text-white shadow-sm"
              : "bg-(--bg-surface) text-(--text-tertiary) hover:bg-(--bg-elevated) hover:text-(--text-primary) border border-(--border-subtle)"
            }`}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
