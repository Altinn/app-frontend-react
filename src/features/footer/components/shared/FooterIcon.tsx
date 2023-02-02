import React from 'react';

import { Email, Information, Telephone } from '@navikt/ds-icons';

import type { IFooterIcon } from 'src/features/footer/types';

interface FooterIconProps {
  icon: IFooterIcon;
}
type Icon = typeof Email;
type IFooterLinkMap = {
  [K in IFooterIcon]: Icon;
};
const FooterLinkMap: IFooterLinkMap = {
  email: Email,
  information: Information,
  phone: Telephone,
};

export const FooterIcon = ({ icon }: FooterIconProps) => {
  const IconComponent = FooterLinkMap[icon];
  return (
    <IconComponent
      aria-hidden={true}
      height={20}
      width={20}
    />
  );
};
