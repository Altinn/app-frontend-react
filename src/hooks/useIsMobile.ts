import { useCallback, useEffect, useState } from 'react';

export const breakpoints = {
  mini: 600,
  mobile: 768,
  tablet: 992,
};

type Condition = (width: number) => boolean;

const conditionIsMini: Condition = (width) => width <= breakpoints.mini;
const conditionIsMobile: Condition = (width) => width <= breakpoints.mobile;
const conditionIsTablet: Condition = (width) => width > breakpoints.mobile && width <= breakpoints.tablet;
const conditionIsDesktop: Condition = (width) => width > breakpoints.tablet;
const conditionIsMobileOrTablet: Condition = (width) => width <= breakpoints.tablet;

export function useIsMini() {
  return useBrowserWidth(conditionIsMini);
}

export function useIsMobile() {
  return useBrowserWidth(conditionIsMobile);
}

export function useIsTablet() {
  return useBrowserWidth(conditionIsTablet);
}

export function useIsDesktop() {
  return useBrowserWidth(conditionIsDesktop);
}

export function useIsMobileOrTablet() {
  return useBrowserWidth(conditionIsMobileOrTablet);
}

function useBrowserWidth(condition: Condition) {
  const [state, setState] = useState(condition(window.innerWidth));

  const handleResize = useCallback(() => {
    setState(condition(window.innerWidth));
  }, [condition]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return state;
}
