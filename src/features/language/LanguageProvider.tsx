import React, { useCallback, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import { useGetAppLanguageQuery } from 'src/features/language/textResources/useGetAppLanguagesQuery';
import { useLocalStorageState } from 'src/hooks/useLocalStorage';
import type { IProfile } from 'src/types/shared';

interface LanguageCtx {
  current: string;
  profileLoaded: boolean;
  setProfileForLanguage: (profile: IProfile | null) => void;
  setWithLanguageSelector: (language: string) => void;
}

const { Provider, useCtx } = createContext<LanguageCtx>({
  name: 'Language',
  required: false,
  default: {
    current: 'nb',
    profileLoaded: false,
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
  const validateLanguage = useValidateLanguage();

  const [profileData, setProfileData] = useState<LanguageProfileData>({ loaded: false });
  const languageFromUrl = getLanguageQueryParam();
  const [languageFromSelector, setWithLanguageSelector] = useLocalStorageState(
    ['selectedLanguage', String(profileData.userId)],
    null,
  );

  const setProfileForLanguage = useCallback((profile: IProfile | null) => {
    profile
      ? setProfileData({
          loaded: true,
          userId: profile.userId,
          language: profile.profileSettingPreference.language ?? undefined,
        })
      : setProfileData({ loaded: true });
  }, []);

  const current =
    validateLanguage(languageFromSelector) ??
    validateLanguage(languageFromUrl) ??
    validateLanguage(profileData.language) ??
    // If none of the users prefered languages are available, try using a standard language
    validateLanguage('nb') ??
    validateLanguage('nn') ??
    validateLanguage('en') ??
    // If none of the standard languages are available, something is very wrong with the app
    'nb';

  return (
    <Provider value={{ current, profileLoaded: profileData.loaded, setProfileForLanguage, setWithLanguageSelector }}>
      {children}
    </Provider>
  );
};

export const useCurrentLanguage = () => useCtx().current;
export const useIsProfileLanguageLoaded = () => useCtx().profileLoaded;
export const useSetCurrentLanguage = () => {
  const { setWithLanguageSelector, setProfileForLanguage } = useCtx();
  return { setWithLanguageSelector, setProfileForLanguage };
};

function getLanguageQueryParam() {
  const params = new URLSearchParams((window.location.hash || '').split('?')[1]);
  return params.get('lang');
}

function useValidateLanguage() {
  const { data: appLanguages } = useGetAppLanguageQuery();
  return useCallback(
    (lang: string | null | undefined) => (!!lang && (!appLanguages || appLanguages.includes(lang)) ? lang : null),
    [appLanguages],
  );
}
