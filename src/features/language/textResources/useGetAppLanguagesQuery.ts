import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import type { IAppLanguage } from 'src/types/shared';

export function useGetAppLanguageQuery() {
  const { fetchAppLanguages } = useAppQueries();
  return useQuery({
    queryKey: ['fetchAppLanguages'],
    queryFn: () => fetchAppLanguages(),
    select,
  });
}

function select(appLanguages: IAppLanguage[]) {
  return appLanguages.map((lang) => lang.language);
}
