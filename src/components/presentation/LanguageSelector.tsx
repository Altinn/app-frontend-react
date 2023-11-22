import React, { useMemo } from 'react';

import { Select } from '@digdir/design-system-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { useGetAppLanguageQuery } from 'src/features/language/textResources/useGetAppLanguagesQuery';
import { useLanguage } from 'src/features/language/useLanguage';
import { ProfileActions } from 'src/features/profile/profileSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';

export const LanguageSelector = ({ hideLabel }: { hideLabel?: boolean }) => {
  const { langAsString, selectedLanguage } = useLanguage();

  const { data: appLanguages, isError: appLanguageError } = useGetAppLanguageQuery();
  const dispatch = useAppDispatch();

  const handleAppLanguageChange = (languageCode: string) => {
    dispatch(ProfileActions.updateSelectedAppLanguage({ selected: languageCode }));
  };

  const optionsMap = useMemo(
    () =>
      appLanguages?.map((lang) => ({
        label: langAsString(`language.full_name.${lang.language}`),
        value: lang.language,
      })),
    [appLanguages, langAsString],
  );

  if (appLanguageError) {
    console.error('Failed to load app languages.');
    return null;
  }

  if (appLanguages) {
    return (
      <div style={{ minWidth: 160 }}>
        <Select
          label={!hideLabel ? langAsString('language.selector.label') : undefined}
          options={optionsMap || []}
          onChange={(value) => handleAppLanguageChange(value)}
          value={selectedLanguage}
        />
      </div>
    );
  }

  return <AltinnSpinner />;
};
