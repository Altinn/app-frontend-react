import React from 'react';
import {
  Panel as PanelDesignSystem,
  PanelVariant,
} from '@altinn/altinn-design-system';

import { FullWidthWrapper } from 'src/features/form/components/FullWidthWrapper';

import { IComponentProps } from '..';

interface IGetVariantProps {
  variant?: string;
}

const defaultObj = {};

export const getVariant = ({ variant }: IGetVariantProps = defaultObj) => {
  switch (variant) {
    case 'info':
      return PanelVariant.Info;
    case 'success':
      return PanelVariant.Success;
    case 'warning':
      return PanelVariant.Warning;
  }

  return PanelVariant.Info;
};

interface IPanelProps extends IComponentProps {
  variant?: string;
  showIcon?: boolean;
}

export const Panel = ({
  getTextResource,
  textResourceBindings,
  variant,
  showIcon,
}: IPanelProps) => {
  return (
    <FullWidthWrapper>
      <PanelDesignSystem
        title={getTextResource(textResourceBindings.title)}
        showIcon={showIcon}
        variant={getVariant({ variant })}
      >
        {getTextResource(textResourceBindings.body)}
      </PanelDesignSystem>
    </FullWidthWrapper>
  );
};

export { PanelVariant };
