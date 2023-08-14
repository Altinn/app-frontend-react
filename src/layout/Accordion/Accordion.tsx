import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';

import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/Accordion/Accordion.module.css';
import { AccordionItem } from 'src/layout/Accordion/AccordionItem';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';

const AccordionPrint = ({ node }: Pick<IAccordionProps, 'node'>) => {
  const { textResourceBindings } = node.item;
  const { langAsString } = useLanguage();
  const title = langAsString(textResourceBindings?.title ?? '');

  return (
    <div className={classes.print}>
      <h2>{title}</h2>
      {node.item.childComponents.map((n) => (
        <GenericComponent
          key={n.item.id}
          node={n}
        />
      ))}
    </div>
  );
};

type IAccordionProps = PropsFromGenericComponent<'Accordion'> & { renderPDFPreview?: boolean };

export const Accordion = ({ node, renderPDFPreview = true }: IAccordionProps) => {
  const { textResourceBindings, renderAsAccordionItem } = node.item;
  const { langAsString } = useLanguage();

  const title = langAsString(textResourceBindings?.title ?? '');

  if (renderAsAccordionItem) {
    return (
      <>
        <AccordionItem
          title={title}
          className={classes.container}
        >
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
        {renderPDFPreview && <AccordionPrint node={node} />}
      </>
    );
  }

  return (
    <>
      <DesignSystemAccordion
        color='subtle'
        border
        className={classes.container}
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
      {renderPDFPreview && <AccordionPrint node={node} />}
    </>
  );
};
