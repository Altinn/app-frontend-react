import React from 'react';
import type { JSX } from 'react';

import { Heading } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/app-components/ConditionalWrapper/ConditionalWrapper';
import { Fieldset } from 'src/app-components/Label/Fieldset';
import { Panel } from 'src/app-components/Panel/Panel';
import { useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Group/GroupComponent.module.css';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { useItemWhenType, useNodeDirectChildren } from 'src/utils/layout/useNodeItem';
import type { HeadingLevel } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IGroupComponent {
  groupNode: LayoutNode<'Group'>;
  containerDivRef?: React.Ref<HTMLDivElement>;
  id?: string;
  restriction?: number | undefined;
  isSummary?: boolean;
  renderLayoutNode: (node: LayoutNode) => JSX.Element | null;
}

const headingSizes: { [k in HeadingLevel]: Parameters<typeof Heading>[0]['data-size'] } = {
  [2]: 'sm',
  [3]: 'xs',
  [4]: '2xs',
  [5]: '2xs',
  [6]: '2xs',
};

export function GroupComponent({
  groupNode,
  containerDivRef,
  id,
  restriction,
  isSummary,
  renderLayoutNode,
}: IGroupComponent) {
  const container = useItemWhenType(groupNode.baseId, 'Group');
  const { title, summaryTitle, description } = container.textResourceBindings ?? {};
  const isHidden = Hidden.useIsHidden(groupNode);

  const children = useNodeDirectChildren(groupNode, restriction);
  const depth = NodesInternal.useSelector((state) => state.nodeData?.[groupNode.id]?.depth);
  const layoutLookups = useLayoutLookups();

  if (isHidden) {
    return null;
  }

  const parent = layoutLookups.componentToParent[groupNode.baseId];
  const isNested = parent?.type === 'node';
  const isPanel = container.groupingIndicator === 'panel';
  const isIndented = container.groupingIndicator === 'indented';
  const headingLevel = container.headingLevel ?? (Math.min(Math.max(depth + 1, 2), 6) as HeadingLevel);
  const headingSize = headingSizes[headingLevel];
  const legend = isSummary ? (summaryTitle ?? title) : title;

  return (
    <div className={cn(classes.groupWrapper, { [classes.panelWrapper]: isPanel, [classes.summary]: isSummary })}>
      <ConditionalWrapper
        condition={isPanel && !isSummary}
        wrapper={(child) => <Panel variant='info'>{child}</Panel>}
      >
        <Fieldset
          legend={
            legend ? (
              <Heading
                className={classes.legend}
                level={headingLevel}
                data-size={headingSize}
              >
                <Lang id={legend} />
              </Heading>
            ) : undefined
          }
          description={
            description && !isSummary ? (
              <span className={classes.description}>
                <Lang id={description} />
              </span>
            ) : undefined
          }
        >
          <div
            data-componentid={groupNode.id}
            data-componentbaseid={groupNode.baseId}
            ref={containerDivRef}
            id={id ?? groupNode.id}
            data-testid='display-group-container'
            className={cn(classes.groupContainer, {
              [classes.indented]: isIndented && !isNested,
            })}
          >
            {children.map((n) => renderLayoutNode(n))}
          </div>
        </Fieldset>
      </ConditionalWrapper>
    </div>
  );
}
