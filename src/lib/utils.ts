/**
 * Shared utility functions
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
