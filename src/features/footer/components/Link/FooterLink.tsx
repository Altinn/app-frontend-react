import React from 'react';

import type { IFooterLinkComponent } from 'src/features/footer/types';

export const FooterLink = ({ title, target, icon }: IFooterLinkComponent) => (
  <div>
    {icon && <span>icon</span>}
    <a
      href={target}
      target='_blank'
      rel='noreferrer'
    >
      {title}
    </a>
  </div>
);
