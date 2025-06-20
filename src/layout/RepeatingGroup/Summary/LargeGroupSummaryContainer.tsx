import React from 'react';
import type { JSX } from 'react';

import { Fieldset, Heading } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/RepeatingGroup/Summary/LargeGroupSummaryContainer.module.css';
import { pageBreakStyles } from 'src/utils/formComponentUtils';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeDirectChildren, useNodeItem } from 'src/utils/layout/useNodeItem';
import type { HeadingLevel } from 'src/layout/common.generated';

export interface IDisplayRepAsLargeGroup {
  groupNode: LayoutNode<'RepeatingGroup'>;
  id?: string;
  restriction?: number | undefined;
  renderLayoutNode: (node: LayoutNode) => JSX.Element | null;
}

const headingSizes: { [k in HeadingLevel]: Parameters<typeof Heading>[0]['size'] } = {
  [2]: 'medium',
  [3]: 'small',
  [4]: 'xsmall',
  [5]: 'xsmall',
  [6]: 'xsmall',
};

export function LargeGroupSummaryContainer({ groupNode, id, restriction, renderLayoutNode }: IDisplayRepAsLargeGroup) {
  const item = useNodeItem(groupNode);
  const isHidden = Hidden.useIsHidden(groupNode);
  const depth = NodesInternal.useSelector((state) => state.nodeData?.[groupNode.id]?.depth);
  const children = useNodeDirectChildren(groupNode, restriction);
  if (isHidden) {
    return null;
  }
  const { title, summaryTitle } = item.textResourceBindings || {};

  const isNested = groupNode.parent instanceof LayoutNode;
  const headingLevel = Math.min(Math.max(depth + 1, 2), 6) as HeadingLevel;
  const headingSize = headingSizes[headingLevel];
  const legend = summaryTitle ?? title;

  return (
    <Fieldset
      legend={
        legend && (
          <Heading
            level={headingLevel}
            size={headingSize}
          >
            <Lang id={legend} />
          </Heading>
        )
      }
      className={cn(pageBreakStyles(item.pageBreak), classes.summary, {
        [classes.largeGroupContainer]: !isNested,
      })}
    >
      <div
        id={id || item.id}
        className={classes.largeGroupContainer}
      >
        {children.map((n) => renderLayoutNode(n))}
      </div>
    </Fieldset>
  );
}
