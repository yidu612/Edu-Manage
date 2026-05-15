import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// MUST HAVE THE WORD 'export'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}