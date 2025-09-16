import React from 'react';
import { withFormEngine } from 'libs/FormEngineReact/components/FormEngineComponent';
import type { FormEngineComponentContext } from 'libs/FormEngineReact/components/FormEngineComponent';

interface InputComponentProps {
  formEngine: FormEngineComponentContext;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
}

function InputComponentBase({ 
  formEngine,
  placeholder,
  type = 'text',
  className = ''
}: InputComponentProps) {
  const { 
    value, 
    updateValue, 
    errors, 
    isValid, 
    isRequired, 
    isReadOnly, 
    config 
  } = formEngine;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateValue(event.target.value);
  };

  const inputStyles = {
    width: '100%',
    padding: '8px',
    border: `1px solid ${!isValid ? '#d32f2f' : '#ccc'}`,
    borderRadius: '4px',
    backgroundColor: isReadOnly ? '#f5f5f5' : 'white',
    fontSize: '14px',
  };

  const containerStyles = {
    marginBottom: '16px',
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: 'bold' as const,
    fontSize: '14px',
  };

  const descriptionStyles = {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#666',
  };

  const errorStyles = {
    marginTop: '4px',
    fontSize: '12px',
    color: '#d32f2f',
  };

  const helpStyles = {
    marginTop: '4px',
    fontSize: '12px',
    color: '#666',
  };

  return (
    <div style={containerStyles} className={`input-component ${className}`}>
      {/* Label */}
      {config.textResourceBindings?.title && (
        <label htmlFor={config.id} style={labelStyles}>
          {config.textResourceBindings.title}
          {isRequired && <span style={{ color: '#d32f2f' }}> *</span>}
        </label>
      )}

      {/* Description */}
      {config.textResourceBindings?.description && (
        <div style={descriptionStyles}>
          {config.textResourceBindings.description}
        </div>
      )}

      {/* Input field */}
      <input
        id={config.id}
        name={config.id}
        type={type}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        style={inputStyles}
        disabled={isReadOnly}
        aria-invalid={!isValid}
        aria-describedby={[
          errors.length > 0 ? `${config.id}-errors` : '',
          config.textResourceBindings?.help ? `${config.id}-help` : '',
        ].filter(Boolean).join(' ') || undefined}
        aria-required={isRequired}
      />

      {/* Error messages */}
      {errors.length > 0 && (
        <div 
          id={`${config.id}-errors`}
          style={errorStyles}
          role="alert"
          aria-live="polite"
        >
          {errors.map((error, index) => (
            <div key={index}>
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      {config.textResourceBindings?.help && (
        <div 
          id={`${config.id}-help`}
          style={helpStyles}
        >
          {config.textResourceBindings.help}
        </div>
      )}
    </div>
  );
}

// Export wrapped component
export const InputComponent = withFormEngine(InputComponentBase);