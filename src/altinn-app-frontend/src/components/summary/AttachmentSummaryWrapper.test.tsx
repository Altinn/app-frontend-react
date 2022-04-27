import * as React from 'react';
import { screen, render } from '@testing-library/react';

import AttachmentSummaryWrapper from './AttachmentSummaryWrapper';

describe('AttachmentSummaryBoilerplate', () => {
const defaultProps = {
  onChangeClick: () => { return },
  changeText: 'some text on a button',
  label: <h3>label text</h3>
}
  test('should render the wrapper with div inside', () => {
    render(<AttachmentSummaryWrapper {...defaultProps}>
      <div data-testid={'innermost'}>
        <p>Something</p>
      </div>
    </AttachmentSummaryWrapper>)
    screen.debug();
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button').innerText).toBe('some text on a button');
    expect(screen.getByTestId('innermost')).toBeInTheDocument();
  });

});
