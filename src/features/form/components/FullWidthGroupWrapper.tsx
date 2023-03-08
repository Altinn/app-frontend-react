import React from 'react';

import css from 'src/features/form/components/FullWidthWrapper.module.css';

export interface IFulLWidthGroupWrapperProps {
  children?: React.ReactNode;
}

export const FullWidthGroupWrapper = ({ children }: IFulLWidthGroupWrapperProps) => (
  <div
    className={css.fullWidth}
    data-testid='fullWidthGroupWrapper'
  >
    {children}
  </div>
);
