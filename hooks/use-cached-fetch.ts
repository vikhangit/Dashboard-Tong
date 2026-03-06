import { useState, useEffect, SetStateAction } from "react";

export interface CachedFetchResult<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  mutate: (newData: SetStateAction<T>) => void;
}

export function useCachedFetch<T>(
  key: string,
  url: string,
  initialData: T,
): CachedFetchResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // SWR Pattern: Cố gắng load cache từ localStorage trước để hiển thị nhanh
    const cachedData = localStorage.getItem(key);
    let hasCache = false;

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (
          (Array.isArray(parsedData) && parsedData.length > 0) ||
          (!Array.isArray(parsedData) && parsedData !== null)
        ) {
          if (isMounted) {
            setData(parsedData);
            setIsLoading(false);
          }
          hasCache = true;
        }
      } catch (e) {
        console.error(`Failed to parse cache for ${key}`, e);
      }
    }

    const fetchData = async () => {
      try {
        if (!hasCache && isMounted) setIsLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // Handle common API response wrappers ({ data: [...] })
        const actualData = result.data !== undefined ? result.data : result;

        if (actualData && isMounted) {
          setData(actualData);
          localStorage.setItem(key, JSON.stringify(actualData));
        }
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    const handleFocusOrVisible = () => {
      // Only refetch if window gains focus or visibility
      if (document.visibilityState === "visible" && document.hasFocus()) {
        fetchData();
      }
    };

    window.addEventListener("visibilitychange", handleFocusOrVisible);
    window.addEventListener("focus", handleFocusOrVisible);

    return () => {
      isMounted = false;
      window.removeEventListener("visibilitychange", handleFocusOrVisible);
      window.removeEventListener("focus", handleFocusOrVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, url]);

  const mutate = (newData: SetStateAction<T>) => {
    setData((prev) => {
      const isFunction = (value: unknown): value is (prevState: T) => T =>
        typeof value === "function";
      const nextData = isFunction(newData) ? newData(prev) : newData;
      localStorage.setItem(key, JSON.stringify(nextData));
      return nextData;
    });
  };

  return { data, isLoading, error, mutate };
}
