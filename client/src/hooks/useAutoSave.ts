import { useState, useEffect, useRef, useCallback } from 'react';
import { SaveStatus } from '../components/editor/AutoSaveIndicator';

interface UseAutoSaveOptions<T> {
  value: T;
  onSave: (value: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  value,
  onSave,
  delay = 1200,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Keep ref of initial / last saved value to avoid saving unchanged notes
  const lastSavedValueRef = useRef<string>(JSON.stringify(value));
  const isFirstRender = useRef(true);

  const executeSave = useCallback(
    async (valToSave: T) => {
      setStatus('saving');
      try {
        await onSave(valToSave);
        lastSavedValueRef.current = JSON.stringify(valToSave);
        setStatus('saved');
        setLastSavedAt(new Date());
      } catch (err) {
        console.error('Auto-save error:', err);
        setStatus('error');
      }
    },
    [onSave]
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    const currentSerialized = JSON.stringify(value);
    if (currentSerialized === lastSavedValueRef.current) {
      return;
    }

    setStatus('idle');
    const timer = setTimeout(() => {
      executeSave(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, enabled, executeSave]);

  const triggerSave = () => {
    executeSave(value);
  };

  return {
    status,
    lastSavedAt,
    triggerSave,
  };
}
