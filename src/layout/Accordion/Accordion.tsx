import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';

import { AccordionItem } from 'src/layout/Accordion/AccordionItem';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';

type IAccordionProps = PropsFromGenericComponent<'Accordion'>;

export const Accordion = ({ node }: IAccordionProps) => {
  const { textResourceBindings } = node.item;
  const title = textResourceBindings?.title ?? '';

  return (
    <DesignSystemAccordion
      color='subtle'
      border
    >
      <AccordionItem title={title}>
        <Grid
          item={true}
          container={true}
          spacing={3}
          alignItems='flex-start'
        >
          {node.item.childComponents.map((n) => (
            <GenericComponent
              key={n.item.id}
              node={n}
            />
          ))}
        </Grid>
      </AccordionItem>
    </DesignSystemAccordion>
  );
};
