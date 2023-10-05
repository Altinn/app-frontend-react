import React from 'react';

import { createTheme, MuiThemeProvider, Typography } from '@material-ui/core';

import { ReadyForPrint } from 'src/components/ReadyForPrint';
import { useTaskTypeFromBackend } from 'src/hooks/queries/useProcess';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useLanguage } from 'src/hooks/useLanguage';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';

const theme = createTheme(AltinnAppTheme);

export function Feedback() {
  const dispatch = useAppDispatch();
  const processState = useTaskTypeFromBackend();
  const { lang } = useLanguage();

  React.useEffect(() => {
    if (processState) {
      dispatch(ProcessActions.checkIfUpdated());
    }
  }, [processState, dispatch]);

  return (
    <div id='FeedbackContainer'>
      <MuiThemeProvider theme={theme}>
        <Typography variant='body1'>{lang('feedback.title')}</Typography>
        <Typography variant='body1'>{lang('feedback.body')}</Typography>
      </MuiThemeProvider>
      <ReadyForPrint />
    </div>
  );
}
