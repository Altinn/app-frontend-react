import React from 'react';

import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';

import type { PropsFromGenericComponent } from '..';

import { useLanguage } from 'src/hooks/useLanguage';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { LinkStyle } from 'src/layout/Link/types';

export const buttonStyles: {
  [style in Exclude<LinkStyle, 'link'>]: { color: ButtonColor; variant: ButtonVariant };
} = {
  primary: { variant: ButtonVariant.Filled, color: ButtonColor.Success },
  secondary: { variant: ButtonVariant.Outline, color: ButtonColor.Primary },
};

export type ILinkComponent = PropsFromGenericComponent<'Link'>;

export function LinkComponent({ node }: ILinkComponent) {
  const { id, style, openInNewTab } = node.item;
  const { textResourceBindings } = node;
  const { lang, langAsString } = useLanguage();
  const parentIsPage = node.parent instanceof LayoutPage;

  if (style === 'link') {
    return (
      <div style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}>
        <a
          id={`link-${id}`}
          href={langAsString(textResourceBindings?.target)}
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noreferrer' : undefined}
        >
          {lang(textResourceBindings?.title)}
        </a>
      </div>
    );
  } else {
    const { color, variant } = buttonStyles[style];

    return (
      <Button
        id={`link-${id}`}
        style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}
        color={color}
        variant={variant}
        onClick={() => window.open(langAsString(textResourceBindings?.target), openInNewTab ? '_blank' : '_self')}
      >
        {lang(textResourceBindings?.title)}
      </Button>
    );
  }
}
