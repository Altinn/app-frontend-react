import { makeStyles } from "@material-ui/core";
import React from "react";
import cn from 'classnames';

export interface ILandmarkShortcutsProps {
  navToMainText: string;
}

const useStyles = makeStyles({
  button: {
    textDecoration: 'underline',
    textAlign: 'left',
    width: 'fit-content',
  },
  jumpNav: {
    backgroundColor: "#fff",
  },
  'sr-only': {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  },
  'sr-only-focusable': {
    '&:focus': {
      position: 'relative',
      width: 'auto',
      height: 'auto',
      clip: 'initial',
      margin: 'inherit',
      padding: 'inherit',
      border: 'initial',
    },
  }
});

export function LandmarkShortcuts({
  navToMainText,
}: ILandmarkShortcutsProps) {
  const classes = useStyles();

  const handleClick = () => {
    // workaround because we still use a hash-router (sigh...)
    // can be replaced by the more elegant solution <a href="#main-content></a> once this is no longer the case.
    const main = document.getElementById('main-content');
    main.tabIndex = -1;
    main.focus();
  }

  return (
    <nav className={cn(classes.jumpNav)}>
      <button
        role='link'
        onClick={handleClick}
        className={cn(classes.button, classes["sr-only"], classes["sr-only-focusable"])}
      >
        {navToMainText}
      </button>
    </nav>
  );
}
