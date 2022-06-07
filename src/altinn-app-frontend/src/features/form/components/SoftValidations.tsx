import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import type { ILanguage, ITextResource } from 'altinn-shared/types';
import React from 'react';
import { useAppSelector } from 'src/common/hooks';
import { ComponentContext } from 'src/components/GenericComponent';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { FullWidthWrapper } from './FullWidthWrapper';

export interface ISoftValidationProps {
  children: React.ReactNode;
  variant: SoftValidationVariant;
}

export type SoftValidationVariant = 'warning' | 'info' | 'success';

const getPanelVariant = (messageType: SoftValidationVariant) => {
  switch (messageType) {
    case 'warning':
      return PanelVariant.Warning;
    case 'info':
      return PanelVariant.Info;
    case 'success':
      return PanelVariant.Success;
  }
};

interface IGetPanelTitleProps {
  variant: SoftValidationVariant;
  textResources: ITextResource[];
  language: ILanguage;
}

export const getPanelTitle = ({ variant, textResources, language }: IGetPanelTitleProps) => {
  switch (variant) {
    case 'warning':
      return getTextFromAppOrDefault('soft_validation.warning_title', textResources, language, undefined, true);
    case 'info':
      return getTextFromAppOrDefault('soft_validation.info_title', textResources, language, undefined, true);
    case 'success':
      return getTextFromAppOrDefault('soft_validation.success_title', textResources, language, undefined, true);
  }
};

const ValidationPanel = ({ variant, children }: ISoftValidationProps) => {
  const language = useAppSelector(state => state.language.language);
  const textResources = useAppSelector(state => state.textResources.resources);

  return (
    <Panel
      variant={getPanelVariant(variant)}
      showPointer
      showIcon
      title={getPanelTitle({ variant, textResources, language })}
    >
      {children}
    </Panel>
  )
}

export function SoftValidations(props: ISoftValidationProps) {
  const { grid } = React.useContext(ComponentContext);
  const shouldHaveFullWidth = !grid;

  if (shouldHaveFullWidth) {
    return (
      <FullWidthWrapper>
        <ValidationPanel {...props} />
      </FullWidthWrapper>
    );
  } else {
    return (
      <ValidationPanel {...props} />
    )
  }
}
