import React from 'react';

import { useAppSelector } from 'src/common/hooks';
import { FooterIcon } from 'src/features/footer/components/shared/FooterIcon';
import css from 'src/features/footer/components/shared/shared.module.css';
import { getTextResource } from 'src/utils/formComponentUtils';
import type { IFooterIcon } from 'src/features/footer/types';

interface FooterGenericLinkProps {
  title: string;
  target: string;
  icon?: IFooterIcon;
}

export const FooterGenericLink = ({ title, target, icon }: FooterGenericLinkProps) => {
  const textResources = useAppSelector((state) => state.textResources.resources);

  return (
    <a
      href={target}
      target='_blank'
      rel='noreferrer'
      className={css.link}
    >
      {icon && (
        <span style={{ marginRight: 6 }}>
          <FooterIcon icon={icon} />
        </span>
      )}
      <span className={css.link_text}>{getTextResource(title, textResources)}</span>
    </a>
  );
};
