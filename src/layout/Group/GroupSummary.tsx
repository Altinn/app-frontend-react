import React from 'react';

import { Heading, Paragraph } from '@digdir/designsystemet-react';
import cn from 'classnames';
import type { HeadingProps } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Group/GroupSummary.module.css';
import { ComponentSummary } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompInternal } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type GroupComponentSummaryProps = {
  componentNode: LayoutNode<'Group'>;
  hierarchyLevel?: number;
  summaryOverrides?: CompInternal<'Summary2'>['overrides'];
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

const ChildComponents = ({ componentNode, hierarchyLevel, summaryOverrides }: GroupComponentSummaryProps) => {
  const childComponents = useNodeItem(componentNode, (i) => i.childComponents);
  return (
    childComponents.length &&
    childComponents.map((child) => {
      if (child?.isType('Group')) {
        return (
          <GroupSummary
            componentNode={child}
            hierarchyLevel={hierarchyLevel ? hierarchyLevel + 1 : 1}
            key={componentNode.id}
          />
        );
      } else {
        return (
          <div
            key={child?.id}
            className={cn(classes.childItem)}
          >
            <ComponentSummary
              componentNode={child}
              summaryOverrides={summaryOverrides}
            />
          </div>
        );
      }
    })
  );
};

export const GroupSummary = ({ componentNode, hierarchyLevel = 0, summaryOverrides }: GroupComponentSummaryProps) => {
  const title = useNodeItem(componentNode, (i) => i.textResourceBindings?.title);
  const description = useNodeItem(componentNode, (i) => i.textResourceBindings?.description);
  const headingLevel = getHeadingLevel(hierarchyLevel);
  const isNestedGroup = hierarchyLevel > 0;
  return (
    <section className={isNestedGroup ? cn(classes.groupContainer, classes.nested) : cn(classes.groupContainer)}>
      <div className={cn(classes.groupHeading)}>
        <Heading
          size={isNestedGroup ? 'xsmall' : 'small'}
          level={headingLevel}
        >
          <Lang id={title} />
        </Heading>
        <Paragraph className={cn(classes.description)}>
          <Lang id={description} />
        </Paragraph>
      </div>
      <ChildComponents
        componentNode={componentNode}
        hierarchyLevel={hierarchyLevel}
        summaryOverrides={summaryOverrides}
      />
    </section>
  );
};