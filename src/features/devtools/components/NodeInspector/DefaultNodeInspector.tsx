import React from 'react';

import cn from 'classnames';

import classes from 'src/features/devtools/components/NodeInspector/NodeInspector.module.css';
import { NodeInspectorDataField } from 'src/features/devtools/components/NodeInspector/NodeInspectorDataField';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface DefaultNodeInspectorParams {
  node: LayoutNode;
  objectWhitelist?: string[];
  ignoredProperties?: string[];
}

export function DefaultNodeInspector({ node, objectWhitelist, ignoredProperties }: DefaultNodeInspectorParams) {
  const objectWhitelistFinal = new Set(
    [
      'dataModelBindings',
      'textResourceBindings',
      'formatting',
      'image',
      'rows',
      'childComponents',
      'grid',
      'innerGrid',
      'triggers',
      'labelSettings',
    ].concat(objectWhitelist ?? []),
  );
  const ignoredPropertiesFinal = new Set(['id', 'type'].concat(ignoredProperties ?? []));

  return (
    <dl className={cn(classes.propertyList, classes.mainPropertyList)}>
      {Object.keys(node.item).map((key) => {
        if (ignoredPropertiesFinal.has(key)) {
          return null;
        }

        return (
          <NodeInspectorDataField
            key={key}
            property={key}
            value={node.item[key]}
            expandObject={objectWhitelistFinal.has(key)}
          />
        );
      })}
    </dl>
  );
}
