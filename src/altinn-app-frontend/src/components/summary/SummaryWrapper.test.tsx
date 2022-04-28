import * as React from 'react';
import { screen, render } from '@testing-library/react';

import SummaryWrapper from './SummaryWrapper';

describe('SummaryWrapper', () => {
const defaultProps = {
  onChangeClick: () => { return },
  changeText: 'some text on a button',
  label: <h3>label text</h3>
}
  test('should render the wrapper with div inside', () => {
    render(<SummaryWrapper {...defaultProps}>
      <div data-testid={'innermost'}>
        <p>Something</p>
      </div>
    </SummaryWrapper>);
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button').innerHTML).toContain('some text on a button');
    expect(screen.getByTestId('innermost')).toBeInTheDocument();
    expect(screen.queryByTestId('has-validation-message')).toBeNull();
  });

  test('should not render change-button', () => {
    render(<SummaryWrapper {...defaultProps} readOnlyComponent>
    </SummaryWrapper>)
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('should add validation message', () => {
    render(<SummaryWrapper {...defaultProps} hasValidationMessages>
    </SummaryWrapper>)
    expect(screen.queryByTestId('has-validation-message')).not.toBeNull();
  });

});
