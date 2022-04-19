import {createTheme, createStyles, makeStyles, IconButton, Typography, Modal} from '@material-ui/core';
import classNames from 'classnames';
import * as React from 'react';
import altinnTheme from './../../theme/altinnStudioTheme';

export interface IAltinnModalComponentProvidedProps extends IAltinnModalComponentState {
  /** Text or react element shown in the header */
  headerText?: any;
  /** Show close-icon outside modal */
  closeButtonOutsideModal?: boolean;
  /** Callback function for when the modal is closed */
  onClose: any;
  /** Boolean value for hiding the background shower */
  hideBackdrop?: boolean;
  /** Boolean value for hiding the X button in the header */
  hideCloseIcon?: boolean;
  /** Boolean value for allowing modal to close on backdrop click */
  allowCloseOnBackdropClick?: boolean;
  /** Boolean value for showing print view */
  printView?: boolean;
}

export interface IAltinnModalComponentState {
  /** Boolean value of the modal being open or not */
  isOpen: boolean;
}

const theme = createTheme(altinnTheme);

const styles = createStyles({
  modal: {
    [theme.breakpoints.down('sm')]: {
      width: '95%',
    },
    [theme.breakpoints.up('md')]: {
      width: '80%',
    },
    maxWidth: '875px',
    backgroundColor: theme.altinnPalette.primary.white,
    boxShadow: theme.shadows[5],
    outline: 'none',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: '9.68rem',
    marginBottom: '10%',
    ['@media only print']: {
      boxShadow: '0 0 0 0 !important',
    },
  },
  header: {
    backgroundColor: altinnTheme.altinnPalette.primary.blueDarker,
    paddingLeft: 12,
    '@media (min-width: 786px)': {
      paddingLeft: 96,
    },
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: '2.8rem',
    color: altinnTheme.altinnPalette.primary.white,
  },
  body: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 24,
    paddingBottom: 34,
    ['@media only print']: {
      paddingLeft: 48,
    },
    '@media (min-width: 786px)': {
      paddingLeft: 96,
      paddingRight: 96,
      paddingTop: 34,
    },
  },
  iconBtn: {
    float: 'right',
    marginRight: '-11px',
    marginTop: '-27px',
  },
  iconStyling: {
    color: altinnTheme.altinnPalette.primary.white,
    fontSize: 38,
  },
  closeButtonOutsideModal: {
    position: 'relative',
    top: -60,
  },
  scroll: {
    overflow: 'overlay',
  },
});

const useStyles = makeStyles(styles);

const StyledModal = (props: React.PropsWithChildren<IAltinnModalComponentProvidedProps>) => {
  const classes = useStyles();
  return (
    <div className={classes.modal}>
      <div className={classes.header}>
        {props.hideCloseIcon && props.hideCloseIcon === true ? null :
          <IconButton
            className={classNames(
              classes.iconBtn,
              {[classes.closeButtonOutsideModal]: props.closeButtonOutsideModal === true},
            )}
            onClick={props.onClose}
          >
            <i className={classNames('ai ai-exit-test', classes.iconStyling)}/>
          </IconButton>
        }
        <Typography className={classes.headerText}>
          {props.headerText}
        </Typography>
      </div>
      <div className={classes.body}>
        {props.children}
      </div>
    </div>
  );
}

const AltinnModal = (props: React.PropsWithChildren<IAltinnModalComponentProvidedProps>) => {
  const classes = useStyles();
  if (!props.printView) {
    const {isOpen, hideBackdrop, allowCloseOnBackdropClick, onClose} = props;
    return (
      <Modal
        open={isOpen}
        className={classes.scroll}
        hideBackdrop={hideBackdrop}
        onBackdropClick={allowCloseOnBackdropClick === false ? null : onClose}
      >
        <StyledModal {...props}/>
      </Modal>
    );
  }
  return (
    <StyledModal {...props}/>
  );
}

export default AltinnModal;
