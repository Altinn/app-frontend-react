import * as React from 'react';
import { render, screen } from '@testing-library/react';
import AltinnSubstatusPaper from './AltinnSubstatusPaper';
import 'jest';

describe('AltinnSubstatusPaper', () => {
  const label = 'The label';
  const description = 'The description';
  it('should match snapshot', () => {
    const { container } = render(
      <AltinnSubstatusPaper label={label} description={description} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should render label and description', () => {
    render(<AltinnSubstatusPaper label={label} description={description} />);
    expect(screen.getByText(/the label/i)).toBeInTheDocument();
    expect(screen.getByText(/the description/i)).toBeInTheDocument();
  });
});
