import React from 'react';

import { FooterGenericLink } from 'src/features/footer/components/shared/FooterGenericLink';
import type { IFooterPhoneComponent } from 'src/features/footer/components/Phone/types';

export const FooterPhone = ({ title, target }: IFooterPhoneComponent) => (
  <FooterGenericLink
    title={title}
    target={`tel:${target}`}
    icon='phone'
  />
);
