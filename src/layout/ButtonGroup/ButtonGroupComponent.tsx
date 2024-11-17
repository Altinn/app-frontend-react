import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { Flex } from 'src/components/Flex';
import classes from 'src/layout/ButtonGroup/ButtonGroupComponent.module.css';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import { useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

export function ButtonGroupComponent({ node }: PropsFromGenericComponent<'ButtonGroup'>) {
  const childComponents = useNodeItem(node, (i) => i.childComponents);
  return (
    <ComponentStructureWrapper
      node={node}
      label={{ node, renderLabelAs: 'legend' }}
    >
      <Flex
        container
        alignItems='center'
        className={classes.container}
      >
        {childComponents.map((id) => (
          <Child
            key={id}
            id={id}
          />
        ))}
      </Flex>
    </ComponentStructureWrapper>
  );
}

function Child({ id }: { id: string }) {
  const node = useNode(id);
  if (!node) {
    return null;
  }

  return (
    <div
      key={node.id}
      data-componentid={node.id}
      data-componentbaseid={node.baseId}
    >
      <GenericComponent
        node={node}
        overrideDisplay={{ directRender: true }}
      />
    </div>
  );
}
