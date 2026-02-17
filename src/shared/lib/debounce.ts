/**
 * Creates a debounced version of a function that delays its execution
 * @param func - The function to debounce
 * @param timeout - Delay in milliseconds (default: 300)
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  timeout = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

/**
 * Creates a debounced version that returns a promise
 * Useful for search-as-you-type with API calls
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  timeout = 300
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timer: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    return new Promise((resolve) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const result = await func(...args);
        resolve(result as ReturnType<T>);
      }, timeout);
    });
  };
}
