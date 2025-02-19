import React, { useState } from 'react';

import { DropdownMenu, Spinner } from '@digdir/designsystemet-react';
import { CheckmarkIcon, ChevronDownIcon, GlobeIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import classes from 'src/components/presentation/LanguageSelector.module.css';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage, useSetCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useGetAppLanguageQuery } from 'src/features/language/textResources/useGetAppLanguagesQuery';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';

export const LanguageSelector = () => {
  const isMobile = useIsMobile();
  const currentLanguage = useCurrentLanguage();
  const { setWithLanguageSelector } = useSetCurrentLanguage();
  const { langAsString } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);

  function updateLanguage(lang: string) {
    setIsOpen(false);
    setWithLanguageSelector(lang);
  }

  const { data: appLanguages, isPending } = useGetAppLanguageQuery();

  if (isPending) {
    return (
      <Spinner
        style={{ marginRight: 8 }}
        size='sm'
        title={langAsString('general.loading')}
      />
    );
  }

  if (!appLanguages?.length) {
    // LanguageProvider logs error if this query fails
    return null;
  }

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
        aria-label={langAsString('language.language_selection')}
        className={cn({ [classes.buttonActive]: isOpen })}
      >
        <GlobeIcon
          className={classes.leftIcon}
          style={{ marginRight: !isMobile ? 4 : 0 }}
          aria-hidden
        />
        {!isMobile && <Lang id='language.language_selection' />}
        <ChevronDownIcon
          className={cn(classes.rightIcon, { [classes.flipVertical]: isOpen })}
          aria-hidden
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content role='menu'>
        <DropdownMenu.Group heading={isMobile ? <Lang id='language.language_selection' /> : undefined}>
          {appLanguages?.map((lang) => {
            const selected = currentLanguage === lang;

            return (
              <DropdownMenu.Item
                role='menuitemradio'
                aria-checked={selected}
                key={lang}
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
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
