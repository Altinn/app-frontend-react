import React from 'react';

import { Tabs } from '@digdir/designsystemet-react';

import { useLanguage } from 'src/features/language/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const TabGroup = ({ node }: PropsFromGenericComponent<'TabGroup'>) => {
  const { lang } = useLanguage();
  const children = node.item.childComponents;

  return (
    <Tabs defaultValue={children.at(0)?.item.id}>
      <Tabs.List>
        {children.map((n: LayoutNode<'Tab'>) => {
          const text = lang(n.item.textResourceBindings?.['title']);
          return (
            <Tabs.Tab
              key={n.item.id}
              value={n.item.id}
            >
              {text}
            </Tabs.Tab>
          );
        })}
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
