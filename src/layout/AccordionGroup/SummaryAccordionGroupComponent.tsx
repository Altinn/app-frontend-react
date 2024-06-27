import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/designsystemet-react';

import { SummaryAccordionComponent } from 'src/layout/Accordion/SummaryAccordion';
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
  return (
    <DesignSystemAccordion>
      {childComponents.map((targetNode) => {
        if (!targetNode) {
          return null;
        }

        return (
          <SummaryAccordionComponent
            key={targetNode.id}
            targetNode={targetNode as LayoutNode<'Accordion'>}
            {...rest}
          />
        );
      })}
    </DesignSystemAccordion>
  );
};
