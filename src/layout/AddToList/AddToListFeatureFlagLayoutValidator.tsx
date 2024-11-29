import { getFeature } from 'src/features/toggles';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { NodeValidationProps } from 'src/layout/layout';

export function AddToListFeatureFlagLayoutValidator({ node }: NodeValidationProps<'AddToList'>) {
  const simpleTableEnabled = getFeature('addToListEnabled');

  const addError = NodesInternal.useAddError();
  if (!simpleTableEnabled.value) {
    const error = `You need to enable the feature flag addToListEnabled to use this component. Please note that the component is experimental
    and the configuration is likely to change.`;
    addError(error, node);
    window.logErrorOnce(`Validation error for '${node.id}': ${error}`);
  }
  return null;
}
