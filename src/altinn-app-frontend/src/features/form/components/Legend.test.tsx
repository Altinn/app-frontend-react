import * as React from 'react';
import { render } from '@testing-library/react';

import Legend, {  IFormLegendProps } from './Legend';

describe('features > form > components > Legend.tsx', () => {
  const mockId =  'label1';
  const mockLegendText = 'label.text';
  const mockHelpText = '';
  const mockDescriptionText = '';
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
    const { asFragment } = renderLegendComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render required marking when field is required', () => {
    const { queryByText } = renderLegendComponent({ required: true });
    expect(queryByText(requiredMarking)).toBeTruthy();
  });

  it('should render optional marking when labelSettings.optionalIndicator is true', () => {
    const { queryByTestId } = renderLegendComponent({ labelSettings: { optionalIndicator: true } });
    expect(queryByTestId('optional-label')).toBeTruthy();
  });

  it('should not render optional marking when required, even if labelSettings.optionalIndicator is true', () => {
    const { queryByTestId } = renderLegendComponent({ labelSettings: { optionalIndicator: true }, required: true });
    expect(queryByTestId('optional-label')).toBeFalsy();
  });

  function renderLegendComponent(props: Partial<IFormLegendProps> = {}) {
    const defaultProps: IFormLegendProps = {
      id: mockId,
      labelText: mockLegendText,
      descriptionText: mockDescriptionText,
      helpText: mockHelpText,
      language: mockLanguage,
      required: false,
      labelSettings: {}
    };

    return render(<Legend {...defaultProps} {...props} />);
  }
});
