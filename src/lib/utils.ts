import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединение классов с помощью clsx и tailwind-merge.
 * Удобная утилита для объединения tailwind классов.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирование даты в удобочитаемый формат
 * @param date - дата для форматирования
 * @param options - опции форматирования
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}) {
  if (!date) return "";
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options
  };
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("ru-RU", defaultOptions);
}

/**
 * Форматирование суммы в рублях
 * @param amount - сумма для форматирования
 */
export function formatRUB(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Форматирование суммы в USDT
 * @param amount - сумма для форматирования
 */
export function formatUSDT(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount) + " USDT";
}
