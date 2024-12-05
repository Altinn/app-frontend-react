import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { Paragraph, Textfield } from '@digdir/designsystemet-react';
import type { CharacterLimitProps } from '@digdir/designsystemet-react/dist/types/components/form/CharacterCounter';

import classes from 'src/app-components/Input/Input.module.css';
import type { InputType } from 'src/app-components/Input/constants';

export type InputProps = {
  size?: 'sm' | 'md' | 'lg';
  prefix?: string;
  suffix?: string;
  characterLimit?: CharacterLimitProps;
  error?: ReactNode;
  disabled?: boolean;
  id?: string;
  readOnly?: boolean;
  type?: InputType;
  textonly?: boolean;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'value'
  | 'className'
  | 'aria-label'
  | 'aria-describedby'
  | 'onChange'
  | 'autoComplete'
  | 'required'
  | 'onBlur'
  | 'placeholder'
  | 'inputMode'
  | 'style'
>;

// export interface InputProps extends Textfield {
//   size?: 'sm' | 'md' | 'lg';
//   prefix?: string;
//   suffix?: string;
//   characterLimit?: CharacterLimitProps;
//   error?: ReactNode;
//   disabled?: boolean;
//   id?: string;
//   readOnly?: boolean;
//   type?: InputType;
//   textonly?: boolean;
// }

export function Input(props: InputProps) {
  const {
    size = 'sm',
    prefix,
    suffix,
    characterLimit,
    error,
    disabled,
    id,
    readOnly,
    type,
    textonly,
    value,
    className,
    onChange,
    autoComplete,
    required,
    onBlur,
    placeholder,
    inputMode,
    style,
  } = props;

  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (readOnly) {
      event.preventDefault();
    }
  };

  if (textonly) {
    const { value, id, className } = props;
    if (value === null || (typeof value === 'string' && value.length === 0)) {
      return null;
    }

    return (
      <Paragraph
        id={id}
        size={size}
        className={`${classes.textPadding} ${classes.focusable} ${className}`}
        tabIndex={0}
      >
        {value}
      </Paragraph>
    );
  }

  return (
    <Textfield
      {...{
        onPaste,
        size,
        prefix,
        suffix,
        characterLimit,
        error,
        disabled,
        id,
        readOnly,
        type,
        value,
        className,
        onChange,
        autoComplete,
        required,
        onBlur,
        placeholder,
        inputMode,
        style,
      }}
    />
  );

  // return (
  //   <Textfield
  //     onPaste={handlePaste}
  //     size={size}
  //     readOnly={readOnly}
  //     {...rest}
  //   />
  // );
}

// import React from 'react';
// import type { InputHTMLAttributes, ReactNode } from 'react';
//
// import { Paragraph, Textfield } from '@digdir/designsystemet-react';
// import type { CharacterLimitProps } from '@digdir/designsystemet-react/dist/types/components/form/CharacterCounter';
//
// import classes from 'src/app-components/Input/Input.module.css';
// import type { InputType } from 'src/app-components/Input/constants';
//
// interface InputPropsLocal {
//   size?: 'sm' | 'md' | 'lg';
//   prefix?: string;
//   suffix?: string;
//   characterLimit?: CharacterLimitProps;
//   error?: ReactNode;
//   disabled?: boolean;
//   id?: string;
//   readOnly?: boolean;
//   type?: InputType;
//   textonly?: boolean;
// }
//
// // Explicitly pick only those HTML input attributes that we know `Textfield` can handle.
// type AllowedInputHTMLProps = Pick<
//   InputHTMLAttributes<HTMLInputElement>,
//   | 'value'
//   | 'className'
//   | 'aria-label'
//   | 'aria-describedby'
//   | 'onChange'
//   | 'autoComplete'
//   | 'required'
//   | 'onBlur'
//   | 'placeholder'
//   | 'inputMode'
//   | 'style'
// >;
//
// export type InputProps = InputPropsLocal & AllowedInputHTMLProps;
//
// export function Input(props: InputProps) {
//   const { size = 'sm', readOnly, ...rest } = props;
//
//   const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
//     if (readOnly) {
//       event.preventDefault();
//     }
//   };
//
//   if (props.textonly) {
//     const { value, id, className } = props;
//     if (value === null || (typeof value === 'string' && value.length === 0)) {
//       return null;
//     }
//
//     return (
//       <Paragraph
//         id={id}
//         size={size}
//         className={`${classes.textPadding} ${classes.focusable} ${className}`}
//         tabIndex={0}
//       >
//         {value}
//       </Paragraph>
//     );
//   }
//
//   return (
//     <Textfield
//       onPaste={handlePaste}
//       size={size}
//       readOnly={readOnly}
//       {...rest}
//     />
//   );
// }

