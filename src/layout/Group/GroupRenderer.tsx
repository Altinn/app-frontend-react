import React from 'react';

import { GenericComponent } from 'src/layout/GenericComponent';
import { DisplayGroupContainer } from 'src/layout/Group/DisplayGroupContainer';
import { PanelGroupContainer } from 'src/layout/Panel/PanelGroupContainer';
import { PanelReferenceGroupContainer } from 'src/layout/Panel/PanelReferenceGroupContainer';
import type { PropsFromGenericComponent } from 'src/layout';

export type GroupRendererProps = PropsFromGenericComponent<'Group'>;

export function GroupRenderer({ node }: GroupRendererProps) {
  // panel with groupReference
  if (node.isNonRepPanelGroup() && node.item.panel.groupReference) {
    return (
      <PanelReferenceGroupContainer
        key={node.item.id}
        node={node}
      />
    );
  }

  // regular panel group
  if (node.isNonRepPanelGroup()) {
    return (
      <PanelGroupContainer
        key={node.item.id}
        node={node}
      />
    );
  }

  // Treat as regular components
  if (node.isNonRepGroup()) {
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

  return null;
}
