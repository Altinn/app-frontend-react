import React from 'react';

import { Grid, List, ListItem, ListItemText, makeStyles } from '@material-ui/core';

import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { HComponent } from 'src/utils/layout/hierarchy.types';

export interface IMultipleChoiceSummaryProps {
  targetNode: LayoutNode<HComponent<'Checkboxes'>>;
}

const useStyles = makeStyles({
  list: {
    padding: 0,
  },
  listItem: {
    padding: 0,
  },
  // Match style in \src\components\summary\SingleInputSummary.tsx
  data: {
    fontWeight: 500,
    fontSize: '1.125rem',
    '& p': {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
  },
});

export function MultipleChoiceSummary({ targetNode }: IMultipleChoiceSummaryProps) {
  const classes = useStyles();

  // PRIORITY: Find form data for component, check that it's string[]
  const formData: string[] = [];

  return (
    <Grid
      item
      xs={12}
      data-testid={'multiple-choice-summary'}
    >
      <List classes={{ root: classes.list }}>
        {formData &&
          Object.keys(formData).map((key) => (
            <ListItem
              key={key}
              classes={{ root: classes.listItem }}
            >
              <ListItemText
                id={key}
                primaryTypographyProps={{ classes: { root: classes.data } }}
                primary={formData[key]}
              />
            </ListItem>
          ))}
      </List>
    </Grid>
  );
}
