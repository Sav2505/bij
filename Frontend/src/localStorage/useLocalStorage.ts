import { useState, useEffect } from 'react';

export const useLocalStorage = (key: string, defaultValue: any) => {
  const [storedValue, setStoredValue] = useState<any>(defaultValue);

  useEffect(() => {
    const item = localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    } else {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  }, [key, defaultValue]);

  const setValue = (value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
    setStoredValue(value);
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(null);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return { storedValue, setValue, removeValue };
};
