import React from 'react';

import { AccordionGroupProvider } from 'src/layout/AccordionGroup/AccordionGroupContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type IAccordionGroupProps = PropsFromGenericComponent<'AccordionGroup'>;

export const AccordionGroup = ({ node }: IAccordionGroupProps) => {
  const { childComponents } = useNodeItem(node);

  // TODO: Clean this up after merge from main (do we need two providers?)
  return (
    <AccordionGroupProvider>
      <ComponentStructureWrapper node={node}>
        {childComponents.map((n: LayoutNode<'Accordion'>) => (
          <GenericComponent<'Accordion'>
            key={n.id}
            node={n}
            overrideItemProps={{
              renderAsAccordionItem: true,
            }}
          />
        ))}
      </ComponentStructureWrapper>
    </AccordionGroupProvider>
  );
};
