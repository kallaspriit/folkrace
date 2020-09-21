import React, { useEffect } from "react";

export type OnClickOutside = (event: Event) => void;

// based on https://usehooks.com/useOnClickOutside/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useOnClickOutside(ref: React.MutableRefObject<any>, handler: OnClickOutside) {
  useEffect(() => {
    const listener = (event: Event) => {
      if (!ref || !ref.current || !ref.current.contains) {
        return;
      }

      // do nothing if clicking ref's element or descendent elements
      if (ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
