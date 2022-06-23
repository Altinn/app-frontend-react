import * as React from 'react';
import { TextAreaComponent } from './TextAreaComponent';
import { render, screen, fireEvent } from '@testing-library/react';
import type { IComponentProps } from 'src/components';

describe('TextAreaComponent.tsx', () => {
  const mockId = 'mock-id';
  const mockHandleDataChange: (value: any) => void = jest.fn();
  const mockIsValid = true;
  const mockReadOnly = false;
  const mockFormData = {};

  it('should set formdata on change', () => {
    const onDataChanged = jest.fn();
    renderTextAreaComponent({
      handleDataChange: onDataChanged,
    });
    const textAreaComponent = screen.getByTestId(mockId);
    expect(textAreaComponent).toHaveValue('');
    fireEvent.change(textAreaComponent, { target: { value: 'Test123' } });
    expect(textAreaComponent).toHaveValue('Test123');
  });

  it('should render editable component when readOnly is false', () => {
    render(
      <TextAreaComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        isValid={mockIsValid}
        readOnly={mockReadOnly}
        {...({} as IComponentProps)}
      />,
    );
    (document.getElementById(mockId) as HTMLTextAreaElement).value =
      'something';
    expect(screen.getByDisplayValue('something')).not.toHaveClass('disabled');
    expect(screen.getByDisplayValue('something')).not.toHaveAttribute(
      'readOnly',
    );
  });

  it('should render un-editable component when readOnly is true', () => {
    render(
      <TextAreaComponent
        id={mockId}
        formData={mockFormData}
        handleDataChange={mockHandleDataChange}
        isValid={mockIsValid}
        readOnly={true}
        {...({} as IComponentProps)}
      />,
    );
    (document.getElementById(mockId) as HTMLTextAreaElement).value =
      'something';
    expect(screen.getByDisplayValue('something')).toHaveClass('disabled');
    expect(screen.getByDisplayValue('something')).toHaveAttribute('readOnly');
  });

  it('should have aria-describedby if textResourceBindings.description is not present', () => {
    renderTextAreaComponent({
      textResourceBindings: { description: 'description' },
    });
    const inputComponent = screen.getByTestId(mockId);
    expect(inputComponent).toHaveAttribute(
      'aria-describedby',
      'description-mock-id',
    );
  });

  it('should not have aria-describedby if textResourceBindings.description is not present', () => {
    renderTextAreaComponent();
    const inputComponent = screen.getByTestId(mockId);
    expect(inputComponent).not.toHaveAttribute('aria-describedby');
  });

  function renderTextAreaComponent(props: Partial<IComponentProps> = {}) {
    const defaultProps = {
      id: mockId,
      formData: mockFormData,
      handleDataChange: mockHandleDataChange,
      isValid: mockIsValid,
      readOnly: mockReadOnly,
    } as IComponentProps;

    render(<TextAreaComponent {...defaultProps} {...props} />);
  }
});
