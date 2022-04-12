import * as React from 'react';
import { render } from '@testing-library/react';

import Legend, {  IFormLegendProps } from './Legend';

describe('features > form > components >Legend.tsx', () => {
  let mockId: string;
  let mockLegendText: string;
  let mockHelpText: string;
  let mockDescriptionText: string;
  let mockLanguage: any;
  let requiredMarking: string;
  let optionalMarking: string;

  beforeEach(() => {
    mockId =  'label1';
    mockLegendText = 'label.text';
    mockHelpText = '';
    mockDescriptionText = '';
    requiredMarking = '*';
    optionalMarking = 'valgfri';
    mockLanguage = {
      general: {
        optional: optionalMarking,
      },
      'form_filler': {
        'required_label': requiredMarking,
      },
    };
  });

  test('form/components/Legend.tsx -- should render default', () => {
    const { asFragment } = renderLegendComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  test('form/components/Legend.tsx -- should render required marking when field is required', () => {
    const { queryByText } = renderLegendComponent({ required: true });
    expect(queryByText(requiredMarking)).toBeTruthy();
  });

  test('form/components/Legend.tsx -- should render optional marking when labelSettings.optionalIndicator is true', () => {
    const { queryByTestId } = renderLegendComponent({ labelSettings: { optionalIndicator: true } });
    expect(queryByTestId('optional-label')).toBeTruthy();
  });

  test('form/components/Legend.tsx -- should not render optional marking when required, even if labelSettings.optionalIndicator is true', () => {
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
