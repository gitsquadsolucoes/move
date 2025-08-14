import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface DebounceOptions {
  delay?: number;
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[] = [],
  options: DebounceOptions = {}
): (...args: Parameters<T>) => void {
  const {
    delay = 500,
    maxWait = 0,
    leading = false,
    trailing = true
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<Parameters<T>>();
  const callbackRef = useRef(callback);

  // Atualiza a referência do callback quando ele muda
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Limpa os timeouts quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
      }
    };
  }, []);

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    lastArgsRef.current = args;

    // Se é a primeira chamada ou leading=true e o timeout expirou
    const shouldCallNow = leading && (!lastCallTimeRef.current || (currentTime - lastCallTimeRef.current) >= delay);

    if (shouldCallNow) {
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
        maxWaitTimeoutRef.current = undefined;
      }
      lastCallTimeRef.current = currentTime;
      callbackRef.current(...args);
      return;
    }

    // Limpa o timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configura o novo timeout
    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        lastCallTimeRef.current = Date.now();
        callbackRef.current(...(lastArgsRef.current as Parameters<T>));
      }
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
        maxWaitTimeoutRef.current = undefined;
      }
    }, delay);

    // Configura o maxWait se necessário
    if (maxWait > 0 && !maxWaitTimeoutRef.current) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        lastCallTimeRef.current = Date.now();
        callbackRef.current(...(lastArgsRef.current as Parameters<T>));
        maxWaitTimeoutRef.current = undefined;
      }, maxWait);
    }
  };
}

export function useThrottle<T>(value: T, limit: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}
