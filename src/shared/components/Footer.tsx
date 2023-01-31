import React from 'react';

import { Information } from '@navikt/ds-icons';

import { useAppSelector } from 'src/common/hooks';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import css from 'src/shared/components/Footer.module.css';

const Footer = () => {
  const language = useAppSelector((state) => state.language.language);

  if (language === null) {
    return null;
  }

  const accessibilityStatement = 'https://www.altinn.no/om-altinn/tilgjengelighet/';

  return (
    <footer className={css['footer']}>
      <a
        className={css['link']}
        href={accessibilityStatement}
        target='_blank'
        rel='noreferrer'
      >
        <Information
          aria-hidden={true}
          height={20}
          width={20}
        />
        {getLanguageFromKey('general.accessibility', language)}
      </a>
    </footer>
  );
};

export default Footer;
