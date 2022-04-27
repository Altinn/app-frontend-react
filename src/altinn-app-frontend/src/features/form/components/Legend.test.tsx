import * as React from 'react';
import { render } from '@testing-library/react';

import Legend from './Legend';
import type { IFormLegendProps } from './Legend';

describe('features > form > components > Legend.tsx', () => {
  const requiredMarking = '*';
  const optionalMarking = 'Valgfri';

  function renderLegendComponent(props: Partial<IFormLegendProps> = {}) {
    const defaultProps: IFormLegendProps = {
      id: 'label1',
      labelText: 'label.text',
      descriptionText: '',
      helpText: '',
      language: {
        general: {
          optional: optionalMarking,
        },
        'form_filler': {
          'required_label': requiredMarking,
        },
      },
      required: false,
      labelSettings: {}
    };

    return render(<Legend {...defaultProps} {...props} />);
  }

  it('should render legend', () => {
    const { queryByText } = renderLegendComponent();
    expect(queryByText('label.text')).toBeInTheDocument();
  });

  it('should render required marking when field is required', () => {
    const { queryByText } = renderLegendComponent({ required: true });
    expect(queryByText(requiredMarking)).toBeTruthy();
  });

  it('should render optional marking when labelSettings.optionalIndicator is true', () => {
    const { queryByText } = renderLegendComponent({ labelSettings: { optionalIndicator: true } });
    expect(queryByText(`(${optionalMarking})`)).toBeTruthy();
  });

  it('should not render optional marking when required, even if labelSettings.optionalIndicator is true', () => {
    const { queryByText } = renderLegendComponent({ labelSettings: { optionalIndicator: true }, required: true });
    expect(queryByText(`(${optionalMarking})`)).toBeFalsy();
  });
});
