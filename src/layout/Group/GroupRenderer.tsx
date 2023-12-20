import React from 'react';

import { GenericComponent } from 'src/layout/GenericComponent';
import { DisplayGroupContainer } from 'src/layout/Group/DisplayGroupContainer';
import type { PropsFromGenericComponent } from 'src/layout';

export type GroupRendererProps = PropsFromGenericComponent<'Group'>;

export function GroupRenderer({ node }: GroupRendererProps) {
  return (
    <DisplayGroupContainer
      key={node.item.id}
      groupNode={node}
      renderLayoutNode={(n) => (
        <GenericComponent
          key={n.item.id}
          node={n}
        />
      )}
    />
  );
}
