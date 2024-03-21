import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/design-system-react';

import { SummaryAccordionComponent } from 'src/layout/Accordion/SummaryAccordion';
import { useNodeRefSelector } from 'src/utils/layout/nodeRef';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface ISummaryAccordionComponentProps {
  changeText: string | null;
  onChangeClick: () => void;
  summaryNode: LayoutNode<'Summary'>;
  targetNode: LayoutNode<'AccordionGroup'>;
  overrides?: ISummaryComponent['overrides'];
}

export const SummaryAccordionGroupComponent = ({ targetNode, ...rest }: ISummaryAccordionComponentProps) => {
  const { childComponents } = useNodeItem(targetNode);
  const nodeRefSelector = useNodeRefSelector();
  return (
    <DesignSystemAccordion>
      {childComponents.map((nodeRef) => {
        const targetNode = nodeRefSelector(nodeRef);
        if (!targetNode) {
          return null;
        }

        return (
          <SummaryAccordionComponent
            key={nodeRef.nodeRef}
            targetNode={targetNode as LayoutNode<'Accordion'>}
            {...rest}
          />
        );
      })}
    </DesignSystemAccordion>
  );
};
