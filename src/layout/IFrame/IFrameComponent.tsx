import React from 'react';
import type { JSX } from 'react';

import { Panel, PanelVariant } from '@altinn/altinn-design-system';

import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { getSandboxProperties } from 'src/layout/IFrame/utils';
import type { PropsFromGenericComponent } from 'src/layout';

export type IFrameComponentProps = PropsFromGenericComponent<'IFrame'>;

export const IFrameComponent = ({ node }: IFrameComponentProps): JSX.Element => {
  const { langAsNonProcessedString } = useLanguage();
  const { textResourceBindings, sandbox } = node.item;

  const sandboxProperties = getSandboxProperties(sandbox);
  const iFrameTitle = textResourceBindings?.title;
  const HTMLString = langAsNonProcessedString(iFrameTitle);

  const isSrcDocUnsupported = !('srcdoc' in document.createElement('iframe'));
  if (isSrcDocUnsupported) {
    return (
      <Panel
        variant={PanelVariant.Error}
        title={<Lang id={'iframe_component.unsupported_browser_title'} />}
      >
        <p>
          <Lang id={'iframe_component.unsupported_browser'} />
        </p>
      </Panel>
    );
  }

  // Resize the iframe to fit the content thats loaded inside it
  const adjustIFrameSize = (iframe: React.BaseSyntheticEvent): void => {
    iframe.target.style.height = `${iframe.target.contentWindow.document.documentElement.scrollHeight}px`;
  };

  return (
    <iframe
      scrolling='no'
      frameBorder={0}
      width='100%'
      srcDoc={HTMLString}
      title={iFrameTitle}
      onLoad={adjustIFrameSize}
      sandbox={sandboxProperties}
    />
  );
};
