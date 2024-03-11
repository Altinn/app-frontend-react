import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/design-system-react';

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
      {childComponents.map((n: LayoutNode<'Accordion'>) => (
        <SummaryAccordionComponent
          key={n.getId()}
          targetNode={n}
          {...rest}
        />
      ))}
    </DesignSystemAccordion>
  );
};
