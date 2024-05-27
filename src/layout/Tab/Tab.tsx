import React from 'react';

import { Tabs } from '@digdir/designsystemet-react';

import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export const Tab = ({ node }: PropsFromGenericComponent<'Tab'>) => (
  <Tabs.Content
    value={node.item.id}
    style={{
      backgroundColor: 'white',
    }}
  >
    {node.item.childComponents.map((n) => (
      <GenericComponent
        key={n.item.id}
        node={n}
      />
    ))}
  </Tabs.Content>
);
