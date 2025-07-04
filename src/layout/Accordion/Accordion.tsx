import React from 'react';

import { Card } from '@digdir/designsystemet-react';

import { Accordion as AccordionComponent } from 'src/app-components/Accordion/Accordion';
import { Flex } from 'src/app-components/Flex/Flex';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/Accordion/Accordion.module.css';
import { useIsInAccordionGroup } from 'src/layout/AccordionGroup/AccordionGroupContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponentByBaseId } from 'src/layout/GenericComponent';
import { useHasCapability } from 'src/utils/layout/canRenderIn';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

type IAccordionProps = PropsFromGenericComponent<'Accordion'>;

export const Accordion = ({ node }: IAccordionProps) => {
  const { textResourceBindings, children, openByDefault } = useItemWhenType(node.baseId, 'Accordion');
  const { langAsString } = useLanguage();
  const canRender = useHasCapability('renderInAccordion');
  const renderAsAccordionItem = useIsInAccordionGroup();

  const title = langAsString(textResourceBindings?.title ?? '');

  const AccordionContent = ({ className }: { className?: string }) => (
    <AccordionComponent
      title={title}
      className={className}
      defaultOpen={Boolean(openByDefault)}
    >
      <Flex
        item
        container
        spacing={6}
        alignItems='flex-start'
      >
        {children.filter(canRender).map((id) => (
          <GenericComponentByBaseId
            key={id}
            id={id}
          />
        ))}
      </Flex>
    </AccordionComponent>
  );

  return (
    <ComponentStructureWrapper node={node}>
      {renderAsAccordionItem ? (
        <AccordionContent className={classes.container} />
      ) : (
        <Card data-color='neutral'>
          <AccordionContent className={classes.container} />
        </Card>
      )}
    </ComponentStructureWrapper>
  );
};
