import { IconButton, makeStyles } from "@material-ui/core";
import React, { ReactNode } from "react";
import cn from "classnames";

export interface IEditIconButtonProps {
  label: ReactNode;
  onClick: () => void;
}

const useStyles = makeStyles((theme) => ({
  editIcon: {
    paddingRight: '6px',
    fontSize: '28px',
    marginTop: '-2px',
  },
  editIconButton: {
    color: theme.altinnPalette.primary.blueDark,
    fontWeight: 700,
    borderRadius: '5px',
    padding: '6px 12px',
    margin: '8px 2px',
    marginTop: '30px',
    '&:hover': {
      background: 'none',
      outline: `1px dotted ${theme.altinnPalette.primary.blueDark}`
    },
    '&:focus': {
      background: theme.altinnPalette.primary.blueLighter,
      outline: `2px dotted ${theme.altinnPalette.primary.blueDark}`
    }
  }
}));

export function EditIconButton({ label, onClick }: IEditIconButtonProps) {
  const classes = useStyles();
  return (
    <IconButton
      classes={{ root: classes.editIconButton }}
      onClick={onClick}>
      <i className={cn('fa fa-edit ', classes.editIcon)} />
      <span className={cn("saveButton-label")}>
        {label}
      </span>
    </IconButton>
  )
}
