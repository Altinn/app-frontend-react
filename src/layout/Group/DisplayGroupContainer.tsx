import React from 'react';

import { Grid, Typography } from '@material-ui/core';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { useAppSelector } from 'src/hooks/useAppSelector';
import classes from 'src/layout/Group/DisplayGroupContainer.module.css';
import { pageBreakStyles, selectComponentTexts } from 'src/utils/formComponentUtils';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { HGroups } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IDisplayGroupContainer {
  groupNode: LayoutNode<HGroups, 'Group'>;
  id?: string;
  onlyRowIndex?: number | undefined;
  renderLayoutNode: (node: LayoutNode) => JSX.Element | null;
}

export function DisplayGroupContainer({ groupNode, id, onlyRowIndex, renderLayoutNode }: IDisplayGroupContainer) {
  const container = groupNode.item;
  const title = useAppSelector((state) => {
    const titleKey = container.textResourceBindings?.title;
    if (titleKey && state.language.language) {
      return getTextFromAppOrDefault(titleKey, state.textResources.resources, state.language.language, [], true);
    }
    return undefined;
  });

  const texts = useAppSelector((state) =>
    selectComponentTexts(state.textResources.resources, container.textResourceBindings),
  );

  if (groupNode.isHidden()) {
    return null;
  }

  return (
    <Grid
      container={true}
      item={true}
      id={id || container.id}
      className={cn(classes.groupContainer, pageBreakStyles(container.pageBreak))}
      spacing={3}
      alignItems='flex-start'
      data-testid='display-group-container'
      data-componentid={container.id}
    >
      {(title || texts.body) && (
        <Grid
          item={true}
          xs={12}
        >
          {title && (
            <Typography
              className={classes.groupTitle}
              variant='h2'
            >
              {title}
            </Typography>
          )}
          {texts.body && (
            <Typography
              className={classes.groupBody}
              variant='body1'
            >
              {texts.body}
            </Typography>
          )}
        </Grid>
      )}
      <ConditionalWrapper
        condition={!!container.showGroupingIndicator}
        wrapper={(children) => (
          <Grid
            item={true}
            container={true}
            spacing={3}
            alignItems='flex-start'
            className={classes.groupingIndicator}
          >
            {children}
          </Grid>
        )}
      >
        <>{groupNode.children(undefined, onlyRowIndex).map((n) => renderLayoutNode(n))}</>
      </ConditionalWrapper>
    </Grid>
  );
}
