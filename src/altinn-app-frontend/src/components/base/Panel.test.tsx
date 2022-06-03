import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import { getVariant, PanelVariant, Panel } from './Panel';

describe('Panel', () => {
  it('should show icon when showIcon is true', () => {
    render({ showIcon: true });
    expect(screen.getByTestId('panel-icon-info')).toBeInTheDocument();
  });

  it('should not show icon when showIcon is false', () => {
    render({ showIcon: false });
    expect(screen.queryByTestId('panel-icon-info')).not.toBeInTheDocument();
  });

  describe('getVariant', () => {
    it('should return correctly mapped variant', () => {
      expect(getVariant({ variant: 'info' })).toBe(PanelVariant.Info);
      expect(getVariant({ variant: 'success' })).toBe(PanelVariant.Success);
      expect(getVariant({ variant: 'warning' })).toBe(PanelVariant.Warning);
    });

    it('should return PanelVariant.Info when no variant is passed', () => {
      expect(getVariant()).toBe(PanelVariant.Info);
    });
  });
});

const render = (props) => {
  const allProps = {
    handleDataChange: jest.fn(),
    handleFocusUpdate: jest.fn(),
    getTextResource: jest.fn(),
    getTextResourceAsString: jest.fn(),
    formData: {},
    isValid: true,
    language: {},
    shouldFocus: false,
    text: '',
    textResourceBindings: {},
    ...props,
  };
  rtlRender(<Panel {...allProps} />);
};
