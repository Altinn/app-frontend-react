import React from 'react';

import { ButtonVariant } from '@altinn/altinn-design-system';

import { WrappedButton } from 'src/components/base/ButtonComponent/WrappedButton';
import type { buttonProps } from 'src/components/base/ButtonComponent/WrappedButton';

export const SubmitButton = ({ children, ...props }: buttonProps) => {
  return (
    <WrappedButton
      {...props}
      variant={ButtonVariant.Submit}
    >
      {children}
    </WrappedButton>
  );
};
