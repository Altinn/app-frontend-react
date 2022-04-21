import * as React from 'react';
import { getLanguageFromKey } from 'altinn-shared/utils';
import { IValidations } from 'src/types';
import { getUnmappedErrors } from 'src/utils/validation';
import { useAppSelector } from 'src/common/hooks';

const ErrorReport = () => {
  const validations = useAppSelector(state => state.formValidations.validations,);
  const unmappedErrors = getUnmappedErrors(validations);
  const hasUnmappedErrors = unmappedErrors.length > 0;
  const language = useAppSelector(state => state.language.language);
  const formHasErrors = useAppSelector(state => getFormHasErrors(state.formValidations.validations));
  const hasSubmitted = useAppSelector(state => state.formData.hasSubmitted);
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
    <div
      id='errorReport'
      className='a-modal-content-target'
      style={{ marginTop: '55px' }}
      ref={errorRef}
      tabIndex={-1}
    >
      <div className='a-page a-current-page'>
        <div className='modalPage'>
          <div className='modal-content'>
            <div className='modal-body' style={{ paddingBottom: '0px' }}>
              <div className='a-iconText' style={{ minHeight: '60px' }}>
                <div className='a-iconText-icon'>
                  <i
                    className='ai ai-circle-exclamation a-icon'
                    style={{
                      color: '#E23B53',
                      fontSize: '4em',
                      marginLeft: '12px',
                    }}
                    aria-hidden='true'
                  />
                </div>
                <h2
                  className='a-fontReg'
                  style={{ marginBottom: '0px', marginLeft: '12px' }}
                >
                  <span className='a-iconText-text-large'>
                    {getLanguageFromKey(
                      'form_filler.error_report_header',
                      language,
                    )}
                  </span>
                </h2>
              </div>
            </div>
            <div
              className='modal-body a-modal-body'
              style={{ paddingTop: '0px', paddingBottom: '24px' }}
            >
              {hasUnmappedErrors &&
                <div>
                  <ul style={{ listStylePosition: 'inside'}}>
                    {unmappedErrors.map((error: React.ReactNode, index: number) => {
                      return (
                        <li key={index}>{error}</li>
                      );
                    })}
                  </ul>
                </div>}
              {!hasUnmappedErrors && (
                // No errors to list, show a generic error message
                <h4 className='a-fontReg' style={{ marginBottom: '12px' }}>
                  <span>
                    {getLanguageFromKey(
                      'form_filler.error_report_description',
                      language,
                    )}
                  </span>
                </h4>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getFormHasErrors = (validations: IValidations): boolean => {
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
