import React from 'react';

import cn from 'classnames';

import classes from 'src/components/presentation/OrganisationLogo/OrganisationLogo.module.css';
import { DisplayError } from 'src/core/errorHandling/DisplayError';
import { useAppLogoAltText, useAppOwner, useTextResourceWithFallback } from 'src/core/texts/appTexts';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useOrgs } from 'src/hooks/queries/useOrgs';
import { useAppLogoSize, useDisplayAppOwnerNameInHeader } from 'src/hooks/useAppLogo';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IAltinnOrgs } from 'src/types/shared';

export const OrganisationLogo = () => {
  const { error: orgsError, data: orgs } = useOrgs();
  const appMetadata = useApplicationMetadata();
  const logoUrlFromTextResource = useTextResourceWithFallback('appLogo.url', undefined);
  const appLogoAltText = useAppLogoAltText();
  const appLogoSize = useAppLogoSize();
  const showAppOwner = useDisplayAppOwnerNameInHeader();
  const appOwner = useAppOwner();

  const appLogoUrl = getAppLogoUrl({ orgs, appMetadata, logoUrlFromTextResource });

  if (orgsError) {
    return <DisplayError error={orgsError} />;
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

export function getAppLogoUrl({
  orgs,
  appMetadata,
  logoUrlFromTextResource,
}: {
  orgs: IAltinnOrgs | undefined;
  appMetadata: IApplicationMetadata;
  logoUrlFromTextResource: string | undefined;
}) {
  if (!orgs) {
    return undefined;
  }

  const org = appMetadata?.org;
  const useOrgAsSource = (appMetadata.logo?.source ?? 'org') === 'org';
  const logoUrlFromOrgs = useOrgAsSource && org ? orgs[org]?.logo : undefined;

  return logoUrlFromOrgs || logoUrlFromTextResource;
}
