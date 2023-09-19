import { useMemo } from 'react';

import { useGetOptionsQuery } from 'src/hooks/queries/useGetOptionsQuery';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useSourceOptions } from 'src/hooks/useSourceOptions';
import type { IMapping, IOption, IOptionSource } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface IUseGetOptionsParams {
  optionsId: string | undefined;
  mapping?: IMapping;
  queryParameters?: Record<string, string>;
  secure?: boolean;
  source?: IOptionSource;
  node: LayoutNode;
}

export function useGetOptions({
  optionsId,
  mapping,
  queryParameters,
  source,
  secure,
  node,
}: IUseGetOptionsParams): IOption[] | undefined {
  const sourceOptions = useSourceOptions({ source, node });

  const { instanceId } = window;

  // const { selectedLanguage } = useLanguage();
  const formData = useAppSelector((state) => state.formData.formData);
  // const repeatingGroups = useAppSelector((state) => state.formLayout?.uiConfig.repeatingGroups);

  // const { data: instance } = useCurrentInstanceQuery(instanceId || '', !!instanceId);
  // const { data: applicationSettings } = useApplicationSettingsQuery();
  // const { data: textResource } = useTextResourcesQuery(selectedLanguage, !!selectedLanguage);
  const { data: fetchedOptions } = useGetOptionsQuery(
    instanceId || '',
    optionsId || '',
    formData,
    mapping,
    queryParameters,
    secure,
    !!instanceId && !!optionsId && !!formData,
  );
  // const [options, setOptions] = useStateDeepEqual<IOption[] | undefined>(undefined);

  // const { label, description, helpText } = source || {};

  return useMemo(() => {
    if (sourceOptions) {
      return sourceOptions;
    }

    if (optionsId && fetchedOptions) {
      return fetchedOptions;
    }

    return undefined;
  }, [optionsId, fetchedOptions, sourceOptions]);

  // useEffect(() => {
  //   if (fetchedOptions && !fetchFailed) {
  //     setOptions(fetchedOptions);
  //   }

  //   if (!!source && !!repeatingGroups) {
  //     // // should be solved with useLanguage hook in setupSourceOptions
  //     const relevantFormData = (formData && getRelevantFormDataForOptionSource(formData, source)) || {};
  //     const findResourceById = (id?: string) => textResource?.resources?.find((resource) => resource.id === id);
  //     const relevantTextResources = {
  //       label: findResourceById(label),
  //       description: findResourceById(description),
  //       helpText: findResourceById(helpText),
  //     };

  //     const instanceContext = buildInstanceContext(instance);
  //     const dataSources: IDataSources = {
  //       dataModel: relevantFormData,
  //       applicationSettings: applicationSettings || {},
  //       instanceContext,
  //     };

  //     setOptions(
  //       setupSourceOptions({
  //         source,
  //         relevantTextResources,
  //         relevantFormData,
  //         repeatingGroups,
  //         dataSources,
  //       }),
  //     );
  //   }
  // }, [
  //   applicationSettings,
  //   instance,
  //   repeatingGroups,
  //   source,
  //   fetchedOptions,
  //   formData,
  //   label,
  //   description,
  //   helpText,
  //   textResource?.resources,
  //   fetchFailed,
  //   setOptions,
  // ]);
  // return options;
}

// export function useGetOptions({
//   optionsId,
//   mapping,
//   queryParameters,
//   source,
//   node,
// }: IUseGetOptionsParams): IOption[] | undefined {
// const optionState = useAppSelector((state) => state.optionState.options);
// const sourceOptions = useSourceOptions({ source, node });

//   return useMemo(() => {
//     if (sourceOptions) {
//       return sourceOptions;
//     }

//     if (optionsId) {
//       const key = getOptionLookupKey({ id: optionsId, mapping, fixedQueryParameters: queryParameters });
//       return optionState[key]?.options;
//     }

//     return undefined;
//   }, [optionsId, mapping, optionState, queryParameters, sourceOptions]);
// }
//----------------------------------------------
// export interface IOptionResources {
//   label?: ITextResource;
//   description?: ITextResource;
//   helpText?: ITextResource;
// }

// export const useGetOptions = ({ optionsId, mapping, queryParameters, secure, source }: IUseGetOptionsParams) => {
//   const { instanceId } = window;

//   const { selectedLanguage } = useLanguage();
//   const formData = useAppSelector((state) => state.formData.formData);
//   const repeatingGroups = useAppSelector((state) => state.formLayout?.uiConfig.repeatingGroups);

//   const { data: instance } = useCurrentInstanceQuery(instanceId || '', !!instanceId);
//   const { data: applicationSettings } = useApplicationSettingsQuery();
//   const { data: textResource } = useTextResourcesQuery(selectedLanguage, !!selectedLanguage);
//   const { data: fetchedOptions, error: fetchFailed } = useGetOptionsQuery(
//     instanceId || '',
//     optionsId || '',
//     formData,
//     mapping,
//     queryParameters,
//     secure,
//     !!instanceId && !!optionsId && !!formData,
//   );
//   const [options, setOptions] = useStateDeepEqual<IOption[] | undefined>(undefined);

//   const { label, description, helpText } = source || {};

//   useEffect(() => {
//     if (fetchedOptions && !fetchFailed) {
//       setOptions(fetchedOptions);
//     }

//     if (!!source && !!repeatingGroups) {
//       // // should be solved with useLanguage hook in setupSourceOptions
//       const relevantFormData = (formData && getRelevantFormDataForOptionSource(formData, source)) || {};
//       const findResourceById = (id?: string) => textResource?.resources?.find((resource) => resource.id === id);
//       const relevantTextResources = {
//         label: findResourceById(label),
//         description: findResourceById(description),
//         helpText: findResourceById(helpText),
//       };

//       const instanceContext = buildInstanceContext(instance);
//       const dataSources: IDataSources = {
//         dataModel: relevantFormData,
//         applicationSettings: applicationSettings || {},
//         instanceContext,
//       };

//       setOptions(
//         setupSourceOptions({
//           source,
//           relevantTextResources,
//           relevantFormData,
//           repeatingGroups,
//           dataSources,
//         }),
//       );
//     }
//   }, [
//     applicationSettings,
//     instance,
//     repeatingGroups,
//     source,
//     fetchedOptions,
//     formData,
//     label,
//     description,
//     helpText,
//     textResource?.resources,
//     fetchFailed,
//     setOptions,
//   ]);
//   return options;
// };
