import React from 'react';

import { FooterGenericLink } from 'src/features/footer/components/shared/FooterGenericLink';
import type { IFooterEmailComponent } from 'src/features/footer/components/Email/types';

export const FooterEmail = ({ title, target }: IFooterEmailComponent) => (
  <FooterGenericLink
    title={title}
    target={`mailto:${target}`}
    icon='email'
  />
);
