import React from 'react';
import type { ChangeEvent } from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { Fieldset } from 'src/app-components/Label/Fieldset';
import { RadioButton } from 'src/components/form/RadioButton';
import { Lang } from 'src/features/language/Lang';
import type { AuthorizedOrganisationDetails } from 'src/layout/SigningStatusPanel/api';

interface OnBehalfOfChooserProps {
  authorizedOrganisationDetails: AuthorizedOrganisationDetails | undefined;
  onBehalfOfOrg: string | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const OnBehalfOfChooser = ({
  authorizedOrganisationDetails,
  onBehalfOfOrg,
  onChange,
}: Readonly<OnBehalfOfChooserProps>) => {
  const numberOfOrganisations = authorizedOrganisationDetails?.organisations?.length;
  const firstOrgName = authorizedOrganisationDetails?.organisations?.[0]?.orgName;

  if (!numberOfOrganisations) {
    return null;
  }

  if (numberOfOrganisations === 1) {
    return (
      <Heading
        level={1}
        size='2xs'
      >
        <Lang
          id='signing.submit_panel_single_org_choice'
          params={[firstOrgName]}
        />
      </Heading>
    );
  }

  return (
    <Fieldset
      legend={<Lang id='signing.submit_panel_radio_group_legend' />}
      description={<Lang id='signing.submit_panel_radio_group_description' />}
      required={true}
    >
      {authorizedOrganisationDetails.organisations.map((org) => (
        <RadioButton
          value={org.orgNumber}
          label={org.orgName}
          name='onBehalfOf'
          key={org.partyId}
          onChange={onChange}
          checked={onBehalfOfOrg === org.orgNumber}
        />
      ))}
    </Fieldset>
  );
};
