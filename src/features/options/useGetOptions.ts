import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import deepEqual from 'fast-deep-equal';

import { DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { castOptionsToStrings } from 'src/features/options/castOptionsToStrings';
import { useGetOptionsQuery } from 'src/features/options/useGetOptionsQuery';
import { useNodeOptions } from 'src/features/options/useNodeOptions';
import { useSourceOptions } from 'src/hooks/useSourceOptions';
import { useGetAwaitingCommits } from 'src/utils/layout/generator/GeneratorStages';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { filterDuplicateOptions, verifyOptions } from 'src/utils/options';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { IDataModelBindingsOptionsSimple, IDataModelBindingsSimple } from 'src/layout/common.generated';
import type { CompIntermediateExact, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export type OptionsValueType = 'single' | 'multi';

interface FetchOptionsProps {
  valueType: OptionsValueType;
  node: LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  item: CompIntermediateExact<CompWithBehavior<'canHaveOptions'>>;
}

interface SetOptionsProps {
  valueType: OptionsValueType;
  dataModelBindings?: IDataModelBindingsOptionsSimple | IDataModelBindingsSimple;
}

export interface GetOptionsResult {
  // The final list of options deduced from the component settings. This will be an array of objects, where each object
  // has a string-typed 'value' property, regardless of the underlying options configuration.
  options: IOptionInternal[];

  // Whether the options are currently being fetched from the API. This is usually false in normal components, as
  // options are always fetched on page load, but it can be true if the options are fetched dynamically based on
  // mapping or query parameters. In those cases you most likely want to render a spinner.
  isFetching: boolean;
}

export interface SetOptionsResult {
  // This is guaranteed to only contain values that actually exist in the options that are returned.
  // The Combobox component will crash if a value does not exist in the options list.
  // The values are guaranteed to be stringy even if the underlying options JSON and/or data model contains numbers, booleans, etc.
  selectedValues: string[];

  // This is the raw value(s) from the data model. It is not guaranteed to be valid, and may
  // contain values that do not exist in the options list.
  unsafeSelectedValues: string[];

  rawData: string;

  setData: (values: string[]) => void;

  // Workaround for dropdown (Combobox single) not clearing text input when value changes
  // Can be used in the key-prop, will change every time the value changes
  key: number;
}

interface EffectProps {
  node: LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  item: CompIntermediateExact<CompWithBehavior<'canHaveOptions'>>;
  options: IOptionInternal[] | undefined;
  preselectedOption: IOptionInternal | undefined;
  unsafeSelectedValues: string[];
  setValue: (values: string[]) => void;
  valueType: OptionsValueType;
}

const defaultOptions: IOptionInternal[] = [];

type SortOrder = 'asc' | 'desc';
const compareOptionAlphabetically =
  (langAsString: IUseLanguage['langAsString'], sortOrder: SortOrder = 'asc', language: string = 'nb') =>
  (a: IOptionInternal, b: IOptionInternal) => {
    const comparison = langAsString(a.label).localeCompare(langAsString(b.label), language, {
      sensitivity: 'base',
      numeric: true,
    });
    return sortOrder === 'asc' ? comparison : -comparison;
  };

function useSetOptions(props: SetOptionsProps, alwaysOptions: IOptionInternal[]): SetOptionsResult {
  const { valueType, dataModelBindings } = props;
  const { formData, setValue } = useDataModelBindings(dataModelBindings);
  const value = formData.simpleBinding ?? '';

  const currentValues = useMemo(
    () => (value && value.length > 0 ? (valueType === 'multi' ? value.split(',') : [value]) : []),
    [value, valueType],
  );

  const selectedValues = useMemo(
    () => currentValues.filter((value) => alwaysOptions.find((option) => option.value === value)),
    [alwaysOptions, currentValues],
  );

  const [key, setKey] = useState(0);
  const setData = useCallback(
    (values: string[]) => {
      if (valueType === 'single') {
        setValue('simpleBinding', values.at(0));
      } else if (valueType === 'multi') {
        setValue('simpleBinding', values.join(','));
      }
      setKey((k) => k + 1); // Workaround for Combobox
    },
    [setValue, valueType],
  );

  return {
    key,
    rawData: value,
    selectedValues,
    unsafeSelectedValues: currentValues,
    setData,
  };
}
/**
 * If given the 'preselectedOptionIndex' property, we should automatically select the given option index as soon
 * as options are ready. The code is complex to guard against overwriting data that has been set by the user.
 */
function useEffectPreselectedOptionIndex({ node, setValue, preselectedOption, unsafeSelectedValues }: EffectProps) {
  const isNodeHidden = Hidden.useIsHidden(node);
  const isNodesReady = NodesInternal.useIsReady();
  const hasSelectedInitial = useRef(false);
  const hasValue = unsafeSelectedValues.length > 0;
  const shouldSelectOptionAutomatically =
    !hasValue &&
    !hasSelectedInitial.current &&
    preselectedOption !== undefined &&
    isNodesReady &&
    isNodeHidden !== true;

  useEffect(() => {
    if (shouldSelectOptionAutomatically) {
      setValue([preselectedOption.value]);
      hasSelectedInitial.current = true;
    }
  }, [preselectedOption, shouldSelectOptionAutomatically, setValue]);
}

/**
 * If options has changed and the values no longer include the current value, we should clear the value.
 * This is especially useful when fetching options from an API with mapping, or when generating options
 * from a repeating group. If the options changed and the selected option (or selected row in a repeating group)
 * is gone, we should not save stale/invalid data, so we clear it.
 */
function useEffectRemoveStaleValues(props: EffectProps) {
  const isNodeHidden = Hidden.useIsHidden(props.node);
  const isNodesReady = NodesInternal.useIsReady();
  const [_, setForceRerender] = useState(0);
  const getAwaiting = useGetAwaitingCommits();
  const ready = isNodesReady && !isNodeHidden;
  useEffect(() => {
    const { options, unsafeSelectedValues, setValue } = props;
    if (!options || !ready) {
      return;
    }
    const awaitingCommits = getAwaiting();
    if (awaitingCommits > 0) {
      // We should not remove values if there are pending commits. We'll force a re-render to delay this check until
      // the pending commits are done. This is needed because getAwaiting() is not reactive.
      setForceRerender((r) => r + 1);
      return;
    }

    const itemsToRemove = unsafeSelectedValues.filter((v) => !options.find((option) => option.value === v));
    if (itemsToRemove.length > 0) {
      setValue(unsafeSelectedValues.filter((v) => !itemsToRemove.includes(v)));
    }
  }, [props, getAwaiting, ready]);
}

/**
 * This effect is responsible for setting the label/display value in the data model.
 */
function useEffectStoreLabel({ node, item, options, unsafeSelectedValues, valueType }: EffectProps) {
  const isNodeHidden = Hidden.useIsHidden(node);
  const isNodesReady = NodesInternal.useIsReady();
  const dataModelBindings = item.dataModelBindings as IDataModelBindingsOptionsSimple | undefined;
  const { langAsString } = useLanguage();
  const { setValue, formData } = useDataModelBindings(dataModelBindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');

  const translatedLabels = useMemo(
    () =>
      options
        ?.filter((option) => unsafeSelectedValues.includes(option.value))
        .map((option) => option.label)
        .map((label) => langAsString(label)),
    [langAsString, options, unsafeSelectedValues],
  );

  const labelsHaveChanged = !deepEqual(translatedLabels, 'label' in formData ? formData.label : undefined);
  const shouldSetData =
    labelsHaveChanged && !isNodeHidden && isNodesReady && dataModelBindings && 'label' in dataModelBindings;

  useEffect(() => {
    if (!shouldSetData) {
      return;
    }

    if (!translatedLabels || translatedLabels.length === 0) {
      setValue('label', undefined);
      return;
    } else if (valueType === 'single') {
      setValue('label', translatedLabels.at(0));
    } else {
      setValue('label', translatedLabels);
    }
  }, [setValue, shouldSetData, translatedLabels, valueType]);
}

export function useFetchOptions({ node, valueType, item }: FetchOptionsProps): GetOptionsResult {
  const { options, optionsId, secure, source, mapping, queryParameters, sortOrder, dataModelBindings } = item;
  const preselectedOptionIndex = 'preselectedOptionIndex' in item ? item.preselectedOptionIndex : undefined;
  const { langAsString } = useLanguage();
  const selectedLanguage = useCurrentLanguage();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { setValue } = useDataModelBindings(item.dataModelBindings as any);

  const sourceOptions = useSourceOptions({ source, node });
  const staticOptions = useMemo(() => (optionsId ? undefined : castOptionsToStrings(options)), [options, optionsId]);
  const { data: fetchedOptions, isFetching, isError } = useGetOptionsQuery(optionsId, mapping, queryParameters, secure);

  const [calculatedOptions, preselectedOption] = useMemo(() => {
    let draft = sourceOptions || fetchedOptions?.data || staticOptions;
    verifyOptions(draft, valueType === 'multi');
    let preselectedOption: IOptionInternal | undefined = undefined;
    if (preselectedOptionIndex !== undefined && draft && draft[preselectedOptionIndex]) {
      // This index uses the original options array, before any filtering or sorting
      preselectedOption = draft[preselectedOptionIndex];
    }

    verifyOptions(draft, valueType === 'multi');

    if (draft && draft.length < 2) {
      // No need to sort or filter if there are 0 or 1 options. Using langAsString() can lead to re-rendering, so
      // we avoid it if we don't need it.
      return [draft, preselectedOption];
    }

    if (draft) {
      draft = filterDuplicateOptions(draft);
    }
    if (draft && sortOrder) {
      draft = [...draft].sort(compareOptionAlphabetically(langAsString, sortOrder, selectedLanguage));
    }

    return [draft, preselectedOption];
  }, [
    fetchedOptions?.data,
    langAsString,
    preselectedOptionIndex,
    selectedLanguage,
    sortOrder,
    sourceOptions,
    staticOptions,
    valueType,
  ]);

  // Log error if fetching options failed
  useEffect(() => {
    if (isError) {
      const _optionsId = optionsId ? `\noptionsId: ${optionsId}` : '';
      const _mapping = mapping ? `\nmapping: ${JSON.stringify(mapping)}` : '';
      const _queryParameters = queryParameters ? `\nqueryParameters: ${JSON.stringify(queryParameters)}` : '';
      const _secure = secure ? `\nsecure: ${secure}` : '';

      window.logErrorOnce(
        `Failed to fetch options for node ${node.id}${_optionsId}${_mapping}${_queryParameters}${_secure}`,
      );
    }
  }, [isError, mapping, node, optionsId, queryParameters, secure]);

  const alwaysOptions = calculatedOptions || defaultOptions;
  const { unsafeSelectedValues, setData } = useSetOptions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { valueType, dataModelBindings: dataModelBindings as any },
    alwaysOptions,
  );

  const downstreamParameters: string = fetchedOptions?.headers['altinn-downstreamparameters'];
  useEffect(() => {
    if (dataModelBindings && 'metadata' in dataModelBindings && dataModelBindings.metadata && downstreamParameters) {
      // The value might be url-encoded
      setValue('metadata', decodeURIComponent(downstreamParameters));
    }
  }, [dataModelBindings, downstreamParameters, setValue]);

  const effectProps: EffectProps = useMemo(
    () => ({
      node,
      item,
      options: calculatedOptions,
      valueType,
      preselectedOption,
      unsafeSelectedValues,
      setValue: setData,
    }),
    [calculatedOptions, valueType, preselectedOption, unsafeSelectedValues, setData, node, item],
  );

  useEffectPreselectedOptionIndex(effectProps);
  useEffectRemoveStaleValues(effectProps);
  useEffectStoreLabel(effectProps);

  return {
    options: alwaysOptions,
    isFetching,
  };
}

export function useGetOptions(
  node: LayoutNode<CompWithBehavior<'canHaveOptions'>>,
  valueType: OptionsValueType,
): GetOptionsResult & SetOptionsResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataModelBindings = useNodeItem(node, (i) => i.dataModelBindings) as any;
  const get = useNodeOptions(node);
  const set = useSetOptions({ valueType, dataModelBindings }, get.options);

  return useMemo(() => ({ ...get, ...set }), [get, set]);
}
