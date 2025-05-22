import { useTranslation } from 'react-i18next';

import dot from 'dot-object';
import z from 'zod';
import { useStore } from 'zustand';
import type { TOptionsBase } from 'i18next';
import type { $Dictionary } from 'i18next/typescript/helpers';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useLangToolsDataSources } from 'src/features/language/LangToolsStore';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { variableSchema } from 'src/next/language/i18n';
import { layoutStore } from 'src/next-prev/stores/layoutStore';
import type { LangDataSources } from 'src/features/language/LangDataSourcesProvider';
import type { Variable } from 'src/next/language/i18n';
import type { DataObject } from 'src/next-prev/stores/layoutStore';

const resolvedTranslationSchema = z.object({
  value: z.string(),
  variables: z.array(variableSchema).nullable(),
});

export function useResolveText() {
  const selectedLanguage = useCurrentLanguage();
  const { t } = useTranslation();
  const langToolsDataSources = useLangToolsDataSources();
  const defaultDataModelName = DataModels.useDefaultDataType();
  const dataModels = useStore(layoutStore, (state) => state.data);

  return (key: string | string[], options?: TOptionsBase & $Dictionary): string => {
    const resolved = t(key, { ...options, lng: selectedLanguage });

    const parsed = resolvedTranslationSchema.parse(resolved);

    const resolvedVariables = resolveVariables(
      parsed.variables ?? [],
      langToolsDataSources,
      defaultDataModelName,
      dataModels,
    );

    return interpolateVariables(parsed.value, resolvedVariables ?? []);
  };
}

function resolveVariables(
  variables: Variable[],
  dataSources: LangDataSources | undefined,
  defaultDataModelName: string | undefined,
  dataModels: { [modelName: string]: DataObject } | undefined,
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
        const dataModelName = variable.dataSource.split('.')[1];

        const dataModelData =
          dataModels?.[dataModelName === 'default' && defaultDataModelName ? defaultDataModelName : dataModelName];

        const value = dot.pick(variable.key, dataModelData);

        if (value) {
          return value;
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
