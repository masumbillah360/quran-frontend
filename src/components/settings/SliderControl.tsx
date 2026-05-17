"use client";

import { Slider } from "../ui/slider";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export function SliderControl({ label, value, min, max, onChange }: SliderControlProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-(--text-secondary)">{label}</span>
        <span className="text-sm font-mono text-(--text-accent) min-w-9 text-center">
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([nextValue]) => {
          if (typeof nextValue === "number") onChange(nextValue);
        }}
        aria-label={label}
        className="w-full h-5"
      />
    </div>
  );
}
