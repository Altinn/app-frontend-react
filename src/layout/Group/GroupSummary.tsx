import React from 'react';

import { Heading, Paragraph } from '@digdir/designsystemet-react';
import cn from 'classnames';
import type { HeadingProps } from '@digdir/designsystemet-react';

import classes from 'src/layout/Group/GroupSummary.module.css';
import { ComponentSummary } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import type { CompGroupInternal } from 'src/layout/Group/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type GroupComponentSummaryProps = {
  componentNode: LayoutNode<'Group'>;
  hierarchyLevel?: number;
  summaryOverrides?: CompGroupInternal['summaryProps'];
};

type HeadingLevel = HeadingProps['level'];

function getHeadingLevel(hierarchyLevel: number): HeadingLevel {
  const minimumHeadingLevel = 3;
  const maximumHeadingLevel = 6;
  const computedHeadingLevel = minimumHeadingLevel + hierarchyLevel;
  if (computedHeadingLevel <= maximumHeadingLevel) {
    return computedHeadingLevel as HeadingLevel;
  }
  if (computedHeadingLevel > maximumHeadingLevel) {
    return maximumHeadingLevel;
  }
}

function renderGroupComponentSummary(componentNode: LayoutNode<'Group'>, hierarchyLevel = 0) {
  return (
    <GroupSummary
      componentNode={componentNode}
      hierarchyLevel={hierarchyLevel + 1}
      key={componentNode.item.id}
    />
  );
}

function renderChildComponents(componentNode: LayoutNode, hierarchyLevel = 0, summaryOverrides) {
  if ('childComponents' in componentNode.item) {
    return (
      !!componentNode?.item?.childComponents?.length &&
      componentNode.item.childComponents.map((child) => {
        if (child?.item?.type === 'Group') {
          return renderGroupComponentSummary(child as LayoutNode<'Group'>, hierarchyLevel);
        } else {
          return (
            <ComponentSummary
              key={child?.item?.id}
              componentNode={child}
              summaryOverrides={summaryOverrides}
            />
          );
        }
      })
    );
  }
}

export const GroupSummary = ({ componentNode, hierarchyLevel = 0, summaryOverrides }: GroupComponentSummaryProps) => {
  const title = componentNode.item.textResourceBindings?.title;
  const description = componentNode.item.textResourceBindings?.description;
  const headingLevel = getHeadingLevel(hierarchyLevel);
  const isGroup = componentNode.item.type === 'Group';
  const isNestedGroup = isGroup && hierarchyLevel > 0;
  return (
    <section className={isNestedGroup ? cn(classes.groupContainer, classes.nested) : cn(classes.groupContainer)}>
      <Heading
        size='small'
        level={headingLevel}
      >
        {title}
      </Heading>
      <Paragraph
        spacing
        className={cn(classes.description)}
      >
        {description}
      </Paragraph>
      {renderChildComponents(componentNode, hierarchyLevel, summaryOverrides)}
    </section>
  );
};
