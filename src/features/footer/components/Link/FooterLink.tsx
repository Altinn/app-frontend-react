import React from 'react';

import { FooterGenericLink } from 'src/features/footer/components/shared/FooterGenericLink';
import type { IFooterLinkComponent } from 'src/features/footer/components/Link/types';

export const FooterLink = ({ title, target, icon }: IFooterLinkComponent) => (
  <FooterGenericLink
    title={title}
    target={target}
    icon={icon}
  />
);
