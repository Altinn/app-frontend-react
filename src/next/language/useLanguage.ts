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
import type { LangDataSources } from 'src/features/language/LangDataSourcesProvider';
import type { FormDataSelector } from 'src/layout';
import type { Variable } from 'src/next/language/i18n';

const resolvedTranslationSchema = z.object({
  value: z.string(),
  variables: z.array(variableSchema).nullable(),
});

export function useResolveText() {
  const selectedLanguage = useCurrentLanguage();
  const { t } = useTranslation();
  const langToolsDataSources = useLangToolsDataSources();
  const defaultDataModelName = DataModels.useDefaultDataType();
  // const dataModels = useStore(layoutStore, (state) => state.data);
  const formDataSelector = FD.useDebouncedSelector();

  return (key: string | string[], options?: TOptionsBase & $Dictionary): string => {
    const resolved = t(key, { ...options, lng: selectedLanguage });

    const parsed = resolvedTranslationSchema.parse(resolved);

    const resolvedVariables = resolveVariables(
      parsed.variables ?? [],
      langToolsDataSources,
      defaultDataModelName,
      formDataSelector,
    );

    return interpolateVariables(parsed.value, resolvedVariables ?? []);
  };
}

function resolveVariables(
  variables: Variable[],
  dataSources: LangDataSources | undefined,
  defaultDataModelName: string | undefined,
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

        const value = formDataSelector({ dataType: dataModelName, field: variable.key }); //dot.pick(variable.key, dataModelData);
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
