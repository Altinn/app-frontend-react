import React from 'react';

import cn from 'classnames';

import classes from 'src/components/presentation/OrganisationLogo/OrganisationLogo.module.css';
import { useAppLogoAltText, useAppOwner } from 'src/core/texts/appTexts';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useOrgs } from 'src/hooks/queries/useOrgs';
import { useAppLogoSize, useAppLogoUrl, useDisplayAppOwnerNameInHeader } from 'src/hooks/useAppLogo';

export const OrganisationLogo = () => {
  const { isError: isOrgsError } = useOrgs();
  const appLogoUrl = useAppLogoUrl();
  const appLogoAltText = useAppLogoAltText();
  const appLogoSize = useAppLogoSize();
  const showAppOwner = useDisplayAppOwnerNameInHeader();
  const appOwner = useAppOwner();

  if (isOrgsError) {
    return <UnknownError />;
  }

  return (
    <div className={classes.container}>
      <img
        src={appLogoUrl}
        alt={appLogoAltText}
        className={cn(classes[appLogoSize])}
      />
      {showAppOwner && <span>{appOwner}</span>}
    </div>
  );
};
