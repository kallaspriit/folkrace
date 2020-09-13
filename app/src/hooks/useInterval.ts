import { useRef, useEffect } from "react";

export function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = useRef<() => void | null>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      const cb = callbackRef.current;

      if (!cb) {
        return;
      }

      cb();
    };

    if (delay !== null) {
      const id = setInterval(tick, delay);

      return () => clearInterval(id);
    }
  }, [delay]);
}
