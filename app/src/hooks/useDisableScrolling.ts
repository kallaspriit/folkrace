import { useEffect } from "react";

// number of components that have requested to disable scrolling
let disablerCount = 0;

export function useDisableScrolling(isEnabled = true) {
  useEffect(() => {
    if (isEnabled) {
      const notScrollableClassName = "not-scrollable";

      // add class for first disabler
      if (disablerCount === 0) {
        document.querySelector("body")?.classList.add(notScrollableClassName);
      }

      disablerCount++;

      return () => {
        disablerCount--;

        // remove class if all disablers have quit
        if (disablerCount === 0) {
          document.querySelector("body")?.classList.remove(notScrollableClassName);
        }
      };
    }
  }, [isEnabled]);
}
