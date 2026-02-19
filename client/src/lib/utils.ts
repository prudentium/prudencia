import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

export const formatShortDate = (date: Date | string) => {
  const d = new Date(date);
  const now = new Date();
  
  // If today
  if (d.toDateString() === now.toDateString()) {
    return "Hoje";
  }
  
  // If yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "Ontem";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  }).format(d);
};
