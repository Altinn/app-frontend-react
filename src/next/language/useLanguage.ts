import { useTranslation } from 'react-i18next';

// eslint-disable-next-line import/no-named-as-default
import z from 'zod';
import type { TOptionsBase } from 'i18next';
import type { $Dictionary } from 'i18next/typescript/helpers';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { useLangToolsDataSources } from 'src/features/language/LangToolsStore';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { variableSchema } from 'src/next/language/i18n';
import { getDataModelPathWithIndices } from 'src/next/layout/GenericComponent';
import type { LangDataSources } from 'src/features/language/LangDataSourcesProvider';
import type { FormDataSelector } from 'src/layout';
import type { Variable } from 'src/next/language/i18n';
import type { CompExternal, CompTypes } from 'src/next-prev/stores/layoutStore';

export type ResolvedTexts<T extends CompTypes> =
  | Record<keyof NonNullable<CompExternal<T>['textResourceBindings']>, string>
  | undefined;

export function useResolvedTexts<T extends CompTypes>(
  textResourceBindings: CompExternal<T>['textResourceBindings'],
  indices: number[],
): ResolvedTexts<T> {
  const resolveText = useResolveText(indices);
  if (!textResourceBindings) {
    return undefined;
  }

  const resolvedTexts = {};

  Object.entries(textResourceBindings).forEach(([key, value]) => {
    resolvedTexts[key] = resolveText(value, { lng: 'en' });
  });

  return resolvedTexts as ResolvedTexts<T>; // FIXME:
}

const resolvedTranslationSchema = z.object({
  value: z.string(),
  variables: z.array(variableSchema).nullable(),
});

function useResolveText(indices: number[]) {
  const selectedLanguage = useCurrentLanguage();
  const { t } = useTranslation();
  const langToolsDataSources = useLangToolsDataSources();
  const defaultDataModelName = DataModels.useDefaultDataType();
  const formDataSelector = FD.useDebouncedSelector();

  return (key: string | string[], options?: TOptionsBase & $Dictionary): string => {
    const resolved = t(key, { ...options, lng: selectedLanguage });

    const parsed = resolvedTranslationSchema.parse(resolved);

    const resolvedVariables = resolveVariables(
      parsed.variables ?? [],
      langToolsDataSources,
      defaultDataModelName,
      indices,
      formDataSelector,
    );

    return interpolateVariables(parsed.value, resolvedVariables ?? []);
  };
}

function resolveVariables(
  variables: Variable[],
  dataSources: LangDataSources | undefined,
  defaultDataModelName: string | undefined,
  indices: number[],
  formDataSelector: FormDataSelector,
): string[] {
  return variables.map((variable) => resolveVariable(variable));

  function resolveVariable(variable: Variable): string {
    switch (variable.dataSource) {
      case 'instanceContext': {
        const value = dataSources?.instanceDataSources?.[variable.key];
        if (value) {
          return value;
        }
        break;
      }
      case 'applicationSettings': {
        // TODO: testing
        const value = dataSources?.applicationSettings?.[variable.key];
        if (value) {
          return value;
        }
        break;
      }
      default: {
        const providedDataModelName = variable.dataSource.split('.')[1];
        const dataModelName =
          providedDataModelName === 'default' && defaultDataModelName ? defaultDataModelName : providedDataModelName;
        const valuePath = getDataModelPathWithIndices(variable.key, indices);

        const value = formDataSelector({ dataType: dataModelName, field: valuePath });
        if (value) {
          return String(value);
        }
        if (value === null) {
          return '';
        }
        break;
      }
    }

    if ('defaultValue' in variable && variable.defaultValue != undefined) {
      return variable.defaultValue;
    }

    return '';
  }
}

function interpolateVariables(text: string, variables: string[]): string {
  const variableRegex = /\{(\d+)\}/;
  variables.forEach((variable) => {
    text = text.replace(variableRegex, () => variable);
  });
  return text;
}
