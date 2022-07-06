import * as React from 'react';
import { TextField } from '@altinn/altinn-design-system';
import type { ReadOnlyVariant } from '@altinn/altinn-design-system';
import type { NumberFormatProps } from 'react-number-format';
import type { IComponentProps } from '..';
import '../../styles/shared.css';

export interface IInputFormatting {
  number?: NumberFormatProps;
  align?: 'right' | 'center' | 'left';
}

export interface IInputProps extends Omit<IComponentProps, 'readOnly'> {
  formatting?: IInputFormatting;
  readOnly?: boolean | ReadOnlyVariant;
}

export function InputComponent({
  id,
  readOnly,
  required,
  isValid,
  formData,
  formatting,
  handleDataChange,
  textResourceBindings,
}: IInputProps) {
  const [value, setValue] = React.useState(formData?.simpleBinding ?? '');

  React.useEffect(() => {
    setValue(formData?.simpleBinding ?? '');
  }, [formData?.simpleBinding]);

  const onDataChanged = (e: any) => {
    setValue(e.target.value);
  };

  const onDataChangeSubmit = () => {
    handleDataChange(value);
  };

  return (
    <TextField
      key={`input_${id}`}
      id={id}
      onBlur={onDataChangeSubmit}
      onChange={onDataChanged}
      readOnly={readOnly}
      isValid={isValid}
      required={required}
      value={value}
      aria-describedby={
        textResourceBindings?.description ? `description-${id}` : undefined
      }
      formatting={formatting}
    />
  );
}
