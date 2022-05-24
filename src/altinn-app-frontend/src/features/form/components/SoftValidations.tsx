import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import type { ILanguage, ITextResource } from 'altinn-shared/types';
import React from 'react';
import { useAppSelector } from 'src/common/hooks';
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

export function SoftValidations({ children, variant }: ISoftValidationProps) {
    const language = useAppSelector(state => state.language.language);
    const textResources = useAppSelector(state => state.textResources.resources);

    return (
        <FullWidthWrapper>
            <Panel
                variant={getPanelVariant(variant)}
                showPointer
                showIcon
                title={getPanelTitle({ variant, textResources, language })}
            >
                {children}
            </Panel>
        </FullWidthWrapper>
    );
}