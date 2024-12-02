import React from 'react';
import type { JSX } from 'react';

import { Heading } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { Fieldset } from 'src/app-components/Label/Fieldset';
import { Panel } from 'src/app-components/Panel/Panel';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { Description } from 'src/components/form/Description';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { Lang } from 'src/features/language/Lang';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/Group/GroupComponent.module.css';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { Hidden } from 'src/utils/layout/NodesContext';
import { useNodeDirectChildren, useNodeItem } from 'src/utils/layout/useNodeItem';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import type { HeadingLevel } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { TraversalRestriction } from 'src/utils/layout/useNodeTraversal';

export interface IGroupComponent {
  groupNode: LayoutNode<'Group'>;
  containerDivRef?: React.Ref<HTMLDivElement>;
  id?: string;
  restriction?: TraversalRestriction;
  isSummary?: boolean;
  renderLayoutNode: (node: LayoutNode) => JSX.Element | null;
}

const headingSizes: { [k in HeadingLevel]: Parameters<typeof Heading>[0]['size'] } = {
  [2]: 'medium',
  [3]: 'small',
  [4]: 'xsmall',
  [5]: 'xsmall',
  [6]: 'xsmall',
};

export function GroupComponent({
  groupNode,
  containerDivRef,
  id,
  restriction,
  isSummary,
  renderLayoutNode,
}: IGroupComponent) {
  const container = useNodeItem(groupNode);
  const { title, summaryTitle, description } = container.textResourceBindings ?? {};
  const isHidden = Hidden.useIsHidden(groupNode);

  const children = useNodeDirectChildren(groupNode, restriction);
  const depth = useNodeTraversal((traverser) => traverser.with(groupNode).parents().length);

  if (isHidden) {
    return null;
  }

  const isNested = groupNode.parent instanceof BaseLayoutNode;
  const isPanel = container.groupingIndicator === 'panel';
  const isIndented = container.groupingIndicator === 'indented';
  const headingLevel = container.headingLevel ?? (Math.min(Math.max(depth + 1, 2), 6) as HeadingLevel);
  const headingSize = headingSizes[headingLevel];
  const legend = isSummary ? (summaryTitle ?? title) : title;

  return (
    <ComponentStructureWrapper node={groupNode}>
      <ConditionalWrapper
        condition={isPanel && !isSummary}
        wrapper={(child) => (
          <FullWidthWrapper>
            <Panel variant='info'>{child}</Panel>
          </FullWidthWrapper>
        )}
      >
        <div className={cn({ [classes.yPadding]: !isPanel, [classes.panel]: isPanel })}>
          <Fieldset
            legend={
              legend ? (
                <Heading
                  level={headingLevel}
                  size={headingSize}
                >
                  <Lang id={legend} />
                </Heading>
              ) : undefined
            }
            className={cn({
              [classes.summary]: isSummary,
            })}
            description={
              !isSummary && description ? (
                <Description
                  componentId={id}
                  description={<Lang id={description} />}
                />
              ) : undefined
            }
          >
            <div
              data-componentid={container.id}
              data-componentbaseid={container.baseComponentId || container.id}
              ref={containerDivRef}
              id={id ?? container.id}
              data-testid='display-group-container'
              className={cn(classes.groupContainer, {
                [classes.indented]: isIndented && !isNested,
                [classes.summary]: isSummary && !legend,
                [classes.noFieldset]: !isSummary && !legend,
              })}
            >
              {children.map((n) => renderLayoutNode(n))}
            </div>
          </Fieldset>
        </div>
      </ConditionalWrapper>
    </ComponentStructureWrapper>
  );
}
