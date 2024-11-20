import React, { useEffect, useState } from 'react';

import { Radio, Textfield } from '@digdir/designsystemet-react';
import { isValid, parseISO } from 'date-fns';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

export type FormDataValue = string | number | boolean | null | FormDataValue[] | { [key: string]: FormDataValue };

export interface FormDataObject {
  [key: string]: FormDataValue;
}

export interface DynamicFormProps {
  schema: JSONSchema7;
  onChange: (data: FormDataObject) => void;
  initialData?: FormDataObject; // Added to receive existing item
  locale?: string;
}

export function DynamicForm({ schema, onChange, initialData }: DynamicFormProps) {
  const [formData, setFormData] = useState<FormDataObject>(initialData || {});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (key: string, value: FormDataValue) => {
    const newData = { ...formData, [key]: value };
    onChange(newData);
  };

  const renderFields = (currentSchema: JSONSchema7) => {
    if (currentSchema.type === 'object' && currentSchema.properties) {
      return Object.keys(currentSchema.properties).map((key) => (
        <FieldRenderer
          key={key}
          fieldKey={key}
          fieldSchema={currentSchema.properties![key]}
          formData={formData}
          handleChange={handleChange}
          schema={schema}
          renderFields={renderFields}
        />
      ));
    }
    return null;
  };

  return <form>{renderFields(schema)}</form>;
}

interface Component {
  type: string;
  options: { label: string; value: string }[];
}

interface FieldRendererProps {
  rowIndex?: number;
  fieldKey: string;
  fieldSchema: JSONSchema7Definition;
  formData: FormDataObject;
  handleChange: (key: string, value: FormDataValue) => void;
  schema: JSONSchema7;
  component?: Component;
  renderFields?: (currentSchema: JSONSchema7) => React.ReactNode | null;
}

const isValidDate = (dateString: string) => {
  const parsedValue = parseISO(dateString);
  return isValid(parsedValue);
};

export function FieldRenderer({
  rowIndex,
  fieldKey,
  fieldSchema,
  formData,
  handleChange,
  schema,
  component,
  renderFields,
}: FieldRendererProps) {
  if (typeof fieldSchema === 'boolean') {
    return null;
  } else {
    const { type, format, enum: enumOptions } = fieldSchema;
    const renderType = component?.type || type;
    const label = fieldSchema.title || fieldKey;
    const required = schema.required?.includes(fieldKey);

    if (enumOptions) {
      return (
        <div key={fieldKey}>
          <label>{label}</label>
          <select
            value={(formData[fieldKey] as string | number | undefined) || ''}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            required={required}
          >
            <option
              value=''
              disabled
            >
              Select an option
            </option>
            {enumOptions.map((option) => (
              <option
                key={String(option)}
                value={String(option)}
              >
                {String(option)}
              </option>
            ))}
          </select>
        </div>
      );
    }

    switch (renderType) {
      case 'string':
        if (format === 'date' || isValidDate(formData[fieldKey] as string)) {
          return (
            <Textfield
              description=''
              error=''
              size='sm'
              required={required}
              value={(formData[fieldKey] as string) || ''}
              onChange={(e) => handleChange(fieldKey, e.target.value)}
              type={'date'}
            />
          );
        }

        return (
          <div
            key={fieldKey}
            style={{ marginBottom: '10px' }}
          >
            <Textfield
              description=''
              error=''
              label={label}
              size='sm'
              required={required}
              value={(formData[fieldKey] as string) || ''}
              onChange={(e) => handleChange(fieldKey, e.target.value)}
            />
          </div>
        );
      case 'number':
      case 'integer':
        return (
          <div
            key={fieldKey}
            style={{ marginBottom: '10px' }}
          >
            <Textfield
              description=''
              error=''
              label={label}
              size='sm'
              type='number'
              required={required}
              value={formData[fieldKey] !== undefined ? String(formData[fieldKey]) : ''}
              onChange={(e) => {
                if (e.target.value) {
                  handleChange(fieldKey, Number(e.target.value));
                }
              }}
            />
          </div>
        );
      case 'boolean':
        return (
          <div key={fieldKey}>
            <label>
              <input
                type='checkbox'
                checked={Boolean(formData[fieldKey])}
                onChange={(e) => handleChange(fieldKey, e.target.checked)}
              />
              {label}
            </label>
          </div>
        );
      case 'array':
        return (
          <div key={fieldKey}>
            <label>{label}</label>
            <input
              type='text'
              value={Array.isArray(formData[fieldKey]) ? (formData[fieldKey] as string[]).join(', ') : ''}
              onChange={(e) =>
                handleChange(
                  fieldKey,
                  e.target.value.split(',').map((item) => item.trim()),
                )
              }
              required={required}
            />
          </div>
        );
      case 'object':
        return (
          <div key={fieldKey}>
            <fieldset>
              <legend>{label}</legend>
              {renderFields && renderFields(fieldSchema)}
            </fieldset>
          </div>
        );
      case 'radio':
        return (
          <div key={fieldKey}>
            {component?.options.map(({ label, value }) => (
              <Radio
                size='sm'
                key={value}
                value={value}
                checked={formData[fieldKey] === value}
                onChange={(e) => {
                  handleChange(fieldKey, e.target.value);
                }}
                name={`${fieldKey}-${rowIndex}`}
              >
                {label}
              </Radio>
            ))}
          </div>
        );
      default:
        return null;
    }
  }
}
