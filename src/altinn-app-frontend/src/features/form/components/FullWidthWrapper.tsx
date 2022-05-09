import React from 'react';
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  wrapper: {
    marginLeft: '-24px',
    marginRight: '-24px',
    '@media (min-width:768px)': {
      marginLeft: '-84px',
      marginRight: '-84px',    },
    '@media (min-width:993px)': {
      marginLeft: '-96px',
      marginRight: '-96px',    },
  },
});

export interface IFullWidthWrapperProps {
  children?: React.ReactNode;
}

export function FullWidthWrapper({ children }: IFullWidthWrapperProps) {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      {children}
    </div>
  )
}
