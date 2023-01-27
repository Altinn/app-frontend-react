import React from 'react';

import { Email, Information, Telephone } from '@navikt/ds-icons';

import { useAppSelector } from 'src/common/hooks';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import css from 'src/shared/components/Footer.module.css';

const Footer = () => {
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const language = useAppSelector((state) => state.language.language);

  if (applicationMetadata === null || language === null) {
    return null;
  }

  const accessibilityStatement =
    applicationMetadata.accessibilityStatement ?? 'https://www.altinn.no/om-altinn/tilgjengelighet/';
  const contactEmail = applicationMetadata.contactEmail;
  const contactPhoneNumber = applicationMetadata.contactPhoneNumber;

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
      {contactEmail && (
        <a
          className={css['link']}
          href={`mailto:${contactEmail}`}
        >
          <Email
            aria-label={getLanguageFromKey('general.contact_email', language)}
            height={20}
            width={20}
          />
          {contactEmail}
        </a>
      )}
      {contactPhoneNumber && (
        <a
          className={css['link']}
          href={`tel:${contactPhoneNumber}`}
        >
          <Telephone
            aria-label={getLanguageFromKey('general.contact_phone_number', language)}
            height={20}
            width={20}
          />
          {contactPhoneNumber}
        </a>
      )}
    </footer>
  );
};

export default Footer;
