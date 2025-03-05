import { createHookContext } from 'src/core/contexts/hookContext';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useCommitWhenFinished } from 'src/utils/layout/generator/CommitQueue';

const { Provider, hooks } = createHookContext({
  useDefaultDataType: () => DataModels.useDefaultDataType(),
  useIsForcedVisibleByDevTools: () => useDevToolsStore((state) => state.isOpen && state.hiddenComponents !== 'hide'),
  useGetDataElementIdForDataType: () => DataModels.useGetDataElementIdForDataType(),
  useCommitWhenFinished: () => useCommitWhenFinished(),
});

export const GeneratorData = {
  Provider,
  useDefaultDataType: hooks.useDefaultDataType,
  useIsForcedVisibleByDevTools: hooks.useIsForcedVisibleByDevTools,
  useGetDataElementIdForDataType: hooks.useGetDataElementIdForDataType,
  useCommitWhenFinished: hooks.useCommitWhenFinished,
};
