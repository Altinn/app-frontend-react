import React, { useState } from 'react';

import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

type FormDataValue = string | number | boolean | null | FormDataValue[] | { [key: string]: FormDataValue };

interface FormDataObject {
  [key: string]: FormDataValue;
}

interface Props {
  schema: JSONSchema7;
  onChange: (data: FormDataObject) => void;
}

export function DynamicForm({ schema, onChange }: Props) {
  const [formData, setFormData] = useState<FormDataObject>({});

  const handleChange = (key: string, value: FormDataValue) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onChange(newData);
  };

  const renderField = (key: string, fieldSchema: JSONSchema7Definition) => {
    if (typeof fieldSchema === 'boolean') {
      return null;
    } else {
      const { type, enum: enumOptions } = fieldSchema;
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
          return (
            <div key={key}>
              <label>{label}</label>
              <input
                type='text'
                value={(formData[key] as string) || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                required={required}
              />
            </div>
          );
        case 'number':
        case 'integer':
          return (
            <div key={key}>
              <label>{label}</label>
              <input
                type='number'
                value={formData[key] !== undefined ? (formData[key] as number) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleChange(key, Number(e.target.value));
                  }
                }}
                required={required}
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

  return <form>{renderFields(schema)}</form>;
}

// import React, { useState } from 'react';
//
// import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
//
// interface Props {
//   schema: JSONSchema7;
//   onChange: (data: any) => void;
// }
//
// export function DynamicForm({ schema, onChange }: Props) {
//   const [formData, setFormData] = useState<any>({});
//
//   const handleChange = (key: string, value: any) => {
//     const newData = { ...formData, [key]: value };
//     setFormData(newData);
//     onChange(newData);
//   };
//
//   const renderField = (key: string, fieldSchema: JSONSchema7Definition) => {
//     if (typeof fieldSchema === 'boolean') {
//       return null;
//     } else {
//       const { type, enum: enumOptions } = fieldSchema;
//       const label = fieldSchema.title || key;
//       const required = schema.required?.includes(key);
//
//       if (enumOptions) {
//         return (
//           <div key={key}>
//             <label>{label}</label>
//             <select
//               value={formData[key] || ''}
//               onChange={(e) => handleChange(key, e.target.value)}
//               required={required}
//             >
//               <option
//                 value=''
//                 disabled
//               >
//                 Select an option
//               </option>
//               {enumOptions.map((option) => (
//                 <option
//                   key={option as string}
//                   value={option as string}
//                 >
//                   {option as string}
//                 </option>
//               ))}
//             </select>
//           </div>
//         );
//       }
//
//       switch (type) {
//         case 'string':
//           return (
//             <div key={key}>
//               <label>{label}</label>
//               <input
//                 type='text'
//                 value={formData[key] || ''}
//                 onChange={(e) => handleChange(key, e.target.value)}
//                 required={required}
//               />
//             </div>
//           );
//         case 'number':
//         case 'integer':
//           return (
//             <div key={key}>
//               <label>{label}</label>
//               <input
//                 type='number'
//                 value={formData[key] || ''}
//                 onChange={(e) => handleChange(key, Number(e.target.value))}
//                 required={required}
//               />
//             </div>
//           );
//         case 'boolean':
//           return (
//             <div key={key}>
//               <label>
//                 <input
//                   type='checkbox'
//                   checked={!!formData[key]}
//                   onChange={(e) => handleChange(key, e.target.checked)}
//                 />
//                 {label}
//               </label>
//             </div>
//           );
//         case 'array':
//           // Simplified array handling
//           return (
//             <div key={key}>
//               <label>{label}</label>
//               <input
//                 type='text'
//                 value={formData[key]?.join(', ') || ''}
//                 onChange={(e) =>
//                   handleChange(
//                     key,
//                     e.target.value.split(',').map((item) => item.trim()),
//                   )
//                 }
//                 required={required}
//               />
//             </div>
//           );
//         case 'object':
//           return (
//             <div key={key}>
//               <fieldset>
//                 <legend>{label}</legend>
//                 {renderFields(fieldSchema)}
//               </fieldset>
//             </div>
//           );
//         default:
//           return null;
//       }
//     }
//   };
//
//   const renderFields = (currentSchema: JSONSchema7) => {
//     if (currentSchema.type === 'object' && currentSchema.properties) {
//       return Object.keys(currentSchema.properties).map((key) => renderField(key, currentSchema.properties![key]));
//     }
//     return null;
//   };
//
//   return <form>{renderFields(schema)}</form>;
// }
//
// //export default DynamicForm;
//
// // import React, { useState } from 'react';
// // import type { ChangeEvent, FormEvent } from 'react';
// //
// // import type { JSONSchema7 } from 'json-schema';
// //
// // interface FieldSchema {
// //   type: 'string' | 'integer' | 'number' | 'boolean';
// //   format?: string;
// //   maximum?: number;
// //   minimum?: number;
// // }
// //
// // type Schema = {
// //   [key: string]: JSONSchema7;
// // };
// //
// // interface DynamicFormProps {
// //   schema: Schema;
// // }
// //
// // export function DynamicForm({ schema }: DynamicFormProps) {
// //   console.log('Dynamic', schema);
// //   const [formData, setFormData] = useState<{ [key: string]: any }>(() => {
// //     const initialState: { [key: string]: any } = {};
// //     Object.keys(schema).forEach((fieldName) => {
// //       initialState[fieldName] = schema[fieldName].type === 'boolean' ? false : '';
// //     });
// //     return initialState;
// //   });
// //
// //   const handleChange = (fieldName: string, fieldSchema: FieldSchema) => (event: ChangeEvent<HTMLInputElement>) => {
// //     let value: any;
// //     if (fieldSchema.type === 'boolean') {
// //       value = event.target.checked;
// //     } else if (fieldSchema.type === 'integer' || fieldSchema.type === 'number') {
// //       value = event.target.value === '' ? '' : Number(event.target.value);
// //     } else {
// //       value = event.target.value;
// //     }
// //
// //     setFormData({
// //       ...formData,
// //       [fieldName]: value,
// //     });
// //   };
// //
// //   const handleSubmit = (event: FormEvent) => {
// //     event.preventDefault();
// //     console.log(formData);
// //     // You can add form submission logic here
// //   };
// //
// //   return (
// //     <form onSubmit={handleSubmit}>
// //       {Object.keys(schema).map((fieldName) => {
// //         const fieldSchema = schema[fieldName];
// //         let inputType = 'text';
// //         const inputProps: { [key: string]: any } = {};
// //
// //         switch (fieldSchema.type) {
// //           case 'string':
// //             inputType = fieldSchema.format === 'date' ? 'date' : 'text';
// //             break;
// //           case 'integer':
// //           case 'number':
// //             inputType = 'number';
// //             if (fieldSchema.maximum !== undefined) {
// //               inputProps.max = fieldSchema.maximum;
// //             }
// //             if (fieldSchema.minimum !== undefined) {
// //               inputProps.min = fieldSchema.minimum;
// //             }
// //             break;
// //           case 'boolean':
// //             inputType = 'checkbox';
// //             break;
// //           default:
// //             inputType = 'text';
// //         }
// //
// //         return (
// //           <div key={fieldName}>
// //             <label>
// //               {fieldName}:
// //               {inputType === 'checkbox' ? (
// //                 <input
// //                   type={inputType}
// //                   name={fieldName}
// //                   checked={!!formData[fieldName]}
// //                   onChange={handleChange(fieldName, fieldSchema)}
// //                   {...inputProps}
// //                 />
// //               ) : (
// //                 <input
// //                   type={inputType}
// //                   name={fieldName}
// //                   value={formData[fieldName]}
// //                   onChange={handleChange(fieldName, fieldSchema)}
// //                   {...inputProps}
// //                 />
// //               )}
// //             </label>
// //           </div>
// //         );
// //       })}
// //       <button type='submit'>Submit</button>
// //     </form>
// //   );
// // }
