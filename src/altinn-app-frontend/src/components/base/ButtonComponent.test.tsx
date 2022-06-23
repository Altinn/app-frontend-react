import * as React from 'react';
import { renderWithProviders } from '../../../testUtils';
import { screen } from '@testing-library/react';

import type { IComponentProps } from 'src/components';

import { ButtonComponent } from './ButtonComponent';
import { getInitialStateMock } from '../../../__mocks__/mocks';

describe('components/base/ButtonComponent.tsx', () => {
  let mockText: string;
  let formDataCount: number;
  let mockHandleDataChange: (value: any) => void;
  let mockDisabled: boolean;
  let mockLanguage;
  let globInitialState;
  beforeAll(() => {
    globInitialState = getInitialStateMock();
    mockHandleDataChange = jest.fn();
    mockDisabled = false;
    mockText = 'Submit form';
    formDataCount = 0;
    mockLanguage = {};
  });

  it('should render button when isSubmitting is false', () => {
    const preloadedState = {
      ...globInitialState,
    };
    preloadedState.formData.isSubmitting = false;
    preloadedState.formLayout.uiConfig.autoSave = true;
    renderWithProviders(
      <ButtonComponent
        text={mockText}
        handleDataChange={mockHandleDataChange}
        disabled={mockDisabled}
        formDataCount={formDataCount}
        language={mockLanguage}
        {...({} as IComponentProps)}
      />,
      { preloadedState },
    );
    const submitBtn = screen.getByRole('button');
    expect(submitBtn.textContent).toEqual(mockText);
  });

  it('should render loader when isSubmitting is true', () => {
    const preloadedState = {
      ...globInitialState,
    };
    preloadedState.formData.isSubmitting = true;
    preloadedState.formLayout.uiConfig.autoSave = true;

    renderWithProviders(
      <ButtonComponent
        text={mockText}
        handleDataChange={mockHandleDataChange}
        disabled={mockDisabled}
        formDataCount={formDataCount}
        language={mockLanguage}
        {...({} as IComponentProps)}
      />,
      { preloadedState },
    );
    expect(screen.getByText('general.loading')).toBeInTheDocument();
  });
});
