import React, { useCallback, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import { useGetAppLanguageQuery } from 'src/features/language/textResources/useGetAppLanguagesQuery';
import { useLocalStorageState } from 'src/hooks/useLocalStorageState';
import type { IProfile } from 'src/types/shared';

interface LanguageCtx {
  current: string;
  languageResolved: boolean;
  setProfileForLanguage: (profile: IProfile | null) => void;
  setWithLanguageSelector: (language: string) => void;
}

const { Provider, useCtx } = createContext<LanguageCtx>({
  name: 'Language',
  required: false,
  default: {
    current: 'nb',
    languageResolved: false,
    setProfileForLanguage: () => {
      throw new Error('LanguageProvider not initialized');
    },
    setWithLanguageSelector: () => {
      throw new Error('LanguageProvider not initialized');
    },
  },
});

type LanguageProfileData = {
  loaded: boolean;
  userId?: number;
  language?: string;
};

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [profileData, setProfileData] = useState<LanguageProfileData>({ loaded: false });
  const languageFromUrl = getLanguageFromUrl();
  const [languageFromSelector, setWithLanguageSelector] = useLocalStorageState(
    ['selectedLanguage', profileData.userId],
    null,
  );

  const setProfileForLanguage = useCallback(
    (profile: IProfile | null) =>
      setProfileData(
        profile
          ? {
              loaded: true,
              userId: profile.userId,
              language: profile.profileSettingPreference.language ?? undefined,
            }
          : { loaded: true },
      ),
    [],
  );

  const [current, languagesLoaded] = useResolveCurrentLanguage({
    languageFromSelector,
    languageFromUrl,
    languageFromProfile: profileData.language,
  });

  return (
    <Provider
      value={{
        current,
        languageResolved: profileData.loaded && languagesLoaded,
        setProfileForLanguage,
        setWithLanguageSelector,
      }}
    >
      {children}
    </Provider>
  );
};

export const useCurrentLanguage = () => useCtx().current;
export const useIsCurrentLanguageResolved = () => useCtx().languageResolved;
export const useSetCurrentLanguage = () => {
  const { setWithLanguageSelector, setProfileForLanguage } = useCtx();
  return { setWithLanguageSelector, setProfileForLanguage };
};

/**
 * AppRoutingContext is not provided yet, so we have to get this manually
 */
function getLanguageFromUrl() {
  const params = new URLSearchParams(window.location.hash.split('?')[1]);
  return params.get('lang');
}

/**
 * Determines the current language based on the user's preferences and what the app has available
 */
function useResolveCurrentLanguage({
  languageFromSelector,
  languageFromUrl,
  languageFromProfile,
}: {
  languageFromSelector?: string | null;
  languageFromUrl?: string | null;
  languageFromProfile?: string | null;
}): [string, boolean] {
  const { data: appLanguages, error, isPending } = useGetAppLanguageQuery();

  useEffect(() => {
    error && window.logError('Fetching app languages failed:\n', error);
  }, [error]);

  // We don't know what languages the app has available yet, so we just use whatever the user wants for now
  if (!appLanguages) {
    return [languageFromSelector ?? languageFromUrl ?? languageFromProfile ?? 'nb', !isPending];
  }

  // Try to fulfill the user's preferences in order of priority

  if (languageFromSelector) {
    if (appLanguages.includes(languageFromSelector)) {
      return [languageFromSelector, true];
    }
    window.logWarnOnce(
      `User's preferred language (${languageFromSelector}) from language selector / localstorage is not supported by the app, supported languages: [${appLanguages.join(', ')}]`,
    );
  }

  if (languageFromUrl) {
    if (appLanguages.includes(languageFromUrl)) {
      return [languageFromUrl, true];
    }
    window.logWarnOnce(
      `User's preferred language from query parameter (lang=${languageFromUrl}) is not supported by the app, supported languages: [${appLanguages.join(', ')}]`,
    );
  }

  if (languageFromProfile) {
    if (appLanguages.includes(languageFromProfile)) {
      return [languageFromProfile, true];
    }
    window.logInfoOnce(
      `User's preferred language (${languageFromProfile}) from Altinn profile is not supported by the app, supported languages: [${appLanguages.join(', ')}]`,
    );
  }

  // The user has no valid preference, try to fall back to one of the standard languages that the app supports

  if (appLanguages.includes('nb')) {
    return ['nb', true];
  }
  if (appLanguages.includes('nn')) {
    return ['nn', true];
  }
  if (appLanguages.includes('en')) {
    return ['en', true];
  }

  // None of the standard languages are supported, try the first supported language

  if (appLanguages.length) {
    return [appLanguages[0], true];
  }

  // The app has not defined any languages, something is probably wrong

  window.logErrorOnce('When fetching app languages the app returned 0 languages');

  return ['nb', true];
}
