import React from 'react';

import type { IFooterEmailComponent } from 'src/features/footer/types';

export const FooterEmail = ({ title, target, icon }: IFooterEmailComponent) => (
  <div>
    {icon && <span>icon</span>}
    <a
      href={`mailto:${target}`}
      target='_blank'
      rel='noreferrer'
    >
      {title}
    </a>
  </div>
);
