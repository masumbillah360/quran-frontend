"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cn } from "@/utils/cn"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Safely fallback to a consistent 1-thumb array structure on the server side
  const _values = React.useMemo(
    () => {
      if (!mounted) return [min]; // Match a predictable array length for single value sliders on server
      return Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min]; // For single sliders, prefer single fallback instead of double [min, max]
    },
    [value, defaultValue, min, max, mounted]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-(--bg-elevated) data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-(--accent) select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          suppressHydrationWarning
        />
      </SliderPrimitive.Track>
      {_values.map((_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-3 shrink-0 rounded-full border border-(--bg-canvas) bg-(--accent) ring-(--accent)/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }