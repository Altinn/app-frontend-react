import React, { useCallback, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import { useLocalStorageState } from 'src/hooks/useLocalStorage';
import type { IProfile } from 'src/types/shared';

interface LanguageCtx {
  current: string;
  profileLoaded: boolean;
  updateProfile: (profile: IProfile | null) => void;
  setWithLanguageSelector: (language: string) => void;
}

const { Provider, useCtx } = createContext<LanguageCtx>({
  name: 'Language',
  required: false,
  default: {
    current: 'nb',
    profileLoaded: false,
    updateProfile: () => {
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
  const languageFromUrl = getLanguageQueryParam();
  const [languageFromSelector, setWithLanguageSelector] = useLocalStorageState(
    ['selectedLanguage', String(profileData.userId)],
    null,
  );

  const updateProfile = useCallback((profile: IProfile | null) => {
    profile
      ? setProfileData({
          loaded: true,
          userId: profile.userId,
          language: profile.profileSettingPreference.language ?? undefined,
        })
      : setProfileData({ loaded: true });
  }, []);

  const current = languageFromSelector ?? languageFromUrl ?? profileData.language ?? 'nb';

  return (
    <Provider value={{ current, profileLoaded: profileData.loaded, updateProfile, setWithLanguageSelector }}>
      {children}
    </Provider>
  );
};

export const useCurrentLanguage = () => useCtx().current;
export const useIsProfileLanguageLoaded = () => useCtx().profileLoaded;
export const useSetCurrentLanguage = () => {
  const { setWithLanguageSelector, updateProfile } = useCtx();
  return { setWithLanguageSelector, updateProfile };
};

function getLanguageQueryParam() {
  const params = new URLSearchParams((window.location.hash || '').split('?')[1]);
  return params.get('lang');
}
