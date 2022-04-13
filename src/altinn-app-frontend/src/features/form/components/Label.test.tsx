import * as React from 'react';
import { render } from '@testing-library/react';

import Label, { IFormLabelProps } from './Label';

describe('features > form > components >Label.tsx', () => {
  const mockId =  'label1';
  const mockLabelText = 'label.text';
  const mockHelpText = '';
  const requiredMarking = '*';
  const optionalMarking = 'valgfri';
  const mockLanguage = {
    general: {
      optional: optionalMarking,
    },
    'form_filler': {
      'required_label': requiredMarking,
    },
  };

  it('should render default', () => {
    const { asFragment } = renderLabelComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render required marking when field is required', () => {
    const { queryByText } = renderLabelComponent({ required: true });
    expect(queryByText(requiredMarking)).toBeTruthy();
  });

  it('should not render required marking when field is readOnly', () => {
    const { queryByText } = renderLabelComponent({ required: true, readOnly: true });
    expect(queryByText(requiredMarking)).toBeFalsy();
  });

  it('should render optional marking when labelSettings.optionalIndicator is true, and required, readOnly are both false', () => {
    const { queryByTestId } = renderLabelComponent({ labelSettings: { optionalIndicator: true } });
    expect(queryByTestId('optional-label')).toBeTruthy();
  });

  it('should not render optional marking when required, even if labelSettings.optionalIndicator is true', () => {
    const { queryByTestId } = renderLabelComponent({ labelSettings: { optionalIndicator: true }, required: true });
    expect(queryByTestId('optional-label')).toBeFalsy();
  });

  it('should not render optional marking when readOnly, even if labelSettings.optionalIndicator is true', () => {
    const { queryByTestId } = renderLabelComponent({ labelSettings: { optionalIndicator: true }, readOnly: true });
    expect(queryByTestId('optional-label')).toBeFalsy();
  });

  function renderLabelComponent(props: Partial<IFormLabelProps> = {}) {
    const defaultProps: IFormLabelProps = {
      id: mockId,
      labelText: mockLabelText,
      helpText: mockHelpText,
      language: mockLanguage,
      readOnly: false,
      required: false,
      labelSettings: {}
    };

    return render(<Label {...defaultProps} {...props} />);
  }
});
