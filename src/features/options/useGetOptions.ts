import { useEffect, useMemo, useRef } from 'react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { castOptionsToStrings } from 'src/features/options/castOptionsToStrings';
import { useGetOptionsQuery } from 'src/features/options/useGetOptionsQuery';
import { useNodeOptions } from 'src/features/options/useNodeOptions';
import { useSourceOptions } from 'src/hooks/useSourceOptions';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { filterDuplicateOptions } from 'src/utils/options';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { IDataModelBindingsOptionsSimple, IDataModelBindingsSimple } from 'src/layout/common.generated';
import type { CompExternal, CompWithBehavior } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export type OptionsValueType = 'single' | 'multi';

const getLabelsForActiveOptions = (selectedOptions: string[], allOptions: IOptionInternal[]): string[] =>
  allOptions.filter((option) => selectedOptions.includes(option.value)).map((option) => option.label);

const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
const useHasChanged = (val: any) => {
  const prevVal = usePrevious(val);
  return prevVal !== val;
};

interface FetchOptionsProps<T extends OptionsValueType> {
  valueType: T;
  node: LayoutNode<CompWithBehavior<'canHaveOptions'>>;
  item: CompExternal<CompWithBehavior<'canHaveOptions'>>;
}

interface SetOptionsProps<T extends OptionsValueType> {
  valueType: T;
  dataModelBindings?: IDataModelBindingsOptionsSimple | IDataModelBindingsSimple;
}

type CurrentValue<T extends OptionsValueType> = T extends 'single' ? IOptionInternal | undefined : IOptionInternal[];
type CurrentValueAsString<T extends OptionsValueType> = T extends 'single' ? string : string[];
type ValueSetter<T extends OptionsValueType> = T extends 'single'
  ? (value: string | IOptionInternal) => void
  : (value: string[] | IOptionInternal[]) => void;

export interface GetOptionsResult {
  // The final list of options deduced from the component settings. This will be an array of objects, where each object
  // has a string-typed 'value' property, regardless of the underlying options configuration.
  options: IOptionInternal[];

  // Whether the options are currently being fetched from the API. This is usually false in normal components, as
  // options are always fetched on page load, but it can be true if the options are fetched dynamically based on
  // mapping or query parameters. In those cases you most likely want to render a spinner.
  isFetching: boolean;
}

export interface SetOptionsResult<T extends OptionsValueType> {
  // The current value, as an option (for single-option components) or an array of options (for multi-option components)
  // It is recommended to use this, and you can also compare this (object) value to the options (array of objects),
  // as the object references themselves are guaranteed to be the same.
  current: CurrentValue<T>;

  // The current value, as a string (for single-option components) or an array of strings (for multi-option components)
  // This is useful if the downstream component you're using does not support options objects. Also, the value is
  // guaranteed to be stringy even if the underlying options JSON and/or data model contains numbers, booleans, etc.
  currentStringy: CurrentValueAsString<T>;

  // Function to set the current value. The value can be either a string or an option object. For multi-option
  // components, you always set the value of all the selected options at the same time, not just one of them.
  setData: ValueSetter<T>;
}

