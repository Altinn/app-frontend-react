import { useQueryKey } from 'src/features/routing/AppRoutingContext';
import { SearchParams } from 'src/hooks/useNavigatePage';

/**
 * Hook checking whether we are in PDF generation mode
 */
export function useIsPdf() {
  return useQueryKey(SearchParams.Pdf) === '1';
}
