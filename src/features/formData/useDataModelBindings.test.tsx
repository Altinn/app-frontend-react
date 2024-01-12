import React, { useRef } from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { asDecimal, asInt32, useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';

interface TestCase {
  value: string;
  result: number;
}

describe('number converters', () => {
  describe('asDecimal', () => {
    const testCases: TestCase[] = [
      { value: '', result: NaN },
      { value: '1', result: 1 },
      { value: '1 234 456', result: 1234456 },
      { value: '1.', result: NaN },
      { value: '1.1', result: 1.1 },
      { value: '1.1e1', result: 11 },
      { value: '1.1e-1', result: 0.11 },
      { value: '1.1e+1', result: 11 },
      { value: '-1', result: -1 },
      { value: '-1.', result: NaN },
      { value: '-1.1', result: -1.1 },
      { value: '-1.1e1', result: -11 },
      { value: '-1.1e-1', result: -0.11 },
      { value: '-1.1e+1', result: -11 },
      { value: '8e28', result: NaN },
      { value: '-8e28', result: NaN },
      { value: '-', result: NaN },
      { value: '- 15', result: -15 },
      { value: '- 15 13 . 12', result: -1513.12 },
      { value: '.', result: NaN },
      { value: '0.1', result: 0.1 },
      { value: '.1', result: 0.1 },
    ];

    it.each(testCases)('should return $value as $result', ({ value, result }) => {
      const actual = asDecimal(value);
      expect(actual).toEqual(result);
    });
  });

  describe('asInt32', () => {
    const testCases: TestCase[] = [
      { value: '', result: NaN },
      { value: '1', result: 1 },
      { value: '123', result: 123 },
      { value: '1 234 799', result: 1234799 },
      { value: '1.', result: NaN },
      { value: '1e2', result: NaN },
      { value: '1.1', result: NaN },
      { value: '1.1e1', result: NaN },
      { value: '1.1e-1', result: NaN },
      { value: '1.1e+1', result: NaN },
      { value: '-1', result: -1 },
      { value: '-123', result: -123 },
      { value: '-1.', result: NaN },
      { value: '-1.1', result: NaN },
      { value: '-1.1e1', result: NaN },
      { value: '-1.1e-1', result: NaN },
      { value: '-1.1e+1', result: NaN },
      { value: '2147483646', result: 2147483646 },
      { value: '2147483648', result: NaN },
      { value: '-2147483647', result: -2147483647 },
      { value: '-2147483649', result: NaN },
      { value: '-', result: NaN },
      { value: '- 15', result: -15 },
      { value: '- 15 13 . 12', result: NaN },
      { value: '.', result: NaN },
      { value: '0.1', result: NaN },
      { value: '.1', result: NaN },
    ];

    it.each(testCases)('should return $value as $result', ({ value, result }) => {
      const actual = asInt32(value);
      expect(actual).toEqual(result);
    });
  });
});

describe('useDataModelBindings', () => {
  function DummyComponent() {
    const renderCount = useRef(1);
    const { setValues, setValue, isValid, debounce, formData } = useDataModelBindings({
      stringy: 'stringyField',
      decimal: 'decimalField',
      integer: 'integerField',
      boolean: 'booleanField',
    });

    return (
      <>
        <div data-testid='render-count'>{renderCount.current++}</div>
        <div data-testid='value-stringy'>{JSON.stringify(formData.stringy)}</div>
        <div data-testid='value-decimal'>{JSON.stringify(formData.decimal)}</div>
        <div data-testid='value-integer'>{JSON.stringify(formData.integer)}</div>
        <div data-testid='value-boolean'>{JSON.stringify(formData.boolean)}</div>
        <div data-testid='isValid-stringy'>{isValid.stringy ? 'yes' : 'no'}</div>
        <div data-testid='isValid-decimal'>{isValid.decimal ? 'yes' : 'no'}</div>
        <div data-testid='isValid-integer'>{isValid.integer ? 'yes' : 'no'}</div>
        <div data-testid='isValid-boolean'>{isValid.boolean ? 'yes' : 'no'}</div>
        <input
          type='text'
          data-testid='input-stringy'
          value={formData.stringy}
          onChange={(e) => setValue('stringy', e.target.value)}
        />
        <input
          type='text'
          data-testid='input-decimal'
          value={formData.decimal}
          onChange={(e) => setValue('decimal', e.target.value)}
        />
        <input
          type='text'
          data-testid='input-integer'
          value={formData.integer}
          onChange={(e) => setValue('integer', e.target.value)}
        />
        <input
          type='text'
          data-testid='input-boolean'
          value={formData.boolean}
          onChange={(e) => setValue('boolean', e.target.value)}
        />
        <button
          onClick={() =>
            setValues({
              stringy: 'foo bar',
              decimal: '12345.6789',
              integer: '987654321',
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
              decimal: 98765.4321,
              integer: 123456789,
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
            decimalField: { type: 'number' },
            integerField: { type: 'integer' },
            booleanField: { type: 'boolean' },
          },
        }),
      },
    });
  }

  it('should work as expected', async () => {
    const { formDataMethods, mutations } = await render();
    let expectedRenders = 1;
    expect(screen.getByTestId('value-stringy')).toHaveTextContent('""');
    expect(screen.getByTestId('value-decimal')).toHaveTextContent('""');
    expect(screen.getByTestId('value-boolean')).toHaveTextContent('""');
    expect(screen.getByTestId('isValid-stringy')).toHaveTextContent('yes');
    expect(screen.getByTestId('isValid-decimal')).toHaveTextContent('yes');
    expect(screen.getByTestId('isValid-boolean')).toHaveTextContent('yes');
    expect(screen.getByTestId('render-count')).toHaveTextContent(String(expectedRenders));

    const fooBar = 'foo bar';
    await userEvent.type(screen.getByTestId('input-stringy'), fooBar);
    expect(screen.getByTestId('value-stringy')).toHaveTextContent(`"${fooBar}"`);
    expect(screen.getByTestId('isValid-stringy')).toHaveTextContent('yes');

    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      path: 'stringyField',
      newValue: fooBar,
    });
    expect(formDataMethods.setLeafValue).toHaveBeenCalledTimes(fooBar.length);
    expectedRenders += fooBar.length;
    expect(screen.getByTestId('render-count')).toHaveTextContent(String(expectedRenders));
    (formDataMethods.setLeafValue as jest.Mock).mockClear();

    // Now to slightly harder things. Let's try to set a negative decimal value. When first starting typing, the
    // value is invalid, but when the user has typed more than just the minus sign, it should be a valid decimal
    await userEvent.type(screen.getByTestId('input-decimal'), '-');
    expect(screen.getByTestId('value-decimal')).toHaveTextContent(`"-"`);
    expect(screen.getByTestId('isValid-decimal')).toHaveTextContent('no');

    expect(formDataMethods.setLeafValue).toHaveBeenCalledTimes(1);
    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      path: 'decimalField',
      newValue: undefined,
    });

    expectedRenders++;
    expect(screen.getByTestId('render-count')).toHaveTextContent(String(expectedRenders));

    const fullDecimal = '-1.53';
    await userEvent.type(screen.getByTestId('input-decimal'), fullDecimal.slice(1));
    expect(screen.getByTestId('value-decimal')).toHaveTextContent(`"-1.53"`);
    expect(screen.getByTestId('isValid-decimal')).toHaveTextContent('yes');

    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      path: 'decimalField',
      newValue: -1.53,
    });
    expect(formDataMethods.setLeafValue).toHaveBeenCalledTimes(fullDecimal.length);

    expectedRenders += fullDecimal.length - 1;
    expect(screen.getByTestId('render-count')).toHaveTextContent(String(expectedRenders));
    (formDataMethods.setLeafValue as jest.Mock).mockClear();

    // Now to slightly harder things. Let's try to set a negative integer value. When first starting typing, the
    // value is invalid, but when the user has typed more than just the minus sign, it should be a valid integer
    await userEvent.type(screen.getByTestId('input-integer'), '-');
    expect(screen.getByTestId('value-integer')).toHaveTextContent(`"-"`);
    expect(screen.getByTestId('isValid-integer')).toHaveTextContent('no');

    expect(formDataMethods.setLeafValue).toHaveBeenCalledTimes(1);
    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      path: 'integerField',
      newValue: undefined,
    });

    const fullInteger = '-15 3';
    await userEvent.type(screen.getByTestId('input-integer'), fullInteger.slice(1));

    expect(screen.getByTestId('value-integer')).toHaveTextContent(`"-153"`);
    expect(screen.getByTestId('isValid-integer')).toHaveTextContent('yes');

    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      path: 'integerField',
      newValue: -153,
    });

    expect(formDataMethods.setLeafValue).toHaveBeenCalledTimes(fullInteger.length);

    // When we typed the space, we sent a state update (as asserted above), but since the value update did not
    // actually change anything in the data model (but was valid), the component does not re-render.
    expectedRenders += fullInteger.length - 1;
    expect(screen.getByTestId('render-count')).toHaveTextContent(String(expectedRenders));

    (formDataMethods.setLeafValue as jest.Mock).mockClear();

    // At last, type in a boolean value
    await userEvent.type(screen.getByTestId('input-boolean'), 'tr');
    expect(screen.getByTestId('value-boolean')).toHaveTextContent(`"tr"`);
    expect(screen.getByTestId('isValid-boolean')).toHaveTextContent('no');

    await userEvent.type(screen.getByTestId('input-boolean'), 'ue');
    expect(screen.getByTestId('value-boolean')).toHaveTextContent(`"true"`);
    expect(screen.getByTestId('isValid-boolean')).toHaveTextContent('yes');

    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      path: 'booleanField',
      newValue: true,
    });
    expect(formDataMethods.setLeafValue).toHaveBeenCalledTimes(4);

    expectedRenders += 4;
    expect(screen.getByTestId('render-count')).toHaveTextContent(String(expectedRenders));

    // We don't expect debouncing to have happened quite yet, so no data should have been saved
    expect(mutations.doPatchFormData.mock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /debounce/i }));
    expect(mutations.doPatchFormData.mock).toHaveBeenCalledTimes(1);
  });

  it('should load initial values from formData', async () => {
    await render({ formData: { stringyField: 'foo', decimalField: 123, booleanField: true } });
    expect(screen.getByTestId('value-stringy')).toHaveTextContent('"foo"');
    expect(screen.getByTestId('value-decimal')).toHaveTextContent('"123"');
    expect(screen.getByTestId('value-boolean')).toHaveTextContent('"true"');
    expect(screen.getByTestId('render-count')).toHaveTextContent('1');
  });
});
