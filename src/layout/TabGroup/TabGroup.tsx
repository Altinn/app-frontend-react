import React, { useState } from 'react';

import { Tabs } from '@digdir/designsystemet-react';

import { useRegisterNodeNavigationHandler } from 'src/features/form/layout/NavigateToNode';
import { useLanguage } from 'src/features/language/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import { sanitizeImgSrcAndType } from 'src/utils/imageUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const TabGroup = ({ node }: PropsFromGenericComponent<'TabGroup'>) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(
    node.item.defaultTab ?? node.item.childComponents.at(0)?.item.id,
  );

  useRegisterNodeNavigationHandler((targetNode) => {
    const tabIds = node.item.childComponents.map((n) => n.item.id);
    for (const parent of targetNode.parents() ?? []) {
      if (parent.item.id && tabIds.includes(parent.item.id)) {
        setActiveTab(parent.item.id);
        return true;
      }
    }
    return false;
  });

  const children = node.item.childComponents;

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onChange={(tabId) => setActiveTab(tabId)}
      size={node.item.size}
    >
      <Tabs.List>
        {children.map((n: LayoutNode<'Tab'>) => (
          <TabHeader
            key={n.item.id}
            node={n}
            isActive={n.item.id === activeTab}
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

function TabHeader({ node, isActive }: { node: LayoutNode<'Tab'>; isActive?: boolean }) {
  const { langAsString } = useLanguage();
  const title = langAsString(node.item.textResourceBindings?.['title']);

  let iconSrc: string | undefined;

  if (node.item.icon) {
    const { imgSrc, imgType } = sanitizeImgSrcAndType(node.item.icon);
    iconSrc = imgSrc;

    if (imgType.toLowerCase() !== 'svg') {
      throw new Error('Only SVG icons are supported');
    }
  }

  return (
    <Tabs.Tab
      key={node.item.id}
      value={node.item.id}
      style={{
        backgroundColor: isActive ? 'white' : 'transparent',
      }}
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
