import React from 'react';

import { useAppSelector } from 'src/common/hooks';
import { getTextResource } from 'src/utils/formComponentUtils';
import type { IFooterTextComponent } from 'src/features/footer/components/Text/types';

export const FooterText = ({ title }: IFooterTextComponent) => {
  const textResources = useAppSelector((state) => state.textResources.resources);

  return (
    <div>
      <span>{getTextResource(title, textResources)}</span>
    </div>
  );
};
