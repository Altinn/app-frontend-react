import React from 'react';

import { Accordion as DesignSystemAccordion } from '@digdir/design-system-react';

interface AccordionBaseComponentProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AccordionItem = ({ title, children, className }: AccordionBaseComponentProps): React.JSX.Element => (
  <DesignSystemAccordion.Item className={className}>
    <DesignSystemAccordion.Header>{title}</DesignSystemAccordion.Header>
    <DesignSystemAccordion.Content>{children}</DesignSystemAccordion.Content>
  </DesignSystemAccordion.Item>
);
