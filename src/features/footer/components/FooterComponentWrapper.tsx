import React from 'react';

interface IFooterComponentWrapper {
  id: string;
  children: JSX.Element | null;
}

export const FooterComponentWrapper = ({ id, children }: IFooterComponentWrapper) => (
  <React.Fragment key={id}>{children}</React.Fragment>
);
