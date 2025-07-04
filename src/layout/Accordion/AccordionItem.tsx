import React from 'react';

import cn from 'classnames';

import { Accordion } from 'src/app-components/Accordion/Accordion';
import classes from 'src/layout/Accordion/Accordion.module.css';
import type { ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';

interface AccordionBaseComponentProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  open?: ExprValToActualOrExpr<ExprVal.Boolean>;
}

export const AccordionItem = ({ title, children, className, open }: AccordionBaseComponentProps): React.JSX.Element => {
  const [isOpen, setOpen] = React.useState(Boolean(open));

  return (
    <Accordion
      title={title}
      open={isOpen}
      onToggle={(newOpen) => setOpen(newOpen)}
      className={cn(className, classes.accordion)}
    >
      {children}
    </Accordion>
  );
};