// import React from 'react';
// import type { InputHTMLAttributes, ReactNode } from 'react';
//
// import { Paragraph, Textfield } from '@digdir/designsystemet-react';
// import type { CharacterLimitProps } from '@digdir/designsystemet-react/dist/types/components/form/CharacterCounter';
//
// import classes from 'src/app-components/Input/Input.module.css';
// import type { InputType } from 'src/app-components/Input/constants';
//
// interface InputPropsLocal {
//   size?: 'sm' | 'md' | 'lg';
//   prefix?: string;
//   suffix?: string;
//   characterLimit?: CharacterLimitProps;
//   error?: ReactNode;
//   disabled?: boolean;
//   id?: string;
//   readOnly?: boolean;
//   type?: InputType;
//   textonly?: boolean;
// }
//
// export type InputProps = InputPropsLocal &
//   Pick<
//     InputHTMLAttributes<HTMLInputElement>,
//     | 'value'
//     | 'className'
//     | 'aria-label'
//     | 'aria-describedby'
//     | 'onChange'
//     | 'autoComplete'
//     | 'required'
//     | 'onBlur'
//     | 'placeholder'
//     | 'inputMode'
//     | 'style'
//   >;
//
// export function Input(props: InputProps) {
//   const { size = 'sm', readOnly, ...rest } = props;
//
//   const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
//     if (readOnly) {
//       event.preventDefault();
//     }
//   };
//
//   if (props.textonly) {
//     const { value, id, className } = props;
//     if (value === null || (typeof value === 'string' && value.length === 0)) {
//       return null;
//     }
//
//     return (
//       <Paragraph
//         id={id}
//         size={size}
//         className={`${classes.textPadding} ${classes.focusable} ${className}`}
//         tabIndex={0}
//       >
//         {value}
//       </Paragraph>
//     );
//   }
//
//   return (
//     <Textfield
//       onPaste={handlePaste}
//       size={size}
//       readOnly={readOnly}
//       {...rest}
//     />
//   );
// }

// import React from 'react';
// import type { InputHTMLAttributes, ReactNode } from 'react';
//
// import { Paragraph, Textfield } from '@digdir/designsystemet-react';
// import type { CharacterLimitProps } from '@digdir/designsystemet-react/dist/types/components/form/CharacterCounter';
//
// import classes from 'src/app-components/Input/Input.module.css';
// import type { InputType } from 'src/app-components/Input/constants';
//
// export type InputProps = {
//   size?: 'sm' | 'md' | 'lg';
//   prefix?: string;
//   suffix?: string;
//   characterLimit?: CharacterLimitProps;
//   error?: ReactNode;
//   disabled?: boolean;
//   id?: string;
//   readOnly?: boolean;
//   type?: InputType;
//   textonly?: boolean;
// } & Pick<
//   InputHTMLAttributes<HTMLInputElement>,
//   | 'value'
//   | 'className'
//   | 'aria-label'
//   | 'aria-describedby'
//   | 'onChange'
//   | 'autoComplete'
//   | 'required'
//   | 'onBlur'
//   | 'placeholder'
//   | 'inputMode'
//   | 'style'
// >;
//
// // const dings: InputProps = {};
//
// export function Input(props: InputProps) {
//   //<<<<<<< HEAD
//   const { size = 'sm', prefix, suffix, characterLimit, error, id, readOnly, type, onChange } = props;
//   // // =======
//   //   const { size = 'sm', readOnly, ...rest } = props;
//
//   const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
//     if (readOnly) {
//       event.preventDefault();
//     }
//   };
//   // >>>>>>> main
//
//   if (props.textonly) {
//     const { value, id, className } = props;
//     if (value === null || (typeof value === 'string' && value.length === 0)) {
//       return null;
//     }
//
//     return (
//       <Paragraph
//         id={id}
//         size={size}
//         className={`${classes.textPadding} ${classes.focusable} ${className}`}
//         tabIndex={0}
//       >
//         {value}
//       </Paragraph>
//     );
//   }
//
//   return (
//     <Textfield
//       onPaste={handlePaste}
//       size={size}
//       prefix={prefix}
//       suffix={suffix}
//       type={type}
//       characterLimit={characterLimit}
//       error={error}
//       id={id}
//       readOnly={readOnly}
//       onChange={onChange}
//     />
//   );
// }
