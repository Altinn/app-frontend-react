import React from 'react';

import { Heading, Paragraph } from '@digdir/designsystemet-react';
import cn from 'classnames';

import classes from 'src/layout/Group/GroupSummary.module.css';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type GroupComponentSummaryProps = {
  componentNode: LayoutNode<'Group'>;
  childComponents: JSX.Element[] | null;
  hierarchyLevel?: number;
};

export const GroupSummary = ({ componentNode, childComponents, hierarchyLevel = 0 }: GroupComponentSummaryProps) => {
  const title = componentNode.item.textResourceBindings?.title;
  const description = componentNode.item.textResourceBindings?.description;
  const headingLevel = 3 + hierarchyLevel <= 6 ? 3 + hierarchyLevel : 6;
  const isNestedGroup = hierarchyLevel > 0;
  return (
    <section className={isNestedGroup ? cn(classes.groupContainer, classes.nested) : cn(classes.groupContainer)}>
      <Heading
        size='small'
        level={headingLevel as 3 | 4 | 5 | 6}
      >
        {title}
      </Heading>
      <Paragraph
        spacing
        className={cn(classes.description)}
      >
        {description}
      </Paragraph>
      {childComponents}
    </section>
  );
};
