import React from 'react';

import { FooterIcon } from 'src/features/footer/components/shared/FooterIcon';
import type { IFooterIcon } from 'src/features/footer/components/types';

interface FooterGenericLinkProps {
  title: string;
  target: string;
  icon?: IFooterIcon;
}

export const FooterGenericLink = ({ title, target, icon }: FooterGenericLinkProps) => {
  return (
    <div>
      {icon && <FooterIcon icon={icon} />}
      <a
        href={target}
        target='_blank'
        rel='noreferrer'
      >
        {title}
      </a>
    </div>
  );
};
