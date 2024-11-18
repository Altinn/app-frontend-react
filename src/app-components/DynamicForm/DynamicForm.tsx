import React, { useEffect, useState } from 'react';

import { Popover, Radio, Textfield } from '@digdir/designsystemet-react';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import styles from 'src/layout/Datepicker/Calendar.module.css';
import { DatePickerCalendar } from 'src/layout/Datepicker/DatePickerCalendar';
import { DatePickerInput } from 'src/layout/Datepicker/DatePickerInput';
import { getDateFormat, getLocale, getSaveFormattedDateString } from 'src/utils/dateHelpers';

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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (key: string, value: FormDataValue) => {
    const newData = { ...formData, [key]: value };
    // setFormData(newData);
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
          locale={locale}
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
  locale?: string;
}

export function FieldRenderer({
  rowIndex,
  fieldKey,
  fieldSchema,
  formData,
  handleChange,
  schema,
  component,
  renderFields,
  locale,
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
        if (format === 'date') {
          return (
            <DateField
              fieldKey={fieldKey}
              formData={formData}
              handleChange={handleChange}
              required={required}
              locale={locale}
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

interface DateFieldProps {
  fieldKey: string;
  formData: FormDataObject;
  handleChange: (key: string, value: FormDataValue) => void;
  required?: boolean;
  locale?: string;
}

function DateField({ fieldKey, formData, handleChange, required, locale }: DateFieldProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const currentLocale = getLocale(locale ?? 'nb');
  const dateFormat = getDateFormat('dd.MM.yyyy', currentLocale.code);

  return (
    <div
      key={fieldKey}
      style={{ marginBottom: '10px' }}
    >
      <Popover
        portal={false}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        size='lg'
        placement='top'
      >
        <Popover.Trigger
          onClick={() => setIsDialogOpen(!isDialogOpen)}
          asChild={true}
        >
          {isDialogOpen && (
            <DatePickerInput
              id={fieldKey}
              datepickerFormat={dateFormat}
              timeStamp={false}
              value={(formData[fieldKey] as string) || ''}
            />
          )}
        </Popover.Trigger>
        <Popover.Content
          className={styles.calendarWrapper}
          aria-modal
          autoFocus={true}
        >
          <DatePickerCalendar
            id={`id-${DatePickerCalendar}`}
            locale={currentLocale.code}
            selectedDate={selectedDate}
            isOpen={isDialogOpen}
            onSelect={(date: Date) => {
              setSelectedDate(date);
              const formattedDate = getSaveFormattedDateString(date, false);
              handleChange(fieldKey, formattedDate);
              setIsDialogOpen(!isDialogOpen);
            }}
            required={required}
            maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 100))}
            minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
          />
        </Popover.Content>
      </Popover>
    </div>
  );
}
