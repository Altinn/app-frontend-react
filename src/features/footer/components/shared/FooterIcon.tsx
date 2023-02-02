import React from 'react';

import { Email, Information, Telephone } from '@navikt/ds-icons';

import type { IFooterIcon } from 'src/features/footer/components/types';

interface FooterIconProps {
  icon: IFooterIcon;
}

type IFooterLinkMap = {
  [K in IFooterIcon]: React.ComponentType;
};
const FooterLinkMap: IFooterLinkMap = {
  email: Email,
  information: Information,
  phone: Telephone,
};

export const FooterIcon = ({ icon }: FooterIconProps) => {
  const IconComponent = FooterLinkMap[icon];
  return <IconComponent aria-hidden={true} />;
};