interface EffectProps<T extends OptionsValueType> {
  options: IOptionInternal[] | undefined;
  valueType: T;
  preselectedOption: IOptionInternal | undefined;
  currentValue: CurrentValueAsString<T>;
  setValue: ValueSetter<T>;
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

function useSetOptions<T extends OptionsValueType>(
  props: SetOptionsProps<T>,
  alwaysOptions: IOptionInternal[],
): SetOptionsResult<T> {
  const { dataModelBindings, valueType } = props;
  const { formData, setValue } = useDataModelBindings(dataModelBindings);
  const value = formData.simpleBinding ?? '';
  const { langAsString } = useLanguage();

  const current = useMemo(() => {
    if (valueType === 'single') {
      return alwaysOptions.find((option) => String(option.value) === String(value)) as CurrentValue<T>;
    }
    const stringValues = value && value.length > 0 ? value.split(',') : [];
    return alwaysOptions.filter((option) => stringValues.includes(option.value)) as CurrentValue<T>;
  }, [value, valueType, alwaysOptions]);

  const currentStringy = useMemo(() => {
    if (valueType === 'single') {
      return (value || '') as CurrentValueAsString<T>;
    }
    return (value ? value.split(',') : []) as CurrentValueAsString<T>;
  }, [value, valueType]);

  const translatedLabels = useMemo(
    () =>
      getLabelsForActiveOptions(Array.isArray(currentStringy) ? currentStringy : [currentStringy], alwaysOptions).map(
        (label) => langAsString(label),
      ),
    [alwaysOptions, currentStringy, langAsString],
  );

  const labelsHaveChanged = useHasChanged(translatedLabels.join(','));

  useEffect(() => {
    if (!(dataModelBindings as IDataModelBindingsOptionsSimple)?.label) {
      return;
    }

    if (!labelsHaveChanged) {
      return;
    }

    if (valueType === 'single') {
      const labelToSet = translatedLabels?.length > 0 ? translatedLabels[0] : undefined;
      setValue('label' as any, labelToSet);
    } else {
      setValue('label' as any, translatedLabels);
    }
  }, [translatedLabels, labelsHaveChanged, dataModelBindings, setValue, valueType]);

  const setData = useMemo(() => {
    if (valueType === 'single') {
      return (value: string | IOptionInternal) =>
        setValue('simpleBinding', typeof value === 'string' ? value : value.value);
    }

    return (value: (string | IOptionInternal)[]) => {
      const asString = value.map((v) => (typeof v === 'string' ? v : v.value)).join(',');
      setValue('simpleBinding', asString);
    };
  }, [setValue, valueType]) as ValueSetter<T>;

  return {
    current,
    currentStringy,
    setData,
  };
}
/**
 * If given the 'preselectedOptionIndex' property, we should automatically select the given option index as soon
 * as options are ready. The code is complex to guard against overwriting data that has been set by the user.
 */
function usePreselectedOptionIndex<T extends OptionsValueType>(props: EffectProps<T>) {
  const { preselectedOption } = props;
  const hasSelectedInitial = useRef(false);
  const hasValue = isSingle(props) ? !!props.currentValue : isMulti(props) ? props.currentValue.length > 0 : false;
  const shouldSelectOptionAutomatically = !hasValue && !hasSelectedInitial.current;

  useEffect(() => {
    if (shouldSelectOptionAutomatically && preselectedOption !== undefined) {
      if (isMulti(props)) {
        props.setValue([preselectedOption]);
      } else if (isSingle(props)) {
        props.setValue(preselectedOption);
      }
      hasSelectedInitial.current = true;
    }
  }, [preselectedOption, props, shouldSelectOptionAutomatically]);
}

/**
 * If options has changed and the values no longer include the current value, we should clear the value.
 * This is especially useful when fetching options from an API with mapping, or when generating options
 * from a repeating group. If the options changed and the selected option (or selected row in a repeating group)
 * is gone, we should not save stale/invalid data, so we clear it.
 */
function useRemoveStaleValues<T extends OptionsValueType>(props: EffectProps<T>) {
  const { options } = props;
  useEffect(() => {
    if (options && isSingle(props)) {
      const { currentValue, setValue } = props;
      if (currentValue && !options.find((option) => option.value === currentValue)) {
        setValue('');
      }
    } else if (options && isMulti(props)) {
      const { currentValue, setValue } = props;
      const itemsToRemove = currentValue.filter((v) => !options.find((option) => option.value === v));
      if (itemsToRemove.length > 0) {
        setValue(currentValue.filter((v) => !itemsToRemove.includes(v)));
      }
    }
  }, [options, props]);
}

function isSingle(props: EffectProps<OptionsValueType>): props is EffectProps<'single'> {
  return props.valueType === 'single';
}

function isMulti(props: EffectProps<OptionsValueType>): props is EffectProps<'multi'> {
  return props.valueType === 'multi';
}

export function useFetchOptions<T extends OptionsValueType>({
  node,
  valueType,
  item,
}: FetchOptionsProps<T>): GetOptionsResult {
  const { options, optionsId, secure, source, mapping, queryParameters, sortOrder, dataModelBindings } = item;
  const preselectedOptionIndex = 'preselectedOptionIndex' in item ? item.preselectedOptionIndex : undefined;
  const { langAsString } = useLanguage();
  const selectedLanguage = useCurrentLanguage();
  const { setValue } = useDataModelBindings(item.dataModelBindings as any);

  const sourceOptions = useSourceOptions({ source, node });
  const staticOptions = useMemo(() => (optionsId ? undefined : castOptionsToStrings(options)), [options, optionsId]);
  const { data: fetchedOptions, isFetching, isError } = useGetOptionsQuery(optionsId, mapping, queryParameters, secure);

  const [calculatedOptions, preselectedOption] = useMemo(() => {
    let draft = sourceOptions || fetchedOptions?.data || staticOptions;
    let preselectedOption: IOptionInternal | undefined = undefined;
    if (preselectedOptionIndex !== undefined && draft && draft[preselectedOptionIndex]) {
      // This index uses the original options array, before any filtering or sorting
      preselectedOption = draft[preselectedOptionIndex];
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
  ]);

  // Log error if fetching options failed
  useEffect(() => {
    if (isError) {
      const _optionsId = optionsId ? `\noptionsId: ${optionsId}` : '';
      const _mapping = mapping ? `\nmapping: ${JSON.stringify(mapping)}` : '';
      const _queryParameters = queryParameters ? `\nqueryParameters: ${JSON.stringify(queryParameters)}` : '';
      const _secure = secure ? `\nsecure: ${secure}` : '';

      window.logErrorOnce(
        `Failed to fetch options for node ${node.getId()}${_optionsId}${_mapping}${_queryParameters}${_secure}`,
      );
    }
  }, [isError, mapping, node, optionsId, queryParameters, secure]);

  const alwaysOptions = calculatedOptions || defaultOptions;
  const { currentStringy, setData } = useSetOptions(
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

  const effectProps: EffectProps<T> = useMemo(
    () => ({
      options: calculatedOptions,
      valueType,
      preselectedOption,
      currentValue: currentStringy,
      setValue: setData,
    }),
    [calculatedOptions, currentStringy, preselectedOption, setData, valueType],
  );

  usePreselectedOptionIndex(effectProps);
  useRemoveStaleValues(effectProps);

  return {
    options: alwaysOptions,
    isFetching,
  };
}

export function useGetOptions<T extends OptionsValueType>(
  node: LayoutNode<CompWithBehavior<'canHaveOptions'>>,
  valueType: T,
): GetOptionsResult & SetOptionsResult<T> {
  const dataModelBindings = useNodeItem(node, (i) => i.dataModelBindings) as any;
  const get = useNodeOptions(node);
  const set = useSetOptions({ valueType, dataModelBindings }, get.options);

  return useMemo(() => ({ ...get, ...set }), [get, set]);
}
