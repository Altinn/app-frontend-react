import React, { useState } from 'react';

import { Tabs as DesignsystemetTabs } from '@digdir/designsystemet-react';

import { useRegisterNodeNavigationHandler } from 'src/features/form/layout/NavigateToNode';
import { useLanguage } from 'src/features/language/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export const Tabs = ({ node }: PropsFromGenericComponent<'Tabs'>) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(
    node.item.defaultTab ?? node.item.tabsInternal.at(0)?.id,
  );

  useRegisterNodeNavigationHandler((targetNode) => {
    for (const parent of targetNode.parents() ?? []) {
      const tabsInternal = parent.item['tabsInternal'];
      const targetTabId = tabsInternal?.find((tab) =>
        tab.childNodes.some((child) => child.item.id === targetNode.item.id),
      )?.id;
      if (targetTabId) {
        setActiveTab(targetTabId);
        return true;
      }
    }
    return false;
  });

  const tabs = node.item.tabsInternal;
  return (
    <DesignsystemetTabs
      defaultValue={activeTab}
      value={activeTab}
      onChange={(tabId) => setActiveTab(tabId)}
      size={node.item.size}
    >
      <DesignsystemetTabs.List>
        {tabs.map((tab) => (
          <TabHeader
            key={tab.id}
            id={tab.id}
            title={tab.title}
            icon={tab.icon}
            isActive={tab.id === activeTab}
          />
        ))}
      </DesignsystemetTabs.List>
      {tabs.map((tab) => (
        <DesignsystemetTabs.Content
          key={tab.id}
          value={tab.id}
          role='tabpanel'
          style={{
            backgroundColor: 'white',
          }}
        >
          {tab.childNodes.map((node, idx) => (
            <GenericComponent
              key={idx}
              node={node}
            />
          ))}
        </DesignsystemetTabs.Content>
      ))}
    </DesignsystemetTabs>
  );
};

function TabHeader({
  id,
  title,
  icon,
  isActive,
}: {
  id: string;
  title: string;
  icon: string | undefined;
  isActive?: boolean;
}) {
  const { langAsString } = useLanguage();
  const translatedTitle = langAsString(title);

  if (icon) {
    const imgType = icon.split('.').at(-1);

    if (!imgType) {
      throw new Error('Image source is missing file type. Are you sure the image source is correct?');
    }

    if (imgType.toLowerCase() !== 'svg') {
      throw new Error('Only SVG icons are supported');
    }
  }

  return (
    <DesignsystemetTabs.Tab
      key={id}
      value={id}
      style={{
        backgroundColor: isActive ? 'white' : 'transparent',
      }}
      tabIndex={0}
    >
      {!!icon && (
        <img
          src={icon}
          alt={translatedTitle ?? 'tab icon'}
          style={{
            width: '24px',
          }}
        />
      )}
      {translatedTitle}
    </DesignsystemetTabs.Tab>
  );
}
