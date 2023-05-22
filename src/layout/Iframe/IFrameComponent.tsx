import React from 'react';

import type { PropsFromGenericComponent } from 'src/layout';

export type IFrameComponentProps = PropsFromGenericComponent<'IFrame'>;

export const IFrameComponent = ({ node, getTextResourceAsString }: IFrameComponentProps): JSX.Element => {
  const { textResourceBindings } = node.item;

  const iFrameTitle = textResourceBindings?.title;
  const HTMLString = iFrameTitle ? getTextResourceAsString(iFrameTitle) : '';

  // Resize the iframe to fit the content thats loaded inside it
  const adjustIFrameSize = (iframe: React.BaseSyntheticEvent): void => {
    iframe.target.style.height = `${iframe.target.contentWindow.document.documentElement.scrollHeight}px`;
  };

  return (
    <iframe
      scrolling='no'
      width='100%'
      srcDoc={HTMLString}
      title={iFrameTitle}
      onLoad={adjustIFrameSize}
      sandbox='allow-same-origin'
    />
  );
};
