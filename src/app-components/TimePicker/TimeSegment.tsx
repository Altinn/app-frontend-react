import React, { useRef, useState } from 'react';

import { Textfield } from '@digdir/designsystemet-react';

import { handleSegmentKeyDown } from 'src/app-components/TimePicker/keyboardNavigation';
import {
  formatSegmentValue,
  isValidSegmentInput,
  parseSegmentInput,
} from 'src/app-components/TimePicker/timeFormatUtils';
import type { SegmentType } from 'src/app-components/TimePicker/keyboardNavigation';
import type { TimeFormat } from 'src/app-components/TimePicker/TimePicker';

export interface TimeSegmentProps {
  value: number | string;
  min: number;
  max: number;
  type: SegmentType;
  format: TimeFormat;
  onValueChange: (value: number | string) => void;
  onNavigate: (direction: 'left' | 'right') => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  'aria-label': string;
  className?: string;
  autoFocus?: boolean;
}

export const TimeSegment = React.forwardRef<HTMLInputElement, TimeSegmentProps>(
  (
    {
      value,
      type,
      format,
      onValueChange,
      onNavigate,
      onFocus,
      onBlur,
      placeholder,
      disabled,
      readOnly,
      'aria-label': ariaLabel,
      className,
      autoFocus,
    },
    ref,
  ) => {
    const [localValue, setLocalValue] = useState(() => formatSegmentValue(value, type, format));
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync external value changes
    React.useEffect(() => {
      setLocalValue(formatSegmentValue(value, type, format));
    }, [value, type, format]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const result = handleSegmentKeyDown(e);

      if (result.shouldNavigate && result.direction) {
        onNavigate(result.direction);
      } else if (result.shouldIncrement) {
        // Increment logic will be handled by parent component
        // This allows parent to apply constraints
        const numValue = typeof value === 'number' ? value : 0;
        onValueChange(type === 'period' ? (value === 'AM' ? 'PM' : 'AM') : numValue + 1);
      } else if (result.shouldDecrement) {
        const numValue = typeof value === 'number' ? value : 0;
        onValueChange(type === 'period' ? (value === 'PM' ? 'AM' : 'PM') : numValue - 1);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // For period, handle partial input (P, A, etc.)
      if (type === 'period') {
        setLocalValue(inputValue.toUpperCase());
        const parsed = parseSegmentInput(inputValue, type, format);
        if (parsed !== null) {
          onValueChange(parsed);
        }
        return;
      }

      // Allow typing and validate for numeric segments
      if (isValidSegmentInput(inputValue, type, format) || inputValue === '') {
        setLocalValue(inputValue);

        // Parse and update parent if valid
        const parsed = parseSegmentInput(inputValue, type, format);
        if (parsed !== null) {
          onValueChange(parsed);
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all text on focus for easy replacement
      e.target.select();
      onFocus?.();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Auto-pad single digits on blur
      const inputValue = e.target.value;
      if (inputValue.length === 1 && type !== 'period') {
        const paddedValue = inputValue.padStart(2, '0');
        setLocalValue(paddedValue);
        const parsed = parseSegmentInput(paddedValue, type, format);
        if (parsed !== null) {
          onValueChange(parsed);
        }
      } else if (inputValue === '') {
        // Reset to formatted value if empty
        setLocalValue(formatSegmentValue(value, type, format));
      }
      onBlur?.();
    };

    const combinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        // Handle both external ref and internal ref
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
        inputRef.current = node;
      },
      [ref],
    );

    return (
      <Textfield
        ref={combinedRef}
        type='text'
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={ariaLabel}
        className={className}
        autoFocus={autoFocus}
        data-size='sm'
        style={{
          width: type === 'period' ? '4rem' : '3rem',
          textAlign: 'center',
          padding: '0.25rem',
        }}
        autoComplete='off'
        inputMode={type === 'period' ? 'text' : 'numeric'}
        maxLength={type === 'period' ? 2 : 2}
      />
    );
  },
);

TimeSegment.displayName = 'TimeSegment';
