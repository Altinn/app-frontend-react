import React, { useContext } from 'react';

import {
  Panel as PanelDesignSystem,
  PanelVariant,
} from '@altinn/altinn-design-system';

import { FormComponentContext } from 'src/components';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
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
  const { grid, baseComponentId } = useContext(FormComponentContext);
  const shouldHaveFullWidth = !grid && !baseComponentId;

  return (
    <ConditionalWrapper
      condition={shouldHaveFullWidth}
      wrapper={(children) => <FullWidthWrapper>{children}</FullWidthWrapper>}
    >
      <PanelDesignSystem
        title={getTextResource(textResourceBindings.title)}
        showIcon={showIcon}
        variant={getVariant({ variant })}
        forceMobileLayout={!shouldHaveFullWidth}
      >
        {getTextResource(textResourceBindings.body)}
      </PanelDesignSystem>
    </ConditionalWrapper>
  );
};

export { PanelVariant };
