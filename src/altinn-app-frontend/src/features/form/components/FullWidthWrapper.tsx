import React from 'react';
import './FullWidthWrapper.css';

export interface IFullWidthWrapperProps {
  children?: React.ReactNode;
}

export function FullWidthWrapper({ children }: IFullWidthWrapperProps) {
  return (
    <div id='fullWidthWrapper'>
      {children}
    </div>
  )
}
