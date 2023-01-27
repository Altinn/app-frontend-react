import React from 'react';

import { Email, Information, Telephone } from '@navikt/ds-icons';

import { useAppSelector } from 'src/common/hooks';
import css from 'src/shared/components/Footer.module.css';

const Footer = () => {
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);

  if (applicationMetadata === null) {
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
        Tilgjengelighet
      </a>
      {contactEmail && (
        <a
          className={css['link']}
          href={`mailto:${contactEmail}`}
        >
          <Email
            aria-hidden={true}
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
            aria-hidden={true}
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
