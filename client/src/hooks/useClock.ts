import { useState, useEffect } from 'react';

// Centralized ticker singleton to prevent multiple independent intervals
class ClockTicker {
  private listeners = new Set<(date: Date) => void>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentDate: Date = new Date();

  subscribe(listener: (date: Date) => void): () => void {
    this.listeners.add(listener);
    this.currentDate = new Date();
    // Notify immediately with current date
    listener(this.currentDate);

    if (this.listeners.size === 1 && !this.intervalId) {
      this.intervalId = setInterval(() => {
        this.currentDate = new Date();
        this.listeners.forEach((fn) => fn(this.currentDate));
      }, 1000);
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }

  getCurrentDate(): Date {
    return new Date();
  }
}

const clockTicker = new ClockTicker();

/**
 * useClock hook:
 * Provides the current synchronized time updating every second.
 * Automatically cleans up intervals when unmounted.
 */
export function useClock(initialDate?: Date) {
  const [date, setDate] = useState<Date>(() => initialDate || clockTicker.getCurrentDate());

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      return;
    }

    const unsubscribe = clockTicker.subscribe((newDate) => {
      setDate(newDate);
    });

    return () => {
      unsubscribe();
    };
  }, [initialDate]);

  return date;
}
