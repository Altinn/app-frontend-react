import * as React from 'react';

import { getInitialStateMock } from '../../../__mocks__/mocks';
import type { IRuntimeState } from 'src/types';
import type { IValidationState } from 'src/features/form/validation/validationSlice';

import { getParsedLanguageFromText } from 'altinn-shared/utils';
import ErrorReport from './ErrorReport';
import { renderWithProviders } from '../../../testUtils';
import { screen } from '@testing-library/react';


describe('components > ErrorReport.tsx', () => {
  const render = (preloadedState: IRuntimeState) => {
    return renderWithProviders(<ErrorReport />, { preloadedState });
  };

  it('should render generic error message by default', () => {
    const mockValidationState: IValidationState = {
      validations: {
        page1: {
          someComponent: {
            simpleBinding: {
              errors: [getParsedLanguageFromText('some error')],
            },
          },
        },
      },
      invalidDataTypes: [],
      currentSingleFieldValidation: null,
      error: null,
    };
    const initialState = getInitialStateMock({
      formValidations: mockValidationState,
    });
    render(initialState);
    const genericErrorText =
      initialState.language.language.form_filler['error_report_description'];
    expect(screen.getByText(genericErrorText)).toBeInTheDocument();
  });

  it('should list unmapped errors if present and hide generic error message', () => {
    const mockValidationState: IValidationState = {
      validations: {
        unmapped: {
          // unmapped layout
          unmapped: {
            // unmapped component
            unmapped: {
              // unmapped data binding
              errors: [getParsedLanguageFromText('some unmapped error')],
            },
          },
        },
      },
      invalidDataTypes: [],
      currentSingleFieldValidation: null,
      error: null,
    };
    const initialState = getInitialStateMock({
      formValidations: mockValidationState,
    });
    render(initialState);
    const genericErrorText =
      initialState.language.language.form_filler['error_report_description'];
    expect(screen.queryByText(genericErrorText)).toBeNull();
    expect(screen.getByText('some unmapped error')).toBeInTheDocument();
  });
});
