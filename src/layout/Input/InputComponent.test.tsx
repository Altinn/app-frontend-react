import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { defaultDataTypeMock } from 'src/__mocks__/getLayoutSetsMock';
import { getDescriptionId } from 'src/components/label/Label';
import { InputComponent } from 'src/layout/Input/InputComponent';
import { renderGenericComponentTest } from 'src/test/renderWithProviders';
import type { RenderGenericComponentTestProps } from 'src/test/renderWithProviders';

describe('InputComponent', () => {
  it('should correct value with no form data provided', async () => {
    await render();
    const inputComponent = screen.getByRole('textbox');

    expect(inputComponent).toHaveValue('');
  });

  it('should have correct value with specified form data', async () => {
    await render({
      queries: {
        fetchFormData: () => Promise.resolve({ some: { field: 'some value' } }),
      },
    });
    const inputComponent = screen.getByRole('textbox') as HTMLInputElement;

    expect(inputComponent.value).toEqual('some value');
  });

  it('should have correct form data after user types in field', async () => {
    const typedValue = 'banana';
    await render();
    const inputComponent = screen.getByRole('textbox');

    await userEvent.type(inputComponent, typedValue);

    expect(inputComponent).toHaveValue(typedValue);
  });

  it('should call setLeafValue function after data change', async () => {
    const typedValue = 'test input';
    const { formDataMethods } = await render();
    const inputComponent = screen.getByRole('textbox');

    await userEvent.type(inputComponent, typedValue);

    expect(inputComponent).toHaveValue(typedValue);
    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      reference: { field: 'some.field', dataType: defaultDataTypeMock },
      newValue: typedValue,
    });
    expect(inputComponent).toHaveValue(typedValue);
  });

  it('should render input with formatted number when this is specified', async () => {
    const inputValuePlainText = '123456';
    const inputValueFormatted = '$123,456';
    const typedValue = '789';
    const finalValuePlainText = `${inputValuePlainText}${typedValue}`;
    const finalValueFormatted = '$123,456,789';
    const { formDataMethods } = await render({
      component: {
        formatting: {
          number: {
            thousandSeparator: true,
            prefix: '$',
          },
        },
      },
      queries: {
        fetchFormData: () => Promise.resolve({ some: { field: inputValuePlainText } }),
      },
    });
    const inputComponent = screen.getByRole('textbox');
    expect(inputComponent).toHaveValue(inputValueFormatted);

    await userEvent.type(inputComponent, typedValue);
    await userEvent.tab();

    expect(inputComponent).toHaveValue(finalValueFormatted);
    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      reference: { field: 'some.field', dataType: defaultDataTypeMock },
      newValue: finalValuePlainText,
    });
  });

  it('should show aria-describedby if textResourceBindings.description is present', async () => {
    await render({
      component: {
        textResourceBindings: {
          description: 'description',
        },
      },
    });

    const inputComponent = screen.getByRole('textbox');
    expect(inputComponent.getAttribute('aria-describedby')).toContain(getDescriptionId('mock-id'));
  });

  it('should not show aria-describedby if textResourceBindings.description is not present', async () => {
    await render();
    const inputComponent = screen.getByRole('textbox');

    expect(inputComponent).not.toHaveAttribute('aria-describedby');
  });

  it('should allow decimal separators specified in allowedDecimalSeparators when typing', async () => {
    const typedValue = '11.1';
    const formattedValue = '11,1';
    const { formDataMethods } = await render({
      component: {
        formatting: {
          number: {
            allowedDecimalSeparators: [',', '.'],
            decimalSeparator: ',',
          },
        },
      },
    });
    const inputComponent = screen.getByRole('textbox');
    await userEvent.type(inputComponent, typedValue);
    expect(inputComponent).toHaveValue(formattedValue);
    expect(formDataMethods.setLeafValue).toHaveBeenCalledWith({
      reference: { field: 'some.field', dataType: defaultDataTypeMock },
      newValue: typedValue,
    });
    expect(inputComponent).toHaveValue(formattedValue);
  });

  it('should prevent pasting when readOnly is true', async () => {
    const initialValue = 'initial value';
    await render({
      component: {
        readOnly: true,
      },
      queries: {
        fetchFormData: () => Promise.resolve({ some: { field: initialValue } }),
      },
    });

    const inputComponent = screen.getByRole('textbox') as HTMLInputElement;
    expect(inputComponent).toHaveValue(initialValue);

    await userEvent.click(inputComponent);

    await userEvent.paste('pasted text');

    expect(inputComponent).toHaveValue(initialValue);
  });

  const render = async ({ component, ...rest }: Partial<RenderGenericComponentTestProps<'Input'>> = {}) =>
    await renderGenericComponentTest({
      type: 'Input',
      renderer: (props) => <InputComponent {...props} />,
      component: {
        id: 'mock-id',
        required: false,
        dataModelBindings: {
          simpleBinding: { dataType: defaultDataTypeMock, field: 'some.field' },
        },
        ...component,
      },
      ...rest,
    });
});
