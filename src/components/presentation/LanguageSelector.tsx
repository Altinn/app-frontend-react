import React from 'react';

import { Combobox } from '@digdir/designsystemet-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import classes from 'src/components/presentation/LanguageSelector.module.css';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage, useSetCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useGetAppLanguageQuery } from 'src/features/language/textResources/useGetAppLanguagesQuery';
import { useLanguage } from 'src/features/language/useLanguage';

export const LanguageSelector = ({ hideLabel }: { hideLabel?: boolean }) => {
  const { langAsString } = useLanguage();
  const selectedLanguage = useCurrentLanguage();
  const { setWithLanguageSelector } = useSetCurrentLanguage();

  const { data: appLanguages, isError: appLanguageError } = useGetAppLanguageQuery();

  const handleAppLanguageChange = (values: string[]) => {
    const lang = values.at(0);
    if (lang) {
      setWithLanguageSelector(lang);
    }
  };

  if (appLanguageError) {
    console.error('Failed to load app languages.');
    return null;
  }

  if (appLanguages) {
    return (
      <Combobox
        size='sm'
        hideLabel={hideLabel}
        label={langAsString('language.selector.label')}
        onValueChange={handleAppLanguageChange}
        value={[selectedLanguage]}
        className={classes.container}
      >
        {appLanguages?.map((lang) => (
          <Combobox.Option
            key={lang.language}
            value={lang.language}
            displayValue={langAsString(`language.full_name.${lang.language}`)}
          >
            <Lang id={`language.full_name.${lang.language}`} />
          </Combobox.Option>
        ))}
      </Combobox>
    );
  }

  return <AltinnSpinner />;
};
