import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats seconds as mm:ss, or hh:mm:ss once an hour is reached. */
export function formatTime(time: number): string {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return (hours > 0 ? [hours, minutes, seconds] : [minutes, seconds])
    .map((unit) => unit.toString().padStart(2, "0"))
    .join(":");
}
