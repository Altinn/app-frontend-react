import React from 'react';

import { Tabs } from '@digdir/designsystemet-react';

import { useLanguage } from 'src/features/language/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import { sanitizeImgSrcAndType } from 'src/utils/imageUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const TabGroup = ({ node }: PropsFromGenericComponent<'TabGroup'>) => {
  const children = node.item.childComponents;

  return (
    <Tabs
      defaultValue={node.item.defaultTab ?? children.at(0)?.item.id}
      size={node.item.size}
    >
      <Tabs.List>
        {children.map((n: LayoutNode<'Tab'>) => (
          <TabHeader
            key={n.item.id}
            node={n}
          />
        ))}
      </Tabs.List>
      {children.map((n: LayoutNode<'Tab'>) => (
        <GenericComponent<'Tab'>
          key={n.item.id}
          node={n}
        />
      ))}
    </Tabs>
  );
};

function TabHeader({ node }: { node: LayoutNode<'Tab'> }) {
  const { langAsString } = useLanguage();
  const title = langAsString(node.item.textResourceBindings?.['title']);

  let iconSrc = node.item.icon;
  if (iconSrc) {
    const { imgSrc, imgType } = sanitizeImgSrcAndType(iconSrc);
    iconSrc = imgSrc;

    const iconPathPrefix = `/${window.org}/${window.app}`;
    if (!iconSrc.startsWith(iconPathPrefix)) {
      iconSrc = [iconPathPrefix, iconSrc].join('/');
    }

    if (imgType.toLowerCase() !== 'svg') {
      throw new Error('Only SVG icons are supported');
    }
  }

  return (
    <Tabs.Tab
      key={node.item.id}
      value={node.item.id}
    >
      {!!iconSrc && (
        <img
          src={iconSrc}
          alt={title ?? 'tab icon'}
          style={{
            width: '24px',
          }}
        />
      )}
      {title}
    </Tabs.Tab>
  );
}
