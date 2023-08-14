import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';

import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/Accordion/Accordion.module.css';
import { AccordionItem } from 'src/layout/Accordion/AccordionItem';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { HeadingLevel } from 'src/types/shared';

function getHeadingLevel(headingLevel?: HeadingLevel): 'h2' | 'h3' | 'h4' | 'h5' | 'h6' {
  switch (headingLevel) {
    case 2:
      return 'h2';
    case 3:
      return 'h3';
    case 4:
      return 'h4';
    case 5:
      return 'h5';
    case 6:
      return 'h6';
  }
  return 'h2';
}

const AccordionPrint = ({ node }: Pick<IAccordionProps, 'node'>) => {
  const { textResourceBindings, headingLevel } = node.item;
  const { langAsString } = useLanguage();
  const title = langAsString(textResourceBindings?.title ?? '');

  const Heading = getHeadingLevel(headingLevel);

  return (
    <div className={classes.print}>
      <Heading>{title}</Heading>
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
  const { textResourceBindings, renderAsAccordionItem, headingLevel } = node.item;
  const { langAsString } = useLanguage();

  const title = langAsString(textResourceBindings?.title ?? '');

  if (renderAsAccordionItem) {
    return (
      <>
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
