import React from 'react';

import { GenericComponent } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type IAccordionGroupProps = PropsFromGenericComponent<'AccordionGroup'>;

export const AccordionGroup = ({ node }: IAccordionGroupProps) => {
  const { childComponents } = useNodeItem(node);
  return (
    <>
      {childComponents.map((n: LayoutNode<'Accordion'>) => (
        <GenericComponent<'Accordion'>
          key={n.getId()}
          node={n}
          overrideItemProps={{
            renderAsAccordionItem: true,
          }}
        />
      ))}
    </>
  );
};
