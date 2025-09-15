import React from 'react';
import { useFormData } from 'libs/FormEngineReact';

interface InputComponentProps {
  id: string;
  dataModelBindings?: {
    simpleBinding?: string;
  };
  textResourceBindings?: {
    title?: string;
    description?: string;
  };
  required?: boolean;
  readOnly?: boolean;
}

export function InputComponent({ 
  id, 
  dataModelBindings, 
  textResourceBindings,
  required,
  readOnly 
}: InputComponentProps) {
  const bindingPath = dataModelBindings?.simpleBinding || '';
  const [value, setValue] = useFormData(bindingPath);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {textResourceBindings?.title && (
        <label htmlFor={id} style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          {textResourceBindings.title}
          {required && <span style={{ color: 'red' }}> *</span>}
        </label>
      )}
      {textResourceBindings?.description && (
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
          {textResourceBindings.description}
        </p>
      )}
      <input
        id={id}
        type="text"
        value={value || ''}
        onChange={handleChange}
        disabled={readOnly}
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}