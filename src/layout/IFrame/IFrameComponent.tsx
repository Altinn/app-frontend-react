import React from 'react';

import { Panel, PanelVariant } from '@altinn/altinn-design-system';

import { useLanguage } from 'src/hooks/useLanguage';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ISandboxProperties } from 'src/layout/IFrame/types';

const sandboxPropertyMap: { [K in keyof Required<ISandboxProperties>]: string } = {
  allowPopups: 'allow-popups',
  allowPopupsToEscapeSandbox: 'allow-popups-to-escape-sandbox',
};

const getSanboxProperties = (sandbox: ISandboxProperties | undefined): string => {
  if (!sandbox) {
    return 'allow-same-origin';
  }

  return ['allow-same-origin']
    .concat(
      Object.entries(sandbox)
        .filter(([, value]) => value)
        .map(([key]) => sandboxPropertyMap[key]),
    )
    .join(' ');
};

export type IFrameComponentProps = PropsFromGenericComponent<'IFrame'>;

export const IFrameComponent = ({ node, getTextResourceAsString }: IFrameComponentProps): JSX.Element => {
  const { lang } = useLanguage();
  const { textResourceBindings, sandbox } = node.item;

  const sandboxProperties = getSanboxProperties(sandbox);

  const isSrcDocUnsupported = !('srcdoc' in document.createElement('iframe'));
  if (isSrcDocUnsupported) {
    return (
      <Panel
        variant={PanelVariant.Error}
        title={lang('iframe_component.unsupported_browser_title')}
      >
        <p>{lang('iframe_component.unsupported_browser')}</p>
      </Panel>
    );
  }

  const iFrameTitle = textResourceBindings?.title;
  const HTMLString = iFrameTitle ? getTextResourceAsString(iFrameTitle) : '';

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
