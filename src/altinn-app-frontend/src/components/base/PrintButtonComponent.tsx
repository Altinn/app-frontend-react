import React from 'react';
import {IComponentProps} from 'src/components';
import {Button, ButtonVariant} from '@altinn/altinn-design-system';

export const PrintButtonComponent = ({textResourceBindings, getTextResource}: IComponentProps) => {
  return (
    <Button variant={ButtonVariant.Secondary} onClick={() => window.print()}>
      {getTextResource(textResourceBindings.text)}
    </Button>)
}
