import * as React from 'react';
import type { IValidations } from 'src/types';
import { getUnmappedErrors } from 'src/utils/validation';
import { useAppSelector, useAppDispatch } from 'src/common/hooks';
import { FullWidthWrapper } from 'src/features/form/components/FullWidthWrapper';
import { Grid, makeStyles } from '@material-ui/core';
import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import { renderLayoutComponent } from 'src/features/form/containers/Form';
import { getLanguageFromKey } from 'altinn-shared/utils';
import type { ILayout } from 'src/features/form/layout';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';

export interface IErrorReportProps {
  components: ILayout;
}

interface Error {
  layout: string;
  componentId: string;
  message: string | React.ReactNode;
}

const ArrowForwardIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" style="position: relative; top: 2px">' +
  '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path>' +
  '</svg>';

const useStyles = makeStyles((theme) => ({
  errorList: {
    listStylePosition: 'inside',
    listStyleImage: `url("data:image/svg+xml,${encodeURIComponent(
      ArrowForwardIcon,
    )}")`,
    '& > li': {
      marginBottom: theme.spacing(1),
    },
  },
  buttonAsInvisibleLink: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline',
    margin: 0,
    padding: 0,
  },
}));

const ErrorReport = ({ components }: IErrorReportProps) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(
    (state) => state.formLayout.uiConfig.currentView,
  );
  const validations = useAppSelector(
    (state) => state.formValidations.validations,
  );
  const language = useAppSelector((state) => state.language.language);
  const formErrors = useAppSelector((state) =>
    getFormErrors(state.formValidations.validations),
  );

  if (formErrors.length === 0) {
    return null;
  }

  const unmappedErrors = getUnmappedErrors(validations);
  const hasErrors = unmappedErrors.length > 0 || formErrors.length > 0;

  const OnClickError =
    (error: Error) => (ev: React.KeyboardEvent | React.MouseEvent) => {
      if (
        ev.type === 'keydown' &&
        (ev as React.KeyboardEvent).key !== 'Enter'
      ) {
        return;
      }
      ev.preventDefault();
      if (currentView === error.layout) {
        dispatch(
          FormLayoutActions.updateFocus({
            currentComponentId: error.componentId,
          }),
        );
      } else {
        dispatch(
          FormLayoutActions.updateCurrentView({
            newView: error.layout,
            runValidations: null,
            returnToView: currentView,
            focusComponentId: error.componentId,
          }),
        );
      }
    };

  return (
    <Grid
      item={true}
      xs={12}
    >
      <FullWidthWrapper onBottom={true}>
        <Panel
          title={getLanguageFromKey(
            'form_filler.error_report_header',
            language,
          )}
          showIcon={false}
          variant={PanelVariant.Warning}
        >
          <Grid
            container={true}
            item={true}
            spacing={3}
            alignItems='flex-start'
          >
            <Grid
              item
              xs={12}
            >
              <ul className={classes.errorList}>
                {unmappedErrors.map((error: React.ReactNode, index: number) => {
                  return <li key={`unmapped-${index}`}>{error}</li>;
                })}
                {formErrors.map((error, index) => {
                  return (
                    <li key={`mapped-${index}`}>
                      <button
                        className={classes.buttonAsInvisibleLink}
                        tabIndex={0}
                        onClick={OnClickError(error)}
                        onKeyDown={OnClickError(error)}
                      >
                        {error.message}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!hasErrors && (
                // No errors to list, show a generic error message
                <h4
                  className='a-fontReg'
                  style={{ marginBottom: '12px' }}
                >
                  <span>
                    {getLanguageFromKey(
                      'form_filler.error_report_description',
                      language,
                    )}
                  </span>
                </h4>
              )}
            </Grid>

            {components.map((component) => {
              return renderLayoutComponent(component, []);
            })}
          </Grid>
        </Panel>
      </FullWidthWrapper>
    </Grid>
  );
};

export const getFormErrors = (validations: IValidations): Error[] => {
  const errors: Error[] = [];

  for (const layout in validations) {
    for (const componentId in validations[layout]) {
      const validationObject = validations[layout][componentId];
      for (const fieldKey in validationObject) {
        for (const message of validationObject[fieldKey].errors || []) {
          errors.push({
            layout,
            componentId,
            message,
          });
        }
      }
    }
  }

  return errors;
};

export default ErrorReport;
