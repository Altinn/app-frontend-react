import React from 'react';

import { Card } from '@digdir/designsystemet-react';

import { AccordionGroupProvider } from 'src/layout/AccordionGroup/AccordionGroupContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponentByBaseId } from 'src/layout/GenericComponent';
import { useExternalItem } from 'src/utils/layout/hooks';
import type { PropsFromGenericComponent } from 'src/layout';

type IAccordionGroupProps = PropsFromGenericComponent<'AccordionGroup'>;

export const AccordionGroup = ({ baseComponentId }: IAccordionGroupProps) => {
  const children = useExternalItem(baseComponentId, 'AccordionGroup')?.children;

  return (
    <AccordionGroupProvider>
      <ComponentStructureWrapper baseComponentId={baseComponentId}>
        <Card data-color='neutral'>
          {children?.map((id) => (
            <GenericComponentByBaseId
              key={id}
              id={id}
            />
          ))}
        </Card>
      </ComponentStructureWrapper>
    </AccordionGroupProvider>
  );
};
