import * as React from 'react';
import type { IComponentProps } from '..';

import '../../styles/shared.css';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';

export function TextAreaComponent({
  id,
  formData,
  readOnly,
  isValid,
  handleDataChange,
  textResourceBindings,
}: IComponentProps) {
  const suppliedValue = formData?.simpleBinding;
  const [value, setValue] = useDelayedSavedState(
    handleDataChange,
    suppliedValue ?? '',
  );

  React.useEffect(() => {
    setValue(suppliedValue);
  }, [suppliedValue]);

  return (
    <div className='a-form-group-items input-group p-0'>
      <textarea
        id={id}
        onBlur={(e) => setValue(e.target.value, true)}
        onChange={(e) => setValue(e.target.value)}
        readOnly={readOnly}
        style={{ resize: 'none' }} // This is prone to change soon, implemented inline until then. See issue #1116
        className={
          (isValid
            ? 'form-control a-textarea '
            : 'form-control a-textarea validation-error') +
          (readOnly ? ' disabled' : '')
        }
        value={value}
        data-testid={id}
        aria-describedby={
          textResourceBindings ? `description-${id}` : undefined
        }
      />
    </div>
  );
}
