import * as React from 'react';
import { IComponentProps } from '..';
import ThirdPartyWebComponent from './ThirdPartyWebComponent';

export interface IThirdPartyComponentProps extends IComponentProps {
  name: string;
  framework?: string;
}

export enum ThirdPartySupportedFrameworks {
  WebComponent = 'web-component',
  React = 'react',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ThirdPartyComponent({
  name,
  framework,
  handleDataChange,
  ...passThroughProps
}: IThirdPartyComponentProps) {
  if (framework === ThirdPartySupportedFrameworks.WebComponent) {
    return (
      <ThirdPartyWebComponent
        name={name}
        handleDataChange={handleDataChange}
        {...passThroughProps}
      />
    )
  }
  const Tag = name as any;

  if (!Tag) return null;

  return (
    React.createElement(name, { name })
  );
}

export default ThirdPartyComponent;
