import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/design-system-react';

import type { HeadingLevel } from 'src/types/shared';

interface AccordionBaseComponentProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headingLevel?: HeadingLevel;
}

export const AccordionItem = ({
  title,
  children,
  className,
  headingLevel = 2,
}: AccordionBaseComponentProps): React.JSX.Element => (
  <DesignSystemAccordion.Item className={className}>
    <DesignSystemAccordion.Header level={headingLevel}>{title}</DesignSystemAccordion.Header>
    <DesignSystemAccordion.Content>{children}</DesignSystemAccordion.Content>
  </DesignSystemAccordion.Item>
);
