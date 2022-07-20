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

const ErrorReport = ({ components }: IErrorReportProps) => {
  const validations = useAppSelector(
    (state) => state.formValidations.validations,
  );
  const unmappedErrors = getUnmappedErrors(validations);
  const hasUnmappedErrors = unmappedErrors.length > 0;
  const language = useAppSelector((state) => state.language.language);
  const formHasErrors = useAppSelector((state) =>
    getFormHasErrors(state.formValidations.validations),
  );
  const hasSubmitted = useAppSelector((state) => state.formData.hasSubmitted);
  const errorRef = React.useRef(null);

  React.useEffect(() => {
    if (hasSubmitted) {
      errorRef?.current?.focus();
    }
  }, [hasSubmitted, unmappedErrors]);

  if (!formHasErrors) {
    return null;
  }

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
            data-testid='panel-group-container'
          >
            <Grid
              item
              xs={12}
            >
              {hasUnmappedErrors && (
                <ul style={{ listStylePosition: 'inside' }}>
                  {unmappedErrors.map(
                    (error: React.ReactNode, index: number) => {
                      return <li key={index}>{error}</li>;
                    },
                  )}
                </ul>
              )}
              {!hasUnmappedErrors && (
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

export const getFormHasErrors = (validations: IValidations): boolean => {
  for (const layout in validations) {
    for (const key in validations[layout]) {
      const validationObject = validations[layout][key];
      for (const fieldKey in validationObject) {
        const fieldValidationErrors = validationObject[fieldKey].errors;
        if (fieldValidationErrors && fieldValidationErrors.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

export default ErrorReport;
