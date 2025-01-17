import React, { useState } from 'react';

import { DropdownMenu, Spinner } from '@digdir/designsystemet-react';
import { CheckmarkIcon, ChevronDownIcon, GlobeIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import classes from 'src/components/presentation/LanguageSelector.module.css';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage, useSetCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useGetAppLanguageQuery } from 'src/features/language/textResources/useGetAppLanguagesQuery';
import { useLanguage } from 'src/features/language/useLanguage';

export const LanguageSelector = () => {
  const currentLanguage = useCurrentLanguage();
  const { setWithLanguageSelector } = useSetCurrentLanguage();
  const { langAsString } = useLanguage();

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
        <DropdownMenu.Content role='menu'>
          {appLanguages?.map((lang) => {
            const selected = currentLanguage === lang;

            return (
              <DropdownMenu.Item
                role='menuitemradio'
                aria-checked={selected}
                key={lang}
                className={classes.listButton}
                onClick={() => updateLanguage(lang)}
              >
                <CheckmarkIcon
                  style={{ opacity: selected ? 1 : 0 }}
                  className={classes.checkmarkIcon}
                  aria-hidden
                />
                <Lang id={`language.full_name.${lang}`} />
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  }

  return (
    <Spinner
      style={{ marginRight: 8 }}
      size='sm'
      title={langAsString('general.loading')}
    />
  );
};
