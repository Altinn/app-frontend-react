import * as React from 'react';
import type { IValidations } from 'src/types';
import { getUnmappedErrors } from 'src/utils/validation';
import { useAppSelector } from 'src/common/hooks';
import { FullWidthWrapper } from 'src/features/form/components/FullWidthWrapper';
import { Grid } from '@material-ui/core';
import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import { renderLayoutComponent } from 'src/features/form/containers/Form';
import { getLanguageFromKey } from 'altinn-shared/utils';
import type { ILayout } from 'src/features/form/layout';

export interface IErrorReportProps {
  components: ILayout;
}

interface Error {
  layout: string;
  componentId: string;
  message: string | React.ReactNode;
}

const ErrorReport = ({ components }: IErrorReportProps) => {
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
              <ul style={{ listStylePosition: 'inside' }}>
                {unmappedErrors.map((error: React.ReactNode, index: number) => {
                  return <li key={`unmapped-${index}`}>{error}</li>;
                })}
                {formErrors.map((error, index) => {
                  return <li key={`mapped-${index}`}>{error.message}</li>;
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
