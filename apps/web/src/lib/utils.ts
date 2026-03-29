import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clampMin(value: number, min: number): number {
  if (value < min) return min;
  return value;
}

export function clampMax(value: number, max: number): number {
  if (value > max) return max;
  return value;
}

export function clamp(value: number, min: number, max: number): number {
  return clampMax(clampMin(value, min), max);
}
