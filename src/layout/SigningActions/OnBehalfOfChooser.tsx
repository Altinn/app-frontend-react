import React from 'react';
import type { ChangeEvent } from 'react';

import { Fieldset } from 'src/app-components/Label/Fieldset';
import { RadioButton } from 'src/components/form/RadioButton';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import type { SigneeState } from 'src/layout/SigneeList/api';
import type { AuthorizedOrganizationDetails } from 'src/layout/SigningActions/api';

interface OnBehalfOfChooserProps {
  currentUserSignee: SigneeState | undefined;
  authorizedOrganizationDetails: AuthorizedOrganizationDetails['organisations'];
  onBehalfOfOrg: string | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const OnBehalfOfChooser = ({
  currentUserSignee,
  authorizedOrganizationDetails,
  onBehalfOfOrg,
  onChange,
}: Readonly<OnBehalfOfChooserProps>) => {
  const mySelf = useLanguage().langAsString('signing.submit_panel_myself_choice');

  return (
    <Fieldset
      legend={<Lang id='signing.submit_panel_radio_group_legend' />}
      description={<Lang id='signing.submit_panel_radio_group_description' />}
      required={true}
      legendSize='md'
      size='sm'
    >
      {currentUserSignee && (
        <RadioButton
          value=''
          label={mySelf}
          name='onBehalfOf'
          key={currentUserSignee.partyId}
          onChange={onChange}
        />
      )}

      {authorizedOrganizationDetails.map((org) => (
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
