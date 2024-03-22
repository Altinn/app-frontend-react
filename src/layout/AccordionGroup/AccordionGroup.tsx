import React from 'react';

import { AccordionGroupProvider } from 'src/layout/AccordionGroup/AccordionGroupContext';
import { GenericComponentByRef } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

type IAccordionGroupProps = PropsFromGenericComponent<'AccordionGroup'>;

export const AccordionGroup = ({ node }: IAccordionGroupProps) => {
  const { childComponents } = useNodeItem(node);
  return (
    <AccordionGroupProvider>
      {childComponents.map((nodeRef) => (
        <GenericComponentByRef
          key={nodeRef.nodeRef}
          nodeRef={nodeRef}
        />
      ))}
    </AccordionGroupProvider>
  );
};
