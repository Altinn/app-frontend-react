import React from 'react';

import { Heading, Paragraph } from '@digdir/designsystemet-react';
import cn from 'classnames';

import classes from 'src/layout/Group/GroupSummary.module.css';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type GroupComponentSummaryProps = {
  componentNode: LayoutNode<'Group'>;
  isNested?: boolean;
  childComponents: JSX.Element[] | null;
};

export const GroupSummary = ({ componentNode, isNested, childComponents }: GroupComponentSummaryProps) => {
  const title = componentNode.item.textResourceBindings?.title;
  const description = componentNode.item.textResourceBindings?.description;

  return (
    <div className={isNested ? cn(classes.nestedGroupContainer) : ''}>
      <Heading size='medium'>{title}</Heading>
      <Paragraph>{description}</Paragraph>
      {childComponents}
    </div>
  );
};
