import React, { useState } from 'react';

import { Alert } from '@digdir/design-system-react';
import Snackbar from '@material-ui/core/Snackbar';

import { createContext } from 'src/core/contexts/context';
import { BackendValidationSeverity } from 'src/features/validation';
import { getValidationIssueMessage } from 'src/features/validation/backend/backendUtils';
import type { IUseLanguage } from 'src/features/language/useLanguage';
import type { BackendValidationIssue } from 'src/features/validation';

export type AlertSeverity = Parameters<typeof Alert>[0]['severity'];

type Alert = {
  message: string;
  severity: AlertSeverity;
};

type state = {
  open: boolean;
  alerts: Alert[];
};

type ShowAlerts = (alerts: Alert[]) => void;
type ShowAlert = (message: string, severity: AlertSeverity) => void;

type AlertContext = {
  showAlerts: ShowAlerts;
  showAlert: ShowAlert;
};

const { Provider, useCtx } = createContext<AlertContext>({ name: 'AlertContext', required: true });

export function AlertProvider({ children }) {
  const [state, setState] = useState<state>({ open: false, alerts: [] });

  const showAlerts: ShowAlerts = (alerts: Alert[]) => {
    setState({ open: true, alerts });
  };

  const showAlert: ShowAlert = (message: string, severity: AlertSeverity) => {
    setState({ open: true, alerts: [{ message, severity }] });
  };

  function hidePopper() {
    setState({ open: false, alerts: [] });
  }

  return (
    <Provider value={{ showAlerts, showAlert }}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={state.open}
        autoHideDuration={6000}
        onClose={hidePopper}
      >
        <div id='globalAlert'>
          {state.alerts.map(({ message, severity }) => (
            <Alert
              key={`${severity}-${message}`}
              severity={severity}
            >
              {message}
            </Alert>
          ))}
        </div>
      </Snackbar>
    </Provider>
  );
}

export function backendIssuesToAlerts(validationIssues: BackendValidationIssue[], langTools: IUseLanguage): Alert[] {
  return validationIssues.map((issue) => {
    const message = getValidationIssueMessage(issue, langTools);

    let severity: AlertSeverity;
    switch (issue.severity) {
      case BackendValidationSeverity.Error:
        severity = 'danger';
        break;
      case BackendValidationSeverity.Warning:
        severity = 'warning';
        break;
      case BackendValidationSeverity.Success:
        severity = 'success';
        break;
      default:
        severity = 'info';
    }
    return { message, severity };
  });
}

export const useAlertContext = useCtx;
