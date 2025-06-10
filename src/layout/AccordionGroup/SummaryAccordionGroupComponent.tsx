import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/designsystemet-react';

import { SummaryAccordionComponent, SummaryAccordionComponent2 } from 'src/layout/Accordion/SummaryAccordion';
import { useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const SummaryAccordionGroupComponent = ({ targetNode, ...rest }: SummaryRendererProps<'AccordionGroup'>) => {
  const { childComponents } = useNodeItem(targetNode);
  return (
    <DesignSystemAccordion>
      {childComponents.map((childId) => (
        <Child
          key={childId}
          id={childId}
          {...rest}
        />
      ))}
    </DesignSystemAccordion>
  );
};

export const SummaryAccordionGroupComponent2 = ({ target, ...rest }: Summary2Props<'AccordionGroup'>) => {
  const { childComponents } = useNodeItem(target);
  return (
    <DesignSystemAccordion style={{ width: '100%' }}>
      {childComponents.map((childId) => (
        <Child2
          target={target}
          key={childId}
          id={childId}
          {...rest}
        />
      ))}
    </DesignSystemAccordion>
  );
};

function Child2({ id, ...rest }: { id: string } & Omit<Summary2Props<'AccordionGroup'>, 'targetNode'>) {
  const targetNode = useNode(id) as LayoutNode<'Accordion'> | undefined;
  if (!targetNode) {
    return null;
  }

  return (
    <SummaryAccordionComponent2
      {...rest}
      key={targetNode.id}
      target={targetNode}
    />
  );
}

function Child({ id, ...rest }: { id: string } & Omit<SummaryRendererProps<'AccordionGroup'>, 'targetNode'>) {
  const targetNode = useNode(id) as LayoutNode<'Accordion'> | undefined;
  if (!targetNode) {
    return null;
  }

  return (
    <SummaryAccordionComponent
      key={targetNode.id}
      targetNode={targetNode}
      {...rest}
    />
  );
}
