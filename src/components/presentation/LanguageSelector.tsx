import React, { useState } from 'react';

import { DropdownMenu } from '@digdir/designsystemet-react';
import { CheckmarkIcon, ChevronDownIcon, GlobeIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import classes from 'src/components/presentation/LanguageSelector.module.css';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage, useSetCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useGetAppLanguageQuery } from 'src/features/language/textResources/useGetAppLanguagesQuery';

export const LanguageSelector = () => {
  const currentLanguage = useCurrentLanguage();
  const { setWithLanguageSelector } = useSetCurrentLanguage();

  const [isOpen, setIsOpen] = useState(false);

  function updateLanguage(lang: string) {
    setIsOpen(false);
    setWithLanguageSelector(lang);
  }

  const { data: appLanguages, isError: appLanguageError } = useGetAppLanguageQuery();

  if (appLanguageError) {
    console.error('Failed to load app languages.');
    return null;
  }

  if (appLanguages) {
    return (
      <DropdownMenu
        size='sm'
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DropdownMenu.Trigger
          size='sm'
          variant='tertiary'
          onClick={() => setIsOpen((o) => !o)}
          className={cn({ [classes.buttonActive]: isOpen })}
        >
          <GlobeIcon
            className={classes.leftIcon}
            aria-hidden
          />
          <Lang id='language.language_selection' />
          <ChevronDownIcon
            className={cn(classes.rightIcon, { [classes.flipVertical]: isOpen })}
            aria-hidden
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Group heading={<Lang id='language.language_selection' />}>
            {appLanguages?.map((lang) => (
              <DropdownMenu.Item
                key={lang}
                className={cn({ [classes.listButtonActive]: currentLanguage === lang })}
                onClick={() => updateLanguage(lang)}
              >
                <CheckmarkIcon
                  style={{ opacity: currentLanguage === lang ? 1 : 0 }}
                  className={classes.checkmarkIcon}
                  aria-hidden
                />
                <Lang id={`language.full_name.${lang}`} />
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  }

  return <AltinnSpinner />;
};
