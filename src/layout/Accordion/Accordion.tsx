import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';

import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/Accordion/Accordion.module.css';
import { AccordionItem } from 'src/layout/Accordion/AccordionItem';
import { useIsInAccordionGroup } from 'src/layout/AccordionGroup/AccordionGroupContext';
import { GenericComponent } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

type IAccordionProps = PropsFromGenericComponent<'Accordion'>;

export const Accordion = ({ node }: IAccordionProps) => {
  const { textResourceBindings, headingLevel, childComponents } = useNodeItem(node);
  const { langAsString } = useLanguage();
  const renderAsAccordionItem = useIsInAccordionGroup();

  const title = langAsString(textResourceBindings?.title ?? '');

  if (renderAsAccordionItem) {
    return (
      <AccordionItem
        title={title}
        className={classes.container}
        headingLevel={headingLevel}
      >
        <Grid
          item={true}
          container={true}
          spacing={3}
          alignItems='flex-start'
        >
          {childComponents.map((node) => (
            <GenericComponent
              key={node.id}
              node={node}
            />
          ))}
        </Grid>
      </AccordionItem>
    );
  }

  return (
    <DesignSystemAccordion
      color='subtle'
      border
      className={classes.container}
    >
      <AccordionItem
        title={title}
        headingLevel={headingLevel}
      >
        <Grid
          item={true}
          container={true}
          spacing={3}
          alignItems='flex-start'
        >
          {childComponents.map((node) => (
            <GenericComponent
              key={node.id}
              node={node}
            />
          ))}
        </Grid>
      </AccordionItem>
    </DesignSystemAccordion>
  );
};
