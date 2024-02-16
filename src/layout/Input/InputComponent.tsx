import React, { useState } from 'react';
import { NumericFormat, PatternFormat } from 'react-number-format';

import { Textfield } from '@digdir/design-system-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useMapToReactNumberConfig } from 'src/hooks/useMapToReactNumberConfig';
import { isNumericFormat, isPatternFormat } from 'src/layout/Input/number-format-helpers';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IInputFormatting } from 'src/layout/Input/config.generated';

export type IInputProps = PropsFromGenericComponent<'Input'>;
export const InputComponent: React.FunctionComponent<IInputProps> = ({ node, isValid, overrideDisplay }) => {
  const {
    id,
    readOnly,
    required,
    formatting,
    variant,
    textResourceBindings,
    dataModelBindings,
    saveWhileTyping,
    autocomplete,
    maxLength,
    type,
  } = node.item;

  const {
    formData: { simpleBinding: formValue },
    setValue,
    debounce,
  } = useDataModelBindings(dataModelBindings, saveWhileTyping);

  const { langAsString } = useLanguage();

  const reactNumberFormatConfig = useMapToReactNumberConfig(formatting as IInputFormatting | undefined, formValue);
  const ariaLabel = overrideDisplay?.renderedInTable === true ? langAsString(textResourceBindings?.title) : undefined;

  const [localValue, setLocalValue] = useState<string>(formValue);

  if (!reactNumberFormatConfig?.number) {
    return (
      <Textfield
        aria-label={ariaLabel}
        value={formValue}
        aria-describedby={textResourceBindings?.description ? `description-${id}` : undefined}
        onChange={(event) => {
          setValue('simpleBinding', event.target.value);
        }}
      />
    );
  }

  if (isPatternFormat(reactNumberFormatConfig.number)) {
    return (
      <>
        <h1>pattern</h1>
        <PatternFormat
          onValueChange={(values, sourceInfo) => {
            setValue('simpleBinding', values.value);
          }}
          customInput={Textfield as React.ComponentType}
          role={'textbox'}
          {...reactNumberFormatConfig.number}
        />
      </>
    );
  }

  if (isNumericFormat(reactNumberFormatConfig.number)) {
    return (
      <>
        <h1>num</h1>
        <NumericFormat
          value={localValue}
          onValueChange={(values, sourceInfo) => {
            if (sourceInfo.source !== 'prop') {
              setLocalValue(values.value);
            }
            setValue('simpleBinding', values.value);
          }}
          onPaste={(event) => {
            /* This is a workaround for a bug react-number-format bug that
             * removes the decimal on paste.
             * We should be able to remove it when this issue gets fixed:
             * https://github.com/s-yadav/react-number-format/issues/349
             *  */
            const pastedText = event.clipboardData.getData('Text');
            event.preventDefault();
            setLocalValue(pastedText);
          }}
          customInput={Textfield as React.ComponentType}
          role={'textbox'}
          {...reactNumberFormatConfig.number}
        />
      </>
    );
  }
};

// {/*<input*/}
// {/*  type='text'*/}
// {/*  ref={inputRef}*/}
// {/*/>*/}
// {/*<NumericFormat*/}
// {/*  value={12323.3333}*/}
// {/*  decimalSeparator=','*/}
// {/*/>*/}
//
// {/*<button*/}
// {/*  onClick={() => {*/}
// {/*    // @ts-ignore*/}
// {/*    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(*/}
// {/*      window.HTMLInputElement.prototype,*/}
// {/*      'value',*/}
// {/*    ).set;*/}
// {/*    // @ts-ignore*/}
// {/*    nativeInputValueSetter.call(inputRef.current, 'THIS IS A VALUE!!');*/}
// {/*    const event = new Event('input', { bubbles: true });*/}
// {/*    inputRef.current?.dispatchEvent(event);*/}
// {/*  }}*/}
// {/*>*/}
// {/*  clucky*/}
// {/*</button>*/}

// {/*<NumericFormat*/}
// {/*  onChange={(event) => {*/}
// {/*    console.log('event');*/}
// {/*    console.log(event);*/}
// {/*  }}*/}
// {/*  onValueChange={(values, sourceInfo) => {*/}
// {/*    console.log('num change!');*/}
// {/*    console.log(values);*/}
// {/*    console.log(sourceInfo);*/}
// {/*    if (values.value === values.formattedValue) {*/}
// {/*      console.log('NOT FORMATTED!!!');*/}
// {/*      console.log(' is this right:');*/}
// {/*      console.log(getFormattedValue(values.value, reactNumberFormatConfig));*/}
// {/*    }*/}
// {/*    setValue('simpleBinding', values.value);*/}
// {/*  }}*/}
// {/*  customInput={Textfield as React.ComponentType}*/}
// {/*  {...reactNumberFormatConfig}*/}
// {/*/>*/}

// <NumberFormatBase
//   type={'text'}
//   format={(inputValue) => {
//     console.log('inputValue', inputValue);
//     return inputValue;
//   }}
// />

// if (
//   isNumericFormat(reactNumberFormatConfig.number) &&
//   (reactNumberFormatConfig.number as NumberFormatProps).allowedDecimalSeparators
// ) {
//   return (
//     <NumericFormat
//       value={formValue}
//       {...reactNumberFormatConfig.number}
//       onPaste={(e) => {
//         e.preventDefault();
//         const pastedValue = e.clipboardData.getData('Text');
//
//         // @ts-ignore
//         const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
//           window.HTMLInputElement.prototype,
//           'value',
//         ).set;
//         // @ts-ignore
//         nativeInputValueSetter.call(inputRef.current, pastedValue);
//         const event = new Event('input', { bubbles: true });
//         inputRef.current?.dispatchEvent(event);
//
//         // setValue('simpleBinding', values.value);
//       }}
//       onChange={(event) => {
//         console.log('onchange');
//         console.log(event.target.value);
//       }}
//       onValueChange={(values, sourceInfo) => {
//         console.log('onValueChange');
//         console.log(values);
//         console.log(sourceInfo);
//       }}
//     ></NumericFormat>
//   );
// }

// export const InputComponent: React.FunctionComponent<IInputProps> = ({ node, isValid, overrideDisplay }) => {
//   console.log('YO!');
//   return (
//     <NumberFormatBase
//       valueIsNumericString={false}
//       type={'text'}
//       format={(inputValue) => {
//         console.log('inputValue', inputValue);
//         return inputValue;
//       }}
//     />
//   );
// };

// const thing = useNumericFormat(reactNumberFormatConfig);
// const inputRef = useRef<HTMLInputElement>(null);
