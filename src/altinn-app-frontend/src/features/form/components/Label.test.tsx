import * as React from 'react';
import { render } from '@testing-library/react';

import Label, { IFormLabelProps } from './Label';

describe('features > form > components >Label.tsx', () => {
  let mockId: string;
  let mockLabelText: string;
  let mockHelpText: string;
  let mockLanguage: any;
  let requiredMarking: string;
  let optionalMarking: string;

  beforeEach(() => {
    mockId =  'label1';
    mockLabelText = 'label.text';
    mockHelpText = '';
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

  test('form/components/Label.tsx -- should render default', () => {
    const { asFragment } = renderLabelComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  test('form/components/Label.tsx -- should render required marking when field is required', () => {
    const { queryByText } = renderLabelComponent({ required: true });
    expect(queryByText(requiredMarking)).toBeTruthy();
  });

  test('form/components/Label.tsx -- should not render required marking when field is readOnly', () => {
    const { queryByText } = renderLabelComponent({ required: true, readOnly: true });
    expect(queryByText(requiredMarking)).toBeFalsy();
  });

  test('form/components/Label.tsx -- should render optional marking when labelSettings.optionalIndicator is true, and required, readOnly are both false', () => {
    const { queryByText } = renderLabelComponent({ labelSettings: { optionalIndicator: true } });
    expect(queryByText(optionalMarking)).toBeTruthy();
  });

  test('form/components/Label.tsx -- should not render optional marking when required, even if labelSettings.optionalIndicator is true', () => {
    const { queryByText } = renderLabelComponent({ labelSettings: { optionalIndicator: true }, required: true });
    expect(queryByText(optionalMarking)).toBeFalsy();
  });

  test('form/components/Label.tsx -- should not render optional marking when readOnly, even if labelSettings.optionalIndicator is true', () => {
    const { queryByText } = renderLabelComponent({ labelSettings: { optionalIndicator: true }, readOnly: true });
    expect(queryByText(optionalMarking)).toBeFalsy();
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
