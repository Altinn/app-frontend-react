import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/designsystemet-react';

import { SummaryAccordionComponent } from 'src/layout/Accordion/SummaryAccordion';
import { useNodeSelector } from 'src/utils/layout/NodesContext';
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
  const nodeSelector = useNodeSelector();
  return (
    <DesignSystemAccordion>
      {childComponents.map((nodeRef) => {
        const targetNode = nodeSelector(nodeRef);
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
