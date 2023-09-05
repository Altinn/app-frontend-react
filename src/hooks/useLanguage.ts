import { useContext, useMemo } from 'react';
import type { JSX } from 'react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { getLanguageFromCode } from 'src/language/languages';
import { getParsedLanguageFromText, replaceParameters } from 'src/language/sharedLanguage';
import { FormComponentContext } from 'src/layout';
import { buildInstanceContext } from 'src/utils/instanceContext';
import type { IFormData } from 'src/features/formData';
import type { FixedLanguageList } from 'src/language/languages';
import type { IRuntimeState } from 'src/types';
import type { IApplicationSettings, IInstanceContext, ILanguage, ITextResource, IVariable } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ValidParam = string | number | undefined;

export interface IUseLanguage {
  language: ILanguage;
  selectedLanguage: string;
  lang(key: ValidLanguageKey | string | undefined, params?: ValidParam[]): string | JSX.Element | JSX.Element[] | null;
  langAsString(key: ValidLanguageKey | string | undefined, params?: ValidParam[]): string;

  /**
   * There are still some places that manipulate text resources directly, so exposing them here for now.
   * @deprecated Please do not use this functionality in new code.
   */
  textResources: ITextResource[];

  /**
   * @deprecated Please do not use this functionality in new code. This function looks up the key, but if the key is not
   * found in either text resources or the app language list, it will return an empty string (instead of the key itself,
   * as is default). This behaviour makes it impossible to hard-code texts by just using the raw text as keys, so it
   * may lead to unexpected behaviour.
   */
  langAsStringOrEmpty(key: ValidLanguageKey | string | undefined, params?: ValidParam[]): string;
}

interface TextResourceVariablesDataSources {
  node: LayoutNode | undefined;
  formData: IFormData;
  applicationSettings: IApplicationSettings | null;
  instanceContext: IInstanceContext | null;
}

/**
 * This type converts the language object into a dot notation union of valid language keys.
 * Using this type helps us get suggestions for valid language keys in useLanguage() functions.
 * Thanks to ChatGPT for refinements to make this work!
 */
type ObjectToDotNotation<T extends Record<string, any>, Prefix extends string = ''> = {
  [K in keyof T]: K extends string
    ? T[K] extends string | number | boolean | null | undefined
      ? `${Prefix}${K}`
      : K extends string
      ? ObjectToDotNotation<T[K], `${Prefix}${K}.`>
      : never
    : never;
}[keyof T];

export type ValidLanguageKey = ObjectToDotNotation<FixedLanguageList>;

const defaultLocale = 'nb';

/**
 * Hook to resolve a key to a language string or React element (if the key is found and contains markdown or HTML).
 * Prefer this over using the long-named language functions. When those are less used, we can refactor their
 * functionality into this hook and remove them.
 *
 * You get two functions from this hook, and you can choose which one to use based on your needs:
 * - lang(key, params) usually returns a React element
 */
export function useLanguage(node?: LayoutNode) {
  const textResources = useAppSelector((state) => state.textResources.resources);
  const profileLanguage = useAppSelector((state) => state.profile.profile.profileSettingPreference.language);
  const selectedAppLanguage = useAppSelector((state) => state.profile.selectedAppLanguage);
  const componentCtx = useContext(FormComponentContext);
  const nearestNode = node || componentCtx?.node;
  const formData = useAppSelector((state) => state.formData.formData);
  const applicationSettings = useAppSelector((state) => state.applicationSettings.applicationSettings);
  const instanceContext = useAppSelector((state) => buildInstanceContext(state.instanceData?.instance));
  const dataSources: TextResourceVariablesDataSources = useMemo(
    () => ({
      node: nearestNode,
      formData,
      applicationSettings,
      instanceContext,
    }),
    [nearestNode, formData, applicationSettings, instanceContext],
  );

  return useMemo(
    () => staticUseLanguage(textResources, null, selectedAppLanguage, profileLanguage, dataSources),
    [profileLanguage, selectedAppLanguage, textResources, dataSources],
  );
}

/**
 * Static version of useLanguage() for use outside of React components. Can be used from sagas, etc.
 */
export function staticUseLanguageFromState(state: IRuntimeState, node?: LayoutNode) {
  const textResources = state.textResources.resources;
  const profileLanguage = state.profile.profile.profileSettingPreference.language;
  const selectedAppLanguage = state.profile.selectedAppLanguage;
  const formData = state.formData.formData;
  const applicationSettings = state.applicationSettings.applicationSettings;
  const instanceContext = buildInstanceContext(state.instanceData?.instance);
  const dataSources: TextResourceVariablesDataSources = {
    node,
    formData,
    applicationSettings,
    instanceContext,
  };

  return staticUseLanguage(textResources, null, selectedAppLanguage, profileLanguage, dataSources);
}

