import React from 'react';

import { ButtonVariant } from '@altinn/altinn-design-system';

import { WrappedButton } from 'src/components/base/ButtonComponent/WrappedButton';
import type { buttonProps } from 'src/components/base/ButtonComponent/WrappedButton';

type props = Exclude<buttonProps, 'variant'>;

export const SaveButton = ({ children, ...props }: props) => {
  return (
    <WrappedButton
      {...props}
      variant={ButtonVariant.Secondary}
    >
      {children}
    </WrappedButton>
  );
};
