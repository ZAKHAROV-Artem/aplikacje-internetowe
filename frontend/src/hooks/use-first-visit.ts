import { useEffect, useState } from "react";

const FIRST_VISIT_KEY = "magnoli-first-visit";

/**
 * Hook to track if this is the user's first visit to the application
 * Returns true for first-time visitors, false for returning visitors
 */
export function useFirstVisit(): boolean {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);

  useEffect(() => {
    // Check if user has visited before
    const hasVisitedBefore = localStorage.getItem(FIRST_VISIT_KEY);

    if (hasVisitedBefore) {
      // User has visited before
      setIsFirstVisit(false);
    } else {
      // First time visitor - mark as visited
      localStorage.setItem(FIRST_VISIT_KEY, "true");
      setIsFirstVisit(true);
    }
  }, []);

  return isFirstVisit;
}
