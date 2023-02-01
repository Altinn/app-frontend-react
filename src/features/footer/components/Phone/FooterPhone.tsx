import React from 'react';

import type { IFooterPhoneComponent } from 'src/features/footer/types';

export const FooterPhone = ({ title, target, icon }: IFooterPhoneComponent) => (
  <div>
    {icon && <span>icon</span>}
    <a
      href={`tel:${target}`}
      target='_blank'
      rel='noreferrer'
    >
      {title}
    </a>
  </div>
);
