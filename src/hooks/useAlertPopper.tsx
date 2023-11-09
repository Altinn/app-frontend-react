import React, { useState } from 'react';

import { Alert } from '@digdir/design-system-react';
import { Snackbar } from '@material-ui/core';

type Severity = Parameters<typeof Alert>[0]['severity'];

type state = {
  open: boolean;
  message: string;
  severity: Severity;
};

export type ShowPopper = (message: string, severity: Severity) => void;

export function useAlertPopper() {
  const [state, setState] = useState<state>({ message: '', open: false, severity: 'info' });

  const showPopper: ShowPopper = (message: string, severity: Severity) => {
    setState({ open: true, message, severity });
  };

  function hidePopper() {
    setState((prevState) => ({ ...prevState, open: false }));
  }

  const AlertPopper = () => (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={state.open}
      autoHideDuration={6000}
      onClose={hidePopper}
    >
      <Alert severity={state.severity}>{state.message}</Alert>
    </Snackbar>
  );

  return [AlertPopper, showPopper] as const;
}
