import React from 'react';

import { Grid, makeStyles, Typography } from '@material-ui/core';
import cn from 'classnames';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { makeGetHidden } from 'src/selectors/getLayoutData';
import { pageBreakStyles } from 'src/utils/formComponentUtils';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

export interface IDisplayGroupContainer {
  groupNode: LayoutNode;
  renderLayoutNode: (node: LayoutNode) => JSX.Element | null;
}

const useStyles = makeStyles({
  groupTitle: {
    fontWeight: 700,
    fontSize: '1.5rem',
    paddingBottom: 12,
  },
  groupContainer: {
    paddingBottom: 38,
  },
});

export function DisplayGroupContainer({ groupNode, renderLayoutNode }: IDisplayGroupContainer) {
  const container = groupNode.item;

  const GetHiddenSelector = makeGetHidden();
  const hidden: boolean = useAppSelector((state) => GetHiddenSelector(state, { id: container.id }));
  const classes = useStyles();
  const title = useAppSelector((state) => {
    const titleKey = container?.textResourceBindings?.title;
    if (titleKey && state.language.language) {
      return getTextFromAppOrDefault(titleKey, state.textResources.resources, state.language.language, [], true);
    }
    return undefined;
  });

  if (hidden || !container) {
    return null;
  }

  return (
    <Grid
      container={true}
      item={true}
      id={container.id}
      className={cn(classes.groupContainer, pageBreakStyles(container.pageBreak))}
      spacing={3}
      alignItems='flex-start'
      data-testid='display-group-container'
    >
      {title && (
        <Grid
          item={true}
          xs={12}
        >
          <Typography
            className={classes.groupTitle}
            variant='h2'
          >
            {title}
          </Typography>
        </Grid>
      )}
      {groupNode.children().map((n) => renderLayoutNode(n))}
    </Grid>
  );
}
