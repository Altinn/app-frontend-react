import React from 'react';

import { Grid } from '@material-ui/core';

import classes from 'src/components/presentation/Header.module.css';
import { Progress } from 'src/components/presentation/Progress';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { ProcessTaskType } from 'src/types';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { PresentationType } from 'src/types';

export interface IHeaderProps {
  type: ProcessTaskType | PresentationType;
  header?: string | JSX.Element | JSX.Element[];
  appOwner?: string;
}

export const Header = ({ type, header, appOwner }: IHeaderProps) => {
  const showProgressSettings = useAppSelector((state) => state.formLayout.uiConfig.showProgress);
  const language = useAppSelector((state) => state.language.language);
  const textResources = useAppSelector((state) => state.textResources.resources);

  const showProgress = type !== ProcessTaskType.Archived && showProgressSettings;

  if (!language) {
    return null;
  }

  return (
    <header className={classes.wrapper}>
      <Grid
        container
        direction='row'
        justifyContent='space-between'
        wrap='nowrap'
        spacing={2}
      >
        <Grid item>
          <Grid item>
            <span>{appOwner}</span>
          </Grid>
          <Grid item>
            <h1
              className={classes.headerText}
              data-testid='presentation-heading'
            >
              {type === ProcessTaskType.Archived ? (
                <span>{getTextFromAppOrDefault('receipt.receipt', textResources, language)}</span>
              ) : (
                header
              )}
            </h1>
          </Grid>
        </Grid>
        {showProgress && (
          <Grid
            item
            aria-live='polite'
          >
            <Progress />
          </Grid>
        )}
      </Grid>
    </header>
  );
};
