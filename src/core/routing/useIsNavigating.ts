import { useLocation, useNavigation } from 'react-router-dom';

export function useIsNavigating() {
  const isIdle = useNavigation().state !== 'idle';
  const location = useLocation();
  return !window.location.hash.endsWith(location.search) || !isIdle;
}
