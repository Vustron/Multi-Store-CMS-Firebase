import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export const sqlInjectionPattern =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|FETCH|DECLARE|TRUNCATE|MERGE)\b)/i;

export const noSqlInjection = (val: string) => !sqlInjectionPattern.test(val);

export const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
