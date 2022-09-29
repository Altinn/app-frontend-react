import React from 'react';

import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { MultipleSelect } from 'src/components/base/MultipleSelect';
import type { IMultipleSelectProps } from 'src/components/base/MultipleSelect';

const render = (props: Partial<IMultipleSelectProps> = {}) => {
  const allProps: IMultipleSelectProps = {
    ...({} as IMultipleSelectProps),
    id: 'id',
    formData: {},
    handleDataChange: jest.fn(),
    getTextResource: (key: string) => key,
    isValid: true,
    dataModelBindings: {},
    componentValidations: {},
    language: {},
    options: [
      { value: 'value1', label: 'label1' },
      { value: 'value2', label: 'label2' },
      { value: 'value3', label: 'label3' },
    ],
    readOnly: false,
    required: false,
    textResourceBindings: {},
    ...props,
  };

  return rtlRender(<MultipleSelect {...allProps} />);
};

describe('MultipleSelect', () => {
  /*
  it('should return a comma separated list of selected values on change', async () => {
    const handleDataChange = jest.fn();
    render({
      handleDataChange,
    });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByText('label1'));
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByText('label2'));
    expect(handleDataChange).toBeCalledWith('value1,value2');
  });
  */

  it('should display correct options as selected when supplied with a comma separated form data', () => {
    render({
      formData: { simpleBinding: 'value1,value3' },
    });
    expect(screen.getByText('label1')).toBeInTheDocument();
    expect(screen.queryByText('label2')).not.toBeInTheDocument();
    expect(screen.getByText('label3')).toBeInTheDocument();
  });

  it('should remove item from form data on delete', () => {
    const handleDataChange = jest.fn();
    render({
      handleDataChange,
      formData: { simpleBinding: 'value1,value2,value3' },
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: /remove label2/i,
      }),
    );
    expect(handleDataChange).toBeCalledWith('value1,value3');
  });
});
