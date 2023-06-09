import { useMemo } from 'react';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { getLanguageFromCode } from 'src/language/languages';
import { getParsedLanguageFromKey, getParsedLanguageFromText, getTextResourceByKey } from 'src/language/sharedLanguage';
import type { FixedLanguageList } from 'src/language/languages';
import type { IRuntimeState, ITextResource } from 'src/types';
import type { ILanguage } from 'src/types/shared';

type ValidParam = string | number | undefined;

export interface IUseLanguage {
  selectedLanguage: string;
  lang(key: ValidLanguageKey | string | undefined, params?: ValidParam[]): string | JSX.Element | JSX.Element[] | null;
  langAsString(key: ValidLanguageKey | string | undefined, params?: ValidParam[]): string;

  /**
   * @deprecated Please do not use this functionality in new code. This function looks up the key, but if the key is not
   * found in either text resources or the app language list, it will return an empty string (instead of the key itself,
   * as is default). This behaviour makes it impossible to hard-code texts by just using the raw text as keys, so it
   * may lead to unexpected behaviour.
   */
  langAsStringOrEmpty(key: ValidLanguageKey | string | undefined, params?: ValidParam[]): string;
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
export function useLanguage() {
  const textResources = useAppSelector((state) => state.textResources.resources);
  const language = useAppSelector((state) => state.language.language);
  const profileLanguage = useAppSelector((state) => state.profile.profile.profileSettingPreference.language);
  const selectedAppLanguage = useAppSelector((state) => state.profile.selectedAppLanguage);

  return useMemo(
    () => staticUseLanguage(textResources, language, selectedAppLanguage, profileLanguage),
    [language, profileLanguage, selectedAppLanguage, textResources],
  );
}

/**
 * Static version of useLanguage() for use outside of React components. Can be used from sagas, etc.
 */
export function staticUseLanguageFromState(state: IRuntimeState) {
  const textResources = state.textResources.resources;
  const language = state.language.language;
  const profileLanguage = state.profile.profile.profileSettingPreference.language;
  const selectedAppLanguage = state.profile.selectedAppLanguage;

  return staticUseLanguage(textResources, language, selectedAppLanguage, profileLanguage);
}

interface ILanguageState {
  textResources: ITextResource[];
  language: ILanguage | null;
  selectedAppLanguage: string | undefined;
  profileLanguage: string | undefined;
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
  selectedAppLanguage = 'nb',
}: Partial<ILanguageState> = {}) {
  return staticUseLanguage(textResources, language, selectedAppLanguage, profileLanguage);
}

function staticUseLanguage(
  textResources: ITextResource[],
  _language: ILanguage | null,
  selectedAppLanguage: string | undefined,
  profileLanguage: string | undefined,
): IUseLanguage {
  const language = _language || getLanguageFromCode(defaultLocale);
  const langKey = selectedAppLanguage || profileLanguage || defaultLocale;

  return {
    selectedLanguage: langKey,
    lang: (key, params) => {
      const textResource: string | undefined = getTextResourceByKey(key, textResources);
      if (textResource !== key && textResource !== undefined) {
        return getParsedLanguageFromText(textResource);
      }

      return getParsedLanguageFromKey(key as ValidLanguageKey, language, params, false);
    },
    langAsString: (key, params) => {
      const textResource = getTextResourceByKey(key, textResources);
      if (textResource !== key && textResource !== undefined) {
        return textResource;
      }

      return getParsedLanguageFromKey(key as ValidLanguageKey, language, params, true);
    },
    langAsStringOrEmpty: (key, params) => {
      if (!key) {
        return '';
      }

      const textResource = getTextResourceByKey(key, textResources);
      if (textResource !== key && textResource !== undefined) {
        return textResource;
      }

      const result = getParsedLanguageFromKey(key as ValidLanguageKey, language, params, true);
      if (result === key) {
        return '';
      }

      return result;
    },
  };
}
