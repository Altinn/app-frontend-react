import React from 'react';

import { AccordionGroupProvider } from 'src/layout/AccordionGroup/AccordionGroupContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponentByBaseId } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

type IAccordionGroupProps = PropsFromGenericComponent<'AccordionGroup'>;

export const AccordionGroup = ({ node }: IAccordionGroupProps) => {
  const { children } = useNodeItem(node);

  return (
    <AccordionGroupProvider>
      <ComponentStructureWrapper node={node}>
        {children.map((id) => (
          <GenericComponentByBaseId
            key={id}
            id={id}
          />
        ))}
      </ComponentStructureWrapper>
    </AccordionGroupProvider>
  );
};
