import { useEffect, useState } from 'react';

import deepEqual from 'fast-deep-equal';

import { useGetOptionsUsingDmb } from 'src/features/options/useGetOptions';
import { useAsRef } from 'src/hooks/useAsRef';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { useGetAwaitingCommits } from 'src/utils/layout/generator/GeneratorStages';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import type { GeneratorOptionProps } from 'src/features/options/StoreOptionsInNode';
import type { GetOptionsResult, SetOptionsResult } from 'src/features/options/useGetOptions';
import type { IDataModelBindingsOptionsSimple } from 'src/layout/common.generated';
import type { CompIntermediate, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * If options has changed and the values no longer include the current value, we should clear the value.
 * This is especially useful when fetching options from an API with mapping, or when generating options
 * from a repeating group. If the options changed and the selected option (or selected row in a repeating group)
 * is gone, we should not save stale/invalid data, so we clear it.
 */
export function EffectRemoveStaleValues({ valueType }: GeneratorOptionProps) {
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  const isNodeHidden = Hidden.useIsHidden(node);
  const isNodesReady = NodesInternal.useIsReady();
  const [_, setForceRerender] = useState(0);
  const getAwaiting = useGetAwaitingCommits();
  const ready = isNodesReady && !isNodeHidden;
  const readyAsRef = useAsRef(ready);

  const item = GeneratorInternal.useIntermediateItem() as CompIntermediate<CompWithBehavior<'canHaveOptions'>>;
  const dataModelBindings = item.dataModelBindings as IDataModelBindingsOptionsSimple | undefined;
  const options = useGetOptionsUsingDmb(node, valueType, dataModelBindings);
  const optionsAsRef = useAsRef(options);
  const itemsToRemove = getItemsToRemove(options);

  useEffect(() => {
    if (itemsToRemove.length === 0) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;
    function cleanup() {
      timeout !== undefined && clearTimeout(timeout);
    }

    function isReady() {
      if (!readyAsRef.current) {
        return false;
      }
      const awaitingCommits = getAwaiting();
      if (awaitingCommits > 0) {
        // We should not remove values if there are pending commits. We'll force a re-render to delay this check until
        // the pending commits are done. This is needed because getAwaiting() is not reactive.
        timeout = setTimeout(() => setForceRerender((r) => r + 1), 100);
        return false;
      }
      return true;
    }

    if (!isReady()) {
      return cleanup;
    }

    timeout = setTimeout(() => {
      // If you have larger sweeping changes in the data model happening at once, such as a data processing change
      // or a click on a CustomButton, we might not have run the hidden expressions yet when this effect runs.
      // We'll wait a bit to make sure the hidden expressions have run before we remove the values, and if we're
      // hidden at that point, skip the removal.
      const { options, unsafeSelectedValues, setData } = optionsAsRef.current;
      if (!options || !isReady()) {
        return;
      }
      const freshItemsToRemove = getItemsToRemove(optionsAsRef.current);
      if (freshItemsToRemove.length > 0 && deepEqual(freshItemsToRemove, itemsToRemove)) {
        setData(unsafeSelectedValues.filter((v) => !itemsToRemove.includes(v)));
      }
    }, 200);

    return cleanup;
  }, [getAwaiting, readyAsRef, optionsAsRef, itemsToRemove]);

  return null;
}

const emptyArray: never[] = [];
function getItemsToRemove(result: GetOptionsResult & SetOptionsResult): string[] {
  const { options, unsafeSelectedValues } = result;
  if (!options) {
    return emptyArray;
  }
  const itemsToRemove = unsafeSelectedValues.filter((v) => !options.find((option) => option.value === v));
  if (itemsToRemove.length === 0) {
    return emptyArray;
  }
  return itemsToRemove;
}
