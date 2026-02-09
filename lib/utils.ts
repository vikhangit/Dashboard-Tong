import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  return format(new Date(date), "dd/MM/yyyy");
}

export function formatShortDateTime(date: Date | string): string {
  if (!date) return "";
  return format(new Date(date), "dd/MM HH:mm");
}

export function formatFullDateTime(date: Date | string): string {
  if (!date) return "";
  return format(new Date(date), "dd/MM/yyyy HH:mm:ss");
}

export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  return format(new Date(date), "dd/MM/yyyy HH:mm");
}