interface ILanguageState {
  textResources: ITextResource[];
  language: ILanguage | null;
  selectedAppLanguage: string | undefined;
  profileLanguage: string | undefined;
  dataSources: TextResourceVariablesDataSources;
}

/**
 * Static version, like the above and below functions, but with an API that lets you pass just the state you need.
 * This is useful for testing, but please do not use this in production code (where all arguments should be passed,
 * even if the signature is updated).
 */
export function staticUseLanguageForTests({
  textResources = [],
  language = null,
  profileLanguage = 'nb',
  selectedAppLanguage = undefined,
  dataSources = {
    instanceContext: {
      instanceId: 'instanceId',
      appId: 'org/app',
      instanceOwnerPartyId: '12345',
      instanceOwnerPartyType: 'person',
    },
    formData: {},
    applicationSettings: {},
    node: undefined,
  },
}: Partial<ILanguageState> = {}) {
  return staticUseLanguage(textResources, language, selectedAppLanguage, profileLanguage, dataSources);
}

function staticUseLanguage(
  textResources: ITextResource[],
  _language: ILanguage | null,
  selectedAppLanguage: string | undefined,
  profileLanguage: string | undefined,
  dataSources: TextResourceVariablesDataSources,
): IUseLanguage {
  const langKey = selectedAppLanguage || profileLanguage || defaultLocale;
  const language = _language || getLanguageFromCode(langKey);

  /**
   * TODO: Clean away any markdown/HTML formatting when using the langAsString function. Even though we support
   * returning a string, we don't want to show markdown/HTML in the UI.
   *
   * TODO: Make text resources and language keys simpler and more performant to look up by using maps instead of
   * arrays and deep objects.
   */

  return {
    language,
    selectedLanguage: langKey,
    lang: (key, params) => {
      if (!key) {
        return '';
      }

      const textResource = getTextResourceByKey(key, textResources, dataSources);
      if (textResource !== key) {
        return getParsedLanguageFromText(textResource);
      }

      const name = getLanguageFromKey(key, language);
      const paramParsed = params ? replaceParameters(name, params) : name;

      return getParsedLanguageFromText(paramParsed);
    },
    langAsString: (key, params) => {
      if (!key) {
        return '';
      }

      const textResource = getTextResourceByKey(key, textResources, dataSources);
      if (textResource !== key) {
        return textResource;
      }

      const name = getLanguageFromKey(key, language);
      return params ? replaceParameters(name, params) : name;
    },
    textResources,
    langAsStringOrEmpty: (key, params) => {
      if (!key) {
        return '';
      }

      const textResource = getTextResourceByKey(key, textResources, dataSources);
      if (textResource !== key) {
        return textResource;
      }

      const name = getLanguageFromKey(key, language);
      const result = params ? replaceParameters(name, params) : name;
      if (result === key) {
        return '';
      }

      return result;
    },
  };
}

function getLanguageFromKey(key: string, language: ILanguage) {
  const path = key.split('.');
  const value = getNestedObject(language, path);
  if (!value || typeof value === 'object') {
    return key;
  }
  return value;
}

function getTextResourceByKey(
  key: string,
  textResources: ITextResource[],
  dataSources: TextResourceVariablesDataSources,
) {
  const textResource = textResources.find((resource) => resource.id === key);
  if (!textResource) {
    return key;
  }

  // Checks if this text resource is a reference to another text resource.
  // This is a common case when using likert component
  // TODO: When using a more performant data structure for text resources, we can do this recursively until we find
  // the target text resource.
  const resource = textResources.find((resource) => resource.id === textResource.value) || textResource;
  if (resource && resource.variables) {
    return replaceVariables(resource.value, resource.variables, dataSources);
  }

  return resource.value;
}

function replaceVariables(text: string, variables: IVariable[], dataSources: TextResourceVariablesDataSources) {
  const { node, formData, instanceContext, applicationSettings } = dataSources;
  let out = text;
  for (const idx in variables) {
    const variable = variables[idx];
    let value = variables[idx].key;

    if (variable.dataSource.startsWith('dataModel')) {
      const cleanPath = value.replaceAll(/\[\{\d+}]/g, '');
      const transposedPath = node?.transposeDataModel(cleanPath);
      if (transposedPath && formData && formData[transposedPath]) {
        value = formData[transposedPath];
      }
    } else if (variable.dataSource === 'instanceContext') {
      value = instanceContext && variable.key in instanceContext ? instanceContext[variable.key] : value;
    } else if (variable.dataSource === 'applicationSettings') {
      value = applicationSettings && variable.key in applicationSettings ? applicationSettings[variable.key] : value;
    }

    out = out.replaceAll(`{${idx}}`, value);
  }

  return out;
}

function getNestedObject(nestedObj: ILanguage, pathArr: string[]) {
  return pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined), nestedObj);
}
