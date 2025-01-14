import React from 'react';

import { List, ListItem, ListItemText } from '@material-ui/core';

import { Flex } from 'src/app-components/Flex/Flex';
import { useDisplayDataProps } from 'src/features/displayData/useDisplayData';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Checkboxes/MultipleChoiceSummary.module.css';
import type { DisplayDataProps } from 'src/features/displayData';

export interface IMultipleChoiceSummaryProps {
  getFormData: (displayDataProps: DisplayDataProps) => { [key: string]: string };
}

export function MultipleChoiceSummary({ getFormData }: IMultipleChoiceSummaryProps) {
  const props = useDisplayDataProps();
  const formData = getFormData(props);

  return (
    <Flex
      item
      size={{ xs: 12 }}
      data-testid='multiple-choice-summary'
    >
      {Object.keys(formData).length === 0 ? (
        <span className={classes.emptyField}>
          <Lang id='general.empty_summary' />
        </span>
      ) : (
        <List classes={{ root: classes.list }}>
          {Object.keys(formData).map((key) => (
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
      )}
    </Flex>
  );
}
