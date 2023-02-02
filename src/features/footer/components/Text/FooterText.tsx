import React from 'react';

import type { IFooterTextComponent } from 'src/features/footer/components/Text/types';

export const FooterText = ({ title }: IFooterTextComponent) => (
  <div>
    <span>{title}</span>
  </div>
);
