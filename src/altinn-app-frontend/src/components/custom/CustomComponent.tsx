import * as React from 'react';
import type { IComponentProps } from '..';
import CustomWebComponent from './CustomWebComponent';

export interface ICustomComponentProps extends IComponentProps {
  tagName: string;
  framework?: string;
}

export enum CustomSupportedFrameworks {
  WebComponent = 'web-component',
  React = 'react',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CustomComponent({
  tagName,
  framework,
  handleDataChange,
  ...passThroughProps
}: ICustomComponentProps) {
  if (framework === CustomSupportedFrameworks.React) {
    return React.createElement(tagName, {
      tagName,
      handleDataChange,
      ...passThroughProps,
    });
  }
  const Tag = tagName as any;

  if (!Tag) return null;

  return (
    <CustomWebComponent
      tagName={tagName}
      handleDataChange={handleDataChange}
      {...passThroughProps}
    />
  );
}

export default CustomComponent;
