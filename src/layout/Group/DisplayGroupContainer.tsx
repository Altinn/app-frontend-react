import React from 'react';

import { Heading } from '@digdir/design-system-react';
import cn from 'classnames';

import { Fieldset } from 'src/components/form/Fieldset';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import classes from 'src/layout/Group/DisplayGroupContainer.module.css';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { HeadingLevel } from 'src/layout/common.generated';
import type {
  CompGroupNonRepeatingInternal,
  CompGroupNonRepeatingPanelInternal,
} from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IDisplayGroupContainer {
  groupNode: LayoutNodeForGroup<CompGroupNonRepeatingInternal | CompGroupNonRepeatingPanelInternal>;
  id?: string;
  onlyRowIndex?: number | undefined;
  renderLayoutNode: (node: LayoutNode) => JSX.Element | null;
}

const headingSizes: { [k in HeadingLevel]: Parameters<typeof Heading>[0]['size'] } = {
  [2]: 'medium',
  [3]: 'small',
  [4]: 'xsmall',
  [5]: 'xsmall',
  [6]: 'xsmall',
};

export function DisplayGroupContainer({ groupNode, id, onlyRowIndex, renderLayoutNode }: IDisplayGroupContainer) {
  const { lang } = useLanguage();
  const container = groupNode.item;
  const { title, description } = container.textResourceBindings ?? {};

  if (groupNode.isHidden()) {
    return null;
  }

  const isNested = groupNode.parent instanceof BaseLayoutNode;
  const headingLevel = Math.min(Math.max(groupNode.parents().length + 1, 2), 6) as HeadingLevel;
  const headingSize = headingSizes[headingLevel];

  return (
    <Fieldset
      legend={
        title && (
          <Heading
            level={headingLevel}
            size={headingSize}
          >
            {lang(title)}
          </Heading>
        )
      }
      className={classes.group}
      description={description && <Lang id={description} />}
    >
      <div
        id={id || container.id}
        data-componentid={container.id}
        data-testid='display-group-container'
        className={cn(
          { [classes.groupingIndicator]: !!container.showGroupingIndicator && !isNested },
          classes.groupContainer,
        )}
      >
        {groupNode.children(undefined, onlyRowIndex).map((n) => renderLayoutNode(n))}
      </div>
    </Fieldset>
  );
}
