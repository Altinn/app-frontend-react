import * as React from 'react';
import { screen, render } from '@testing-library/react';

import InputSummaryBoilerplate from './InputSummaryBoilerplate';

describe('InputSummaryBoilerplate', () => {
  test('should render the wrapper with div inside', () => {
    render(
      <InputSummaryBoilerplate formData={null} setDisplayData={() => ({})}>
        <div data-testid={'innermost'}>
          <p>Something</p>
        </div>
      </InputSummaryBoilerplate>,
    );
    expect(screen.getByTestId('innermost')).toBeInTheDocument();
  });
  test('should change the displayData when formData is changed', async () => {
    let displayData = null;
    const setDisplayData = v => displayData = v;
    render(
      <InputSummaryBoilerplate
        formData={null}
        setDisplayData={setDisplayData}
      />,
    );
    expect(displayData).toBeNull();
    render(
      <InputSummaryBoilerplate
        formData={{ value: 'some value in an object' }}
        setDisplayData={setDisplayData}
      />,
    );
    expect(displayData).toBe('some value in an object');
    render(
      <InputSummaryBoilerplate
        formData={['values', 'in', 'an', 'array']}
        setDisplayData={setDisplayData}
      />,
    );
    expect(displayData).toBe('values in an array');
    render(
      <InputSummaryBoilerplate
        formData={'single value'}
        setDisplayData={setDisplayData}
      />,
    );
    expect(displayData).toBe('single value');
  });
});
