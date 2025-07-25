import React from 'react';

import cn from 'classnames';

import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/Accordion/SummaryAccordion.module.css';
import { GenericComponent } from 'src/layout/GenericComponent';
import { ComponentSummary, SummaryFlexForContainer } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { useSummaryProp } from 'src/layout/Summary2/summaryStoreContext';
import { useHasCapability } from 'src/utils/layout/canRenderIn';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

function getHeadingLevel(headingLevel: number | undefined) {
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
    default:
      return 'h2';
  }
}

export function SummaryAccordionComponent({ targetBaseComponentId }: SummaryRendererProps) {
  const { textResourceBindings, headingLevel, children } = useItemWhenType(targetBaseComponentId, 'Accordion');
  const { langAsString } = useLanguage();

  const title = langAsString(textResourceBindings?.title);
  const Heading = getHeadingLevel(headingLevel);

  return (
    <div className={cn(classes.container)}>
      <div className={cn(classes.header, classes.padding)}>
        <Heading className={classes.paddingSmall}>{title}</Heading>
      </div>
      <div className={classes.padding}>
        {children.map((baseId) => (
          <GenericComponent
            key={baseId}
            baseComponentId={baseId}
          />
        ))}
      </div>
    </div>
  );
}

export function SummaryAccordionComponent2({ targetBaseComponentId }: Summary2Props) {
  const canRenderInAccordion = useHasCapability('renderInAccordion');
  const { textResourceBindings, headingLevel, children } = useItemWhenType(targetBaseComponentId, 'Accordion');
  const { langAsString } = useLanguage();

  const hideEmptyFields = useSummaryProp('hideEmptyFields');

  const title = langAsString(textResourceBindings?.title);
  const Heading = getHeadingLevel(headingLevel);

  return (
    <SummaryFlexForContainer
      hideWhen={hideEmptyFields}
      targetBaseId={targetBaseComponentId}
    >
      <div className={cn(classes.container, classes.summary2width)}>
        <div className={cn(classes.header, classes.padding)}>
          <Heading className={classes.paddingSmall}>{title}</Heading>
        </div>
        <div className={classes.padding}>
          {children.filter(canRenderInAccordion).map((baseId) => (
            <ComponentSummary
              key={baseId}
              targetBaseComponentId={baseId}
            />
          ))}
        </div>
      </div>
    </SummaryFlexForContainer>
  );
}
