import React from 'react';
import ContentLoader from 'react-content-loader';

import { AltinnContentIcon } from 'src/components/atoms/AltinnContentIcon';

export interface IAltinnContentLoaderProps {
  reason: string;
  height?: number | string;
  width?: number | string;
  children?: React.ReactNode;
}

export const AltinnContentLoader = ({ reason, width = 400, height = 200, children }: IAltinnContentLoaderProps) => (
  <div
    data-testid='loader'
    data-reason={reason}
  >
    <ContentLoader
      height={height}
      width={width}
    >
      {children ? children : <AltinnContentIcon />}
    </ContentLoader>
  </div>
);
