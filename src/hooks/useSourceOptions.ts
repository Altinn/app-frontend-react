import type { IOptionResources } from 'src/hooks/useGetOptions';
import type { IOptionSource } from 'src/layout/common.generated';
import type { IRepeatingGroups } from 'src/types';
import type { IDataSources } from 'src/types/shared';

interface ISourceOptionsArgs {
  source: IOptionSource | undefined;
  dataSources: IDataSources;
  repeatingGroups: IRepeatingGroups | undefined | null;
  relevantTextResources: IOptionResources;
}

export const useSourceOptions = ({
  source,
  dataSources,
  repeatingGroups = {},
  relevantTextResources,
}: ISourceOptionsArgs) => {
  const repGroup = Object.values(repeatingGroups ?? {}).find((group) => group.dataModelBinding === source?.group);

  if (!repGroup) {
    return undefined;
  }

  console.log('Relevant: ', relevantTextResources);

  return [];
};
