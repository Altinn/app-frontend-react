import React from 'react';
import { IComponentProps } from 'src/components';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { useAppSelector } from 'src/common/hooks';
import { Button, ButtonVariant } from '@altinn/altinn-design-system';

export const PrintButtonComponent = ({
  language,
}: Partial<IComponentProps>) => {
  const textResources = useAppSelector(
    (state) => state.textResources.resources,
  );

  return (
    <Button variant={ButtonVariant.Secondary} onClick={window.print}>
      {getTextFromAppOrDefault(
        'general.print_button_text',
        textResources,
        language,
        null,
        true,
      )}
    </Button>
  );
};
