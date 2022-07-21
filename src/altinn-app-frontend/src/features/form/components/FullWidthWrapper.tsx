import React from 'react';

import { makeStyles } from '@material-ui/core';

export interface IFullWidthWrapperProps {
  children?: React.ReactNode;
  onBottom?: boolean;
}

const useStyles = makeStyles({
  fullWidthWrapper: {
    marginLeft: '-24px',
    marginRight: '-24px',
    '@media (min-width: 768px)': {
      marginLeft: '-84px',
      marginRight: '-84px',
    },
    '@media (min-width: 993px)': {
      marginLeft: '-96px',
      marginRight: '-96px',
    },
  },
  consumeBottomPadding: {
    marginBottom: '-24px',
    '@media (min-width: 768px)': {
      marginBottom: '-36px',
    },
  },
});

export function FullWidthWrapper({
  children,
  onBottom,
}: IFullWidthWrapperProps) {
  const classes = useStyles();

  return (
    <div
      className={`${classes.fullWidthWrapper} ${
        onBottom ? classes.consumeBottomPadding : ''
      }`}
      data-testid='fullWidthWrapper'
    >
      {children}
    </div>
  );
}
