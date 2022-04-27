import * as React from 'react';
import { render } from '@testing-library/react';

import Label from './Label';
import type { IFormLabelProps } from './Label';

describe('features > form > components >Label.tsx', () => {
  const requiredMarking = '*';
  const optionalMarking = 'Valgfri';

  function renderLabelComponent(props: Partial<IFormLabelProps> = {}) {
    const defaultProps: IFormLabelProps = {
      id: 'label1',
      labelText: 'label.text',
      helpText: '',
      language: {
        general: {
          optional: optionalMarking,
        },
        'form_filler': {
          'required_label': requiredMarking,
        },
      },
      readOnly: false,
      required: false,
      labelSettings: {
        optionalIndicator: true,
      }
    };

    return render(<Label {...defaultProps} {...props} />);
  }

  it('should render label', () => {
    const { queryByText } = renderLabelComponent();
    expect(queryByText('label.text')).toBeInTheDocument();
  })

  it('should render required marking when field is required', () => {
    const { queryByText } = renderLabelComponent({ required: true });
    expect(queryByText(requiredMarking)).toBeTruthy();
  });

  it('should not render required marking when field is readOnly', () => {
    const { queryByText } = renderLabelComponent({ required: true, readOnly: true });
    expect(queryByText(requiredMarking)).toBeFalsy();
  });

  it('should render optional marking when labelSettings.optionalIndicator is true, and required, readOnly are both false', () => {
    const { queryByText } = renderLabelComponent({ labelSettings: { optionalIndicator: true } });
    expect(queryByText(`(${optionalMarking})`)).toBeTruthy();
  });

  it('should not render optional marking when required, even if labelSettings.optionalIndicator is true', () => {
    const { queryByText } = renderLabelComponent({ labelSettings: { optionalIndicator: true }, required: true });
    expect(queryByText(` (${optionalMarking})`)).toBeFalsy();
  });

  it('should not render optional marking when readOnly, even if labelSettings.optionalIndicator is true', () => {
    const { queryByText } = renderLabelComponent({ labelSettings: { optionalIndicator: true }, readOnly: true });
    expect(queryByText(` (${optionalMarking})`)).toBeFalsy();
  });
});
