import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing state in localStorage
 * @param key - localStorage key
 * @param initialValue - initial value if key doesn't exist
 * @returns [value, setValue] - current value and setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook for managing localStorage with automatic cleanup
 * @param key - localStorage key
 * @param initialValue - initial value
 * @param ttl - time to live in milliseconds (optional)
 * @returns [value, setValue, removeValue] - current value, setter, and remover
 */
export function useLocalStorageWithTTL<T>(
  key: string,
  initialValue: T,
  ttl?: number
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useLocalStorage<T>(key, initialValue);

  const setValueWithTTL = useCallback(
    (newValue: T) => {
      const data = {
        value: newValue,
        timestamp: Date.now(),
      };
      setValue(data as any);
    },
    [setValue]
  );

  const removeValue = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    setValue(initialValue);
  }, [key, initialValue, setValue]);

  // Check TTL on mount and when value changes
  useEffect(() => {
    if (!ttl || typeof window === "undefined") return;

    const checkTTL = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const data = JSON.parse(item);
          if (data.timestamp && Date.now() - data.timestamp > ttl) {
            removeValue();
            return true; // Value was removed
          }
        }
      } catch (error) {
        console.error(`Error checking TTL for localStorage key "${key}":`, error);
      }
      return false; // Value was not removed
    };

    // Check immediately
    if (checkTTL()) return; // If value was removed, don't set up interval

    // Set up interval to check TTL (check every 5 minutes or TTL/2, whichever is larger)
    const intervalTime = Math.max(300000, ttl / 2);
    const interval = setInterval(() => {
      if (checkTTL()) {
        clearInterval(interval); // Stop interval if value was removed
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [key, ttl, removeValue]);

  // Extract actual value from stored data
  const actualValue = (value as any)?.value ?? value;

  return [actualValue, setValueWithTTL, removeValue];
}

/**
 * Hook for managing localStorage with validation
 * @param key - localStorage key
 * @param initialValue - initial value
 * @param validator - function to validate stored value
 * @returns [value, setValue] - current value and setter function
 */
export function useLocalStorageWithValidation<T>(
  key: string,
  initialValue: T,
  validator: (value: any) => value is T
): [T, (value: T) => void] {
  const [value, setValue] = useLocalStorage<T>(key, initialValue);

  const setValidatedValue = useCallback(
    (newValue: T) => {
      if (validator(newValue)) {
        setValue(newValue);
      } else {
        console.warn(`Invalid value for localStorage key "${key}":`, newValue);
      }
    },
    [key, validator, setValue]
  );

  // Validate stored value on mount
  useEffect(() => {
    if (!validator(value)) {
      console.warn(`Invalid stored value for localStorage key "${key}":`, value);
      setValue(initialValue);
    }
  }, [key, value, validator, setValue, initialValue]);

  return [value, setValidatedValue];
}
