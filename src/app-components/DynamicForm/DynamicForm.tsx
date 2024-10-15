import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';

import { Button, Textfield } from '@digdir/designsystemet-react';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import DropdownCaption from 'src/layout/Datepicker/DropdownCaption';
import { getLocale, getSaveFormattedDateString } from 'src/utils/dateHelpers';

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

export function DynamicForm({ schema, onChange, initialData, locale }: DynamicFormProps) {
  const [formData, setFormData] = useState<FormDataObject>(initialData || {});

  const currentLocale = getLocale(locale ?? 'nb');

  const [selectedDate, setSelectedDate] = useState(new Date());

  // const selectedDate = isValidDate(parseISO(value)) ? parseISO(value) : new Date();
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (key: string, value: FormDataValue) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    // Removed onChange call here
  };

  const renderField = (key: string, fieldSchema: JSONSchema7Definition) => {
    if (typeof fieldSchema === 'boolean') {
      return null;
    } else {
      const { type, format, enum: enumOptions } = fieldSchema;
      const label = fieldSchema.title || key;
      const required = schema.required?.includes(key);

      if (enumOptions) {
        return (
          <div key={key}>
            <label>{label}</label>
            <select
              value={(formData[key] as string | number | undefined) || ''}
              onChange={(e) => handleChange(key, e.target.value)}
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

      switch (type) {
        case 'string':
          if (format === 'date') {
            return (
              <div key={key}>
                <DayPicker
                  locale={currentLocale}
                  today={new Date()}
                  month={selectedDate}
                  weekStartsOn={1}
                  mode='single'
                  hideNavigation
                  selected={selectedDate}
                  required={required}
                  captionLayout='label'
                  onSelect={(date: Date) => {
                    setSelectedDate(date);

                    const formattedDate = getSaveFormattedDateString(date, false);
                    console.log('key', key);
                    // console.log('getSaveFormattedDateString(date, false)', getSaveFormattedDateString(date, false));
                    handleChange(key, formattedDate);
                  }}
                  components={{ MonthCaption: DropdownCaption }}
                  style={{ minHeight: '405px', maxWidth: '100%' }}
                />
              </div>
            );
          }

          // "format": "date"

          return (
            <div key={key}>
              <Textfield
                description=''
                error=''
                label={label}
                size='sm'
                required={required}
                value={(formData[key] as string) || ''}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          );
        case 'number':
        case 'integer':
          return (
            <div key={key}>
              <Textfield
                description=''
                error=''
                label={label}
                size='sm'
                type='number'
                required={required}
                value={formData[key] !== undefined ? String(formData[key]) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleChange(key, Number(e.target.value));
                  }
                }}
              />
            </div>
          );
        case 'boolean':
          return (
            <div key={key}>
              <label>
                <input
                  type='checkbox'
                  checked={Boolean(formData[key])}
                  onChange={(e) => handleChange(key, e.target.checked)}
                />
                {label}
              </label>
            </div>
          );
        case 'array':
          // Simplified array handling for arrays of strings
          return (
            <div key={key}>
              <label>{label}</label>
              <input
                type='text'
                value={Array.isArray(formData[key]) ? (formData[key] as string[]).join(', ') : ''}
                onChange={(e) =>
                  handleChange(
                    key,
                    e.target.value.split(',').map((item) => item.trim()),
                  )
                }
                required={required}
              />
            </div>
          );
        case 'object':
          return (
            <div key={key}>
              <fieldset>
                <legend>{label}</legend>
                {renderFields(fieldSchema)}
              </fieldset>
            </div>
          );
        default:
          return null;
      }
    }
  };

  const renderFields = (currentSchema: JSONSchema7) => {
    if (currentSchema.type === 'object' && currentSchema.properties) {
      return Object.keys(currentSchema.properties).map((key) => renderField(key, currentSchema.properties![key]));
    }
    return null;
  };

  return (
    <form>
      <pre>{JSON.stringify(schema, null, 2)}</pre>
      {renderFields(schema)}
      <Button
        size='md'
        variant='primary'
        onClick={() => onChange(formData)} // Call onChange when button is clicked
      >
        Lagre
      </Button>
    </form>
  );
}
