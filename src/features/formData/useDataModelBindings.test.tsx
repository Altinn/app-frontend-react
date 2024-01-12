import React, { useRef } from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  canBeParsedToDecimal,
  canBeParsedToInteger,
  useDataModelBindings,
} from 'src/features/formData/useDataModelBindings';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';

interface TestCase {
  value: string;
  valid: boolean;
  result: number;
}

describe('canBeParsedToDecimal', () => {
  const testCases: TestCase[] = [
    { value: '', valid: true, result: NaN },
    { value: '1', valid: true, result: 1 },
    { value: '1.', valid: true, result: 1 },
    { value: '1.1', valid: true, result: 1.1 },
    { value: '1.1e1', valid: true, result: 11 },
    { value: '1.1e-1', valid: true, result: 0.11 },
    { value: '1.1e+1', valid: true, result: 11 },
    { value: '-1', valid: true, result: -1 },
    { value: '-1.', valid: true, result: -1 },
    { value: '-1.1', valid: true, result: -1.1 },
    { value: '-1.1e1', valid: true, result: -11 },
    { value: '-1.1e-1', valid: true, result: -0.11 },
    { value: '-1.1e+1', valid: true, result: -11 },
    { value: '8e28', valid: false, result: 8e28 },
    { value: '-8e28', valid: false, result: -8e28 },
    { value: '-', valid: false, result: NaN },
    { value: '.', valid: false, result: NaN },
    { value: '0.1', valid: true, result: 0.1 },
    { value: '.1', valid: true, result: 0.1 },
  ];

  it.each(testCases)('should return $value as $valid (and parse as $result)', ({ value, valid, result }) => {
    expect(canBeParsedToDecimal(value)).toEqual(valid);
    expect(parseFloat(value)).toEqual(result);
  });
});

describe('canBeParsedToInteger', () => {
  const testCases: TestCase[] = [
    { value: '', valid: true, result: NaN },
    { value: '1', valid: true, result: 1 },
    { value: '1.', valid: false, result: 1 },
    { value: '1.1', valid: false, result: 1 },
    { value: '1.1e1', valid: false, result: 1 },
    { value: '1.1e-1', valid: false, result: 1 },
    { value: '1.1e+1', valid: false, result: 1 },
    { value: '-1', valid: true, result: -1 },
    { value: '-1.', valid: false, result: -1 },
    { value: '-1.1', valid: false, result: -1 },
    { value: '-1.1e1', valid: false, result: -1 },
    { value: '-1.1e-1', valid: false, result: -1 },
    { value: '-1.1e+1', valid: false, result: -1 },
    { value: '8e28', valid: false, result: 8 },
    { value: '-8e28', valid: false, result: -8 },
    { value: '-', valid: false, result: NaN },
    { value: '.', valid: false, result: NaN },
    { value: '0.1', valid: false, result: 0 },
    { value: '.1', valid: false, result: NaN },
  ];

  it.each(testCases)('should return $value as $valid (and parse as $result)', ({ value, valid, result }) => {
    expect(canBeParsedToInteger(value)).toEqual(valid);
    expect(parseInt(value)).toEqual(result);
  });
});

describe('useDataModelBindings', () => {
  function DummyComponent() {
    const renderCount = useRef(1);
    const { setValues, setValue, isValid, debounce, formData } = useDataModelBindings({
      stringy: 'stringyField',
      numeric: 'numericField',
      boolean: 'booleanField',
    });

    return (
      <>
        <div data-testid='render-count'>{renderCount.current++}</div>
        <div data-testid='value-stringy'>{JSON.stringify(formData.stringy)}</div>
        <div data-testid='value-numeric'>{JSON.stringify(formData.numeric)}</div>
        <div data-testid='value-boolean'>{JSON.stringify(formData.boolean)}</div>
        <div data-testid='isValid-stringy'>{isValid.stringy ? 'yes' : 'no'}</div>
        <div data-testid='isValid-numeric'>{isValid.numeric ? 'yes' : 'no'}</div>
        <div data-testid='isValid-boolean'>{isValid.boolean ? 'yes' : 'no'}</div>
        <input
          type='text'
          data-testid='input-stringy'
          value={formData.stringy}
          onChange={(e) => setValue('stringy', e.target.value)}
        />
        <input
          type='text'
          data-testid='input-numeric'
          value={formData.numeric}
          onChange={(e) => setValue('numeric', e.target.value)}
        />
        <button
          onClick={() =>
            setValues({
              stringy: 'foo bar',
              numeric: '123456789',
              boolean: 'true',
            })
          }
        >
          Set multiple values at once, using strings
        </button>
        <button
          onClick={() =>
            setValues({
              stringy: 'hello world',
              numeric: 987654321,
              boolean: false,
            })
          }
        >
          Set multiple values at once, using real types
        </button>
        <button onClick={() => debounce()}>Debounce</button>
      </>
    );
  }

  async function render({ formData = {} }: { formData?: object } = {}) {
    return await renderWithInstanceAndLayout({
      renderer: () => <DummyComponent />,
      queries: {
        fetchFormData: async () => formData,
        fetchDataModelSchema: async () => ({
          type: 'object',
          properties: {
            stringyField: { type: 'string' },
            numericField: { type: 'number' },
            booleanField: { type: 'boolean' },
          },
        }),
      },
    });
  }

  it('should work as expected', async () => {
    const { formDataMethods, mutations } = await render();
    expect(screen.getByTestId('value-stringy')).toHaveTextContent('""');
    expect(screen.getByTestId('value-numeric')).toHaveTextContent('""');
    expect(screen.getByTestId('value-boolean')).toHaveTextContent('""');
    expect(screen.getByTestId('isValid-stringy')).toHaveTextContent('yes');
    expect(screen.getByTestId('isValid-numeric')).toHaveTextContent('yes');
    expect(screen.getByTestId('isValid-boolean')).toHaveTextContent('yes');
    expect(screen.getByTestId('render-count')).toHaveTextContent('1');

    const fooBar = 'foo bar';
    await userEvent.type(screen.getByTestId('input-stringy'), fooBar);
    expect(screen.getByTestId('value-stringy')).toHaveTextContent(`"${fooBar}"`);
    expect(screen.getByTestId('isValid-stringy')).toHaveTextContent('yes');

    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      path: 'stringyField',
      newValue: fooBar,
    });
    expect(formDataMethods.setLeafValue).toHaveBeenCalledTimes(fooBar.length);
    expect(screen.getByTestId('render-count')).toHaveTextContent(String(1 + fooBar.length));
  });

  it('should load initial values from formData', async () => {
    await render({ formData: { stringyField: 'foo', numericField: 123, booleanField: true } });
    expect(screen.getByTestId('value-stringy')).toHaveTextContent('"foo"');
    expect(screen.getByTestId('value-numeric')).toHaveTextContent('"123"');
    expect(screen.getByTestId('value-boolean')).toHaveTextContent('"true"');
    expect(screen.getByTestId('render-count')).toHaveTextContent('1');
  });
});
