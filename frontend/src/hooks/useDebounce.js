import { useState, useEffect } from 'react';

/**
 * Hook debounce — delay giá trị thay đổi (dùng cho tìm kiếm)
 * @param {any} value
 * @param {number} delay - ms
 * @returns {any}
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
