import React, { useRef, useState } from 'react';

import { Textfield } from '@digdir/designsystemet-react';

import { handleSegmentKeyDown } from 'src/app-components/TimePicker/keyboardNavigation';
import {
  formatSegmentValue,
  isValidSegmentInput,
  parseSegmentInput,
} from 'src/app-components/TimePicker/timeFormatUtils';
import { getSmartInputResult } from 'src/app-components/TimePicker/smartInputUtils';
import type { SegmentType } from 'src/app-components/TimePicker/keyboardNavigation';
import type { TimeFormat } from 'src/app-components/TimePicker/TimePicker';

export interface TimeSegmentProps {
  value: number | string;
  min?: number;
  max?: number;
  type: SegmentType;
  format: TimeFormat;
  onValueChange: (value: number | string) => void;
  onNavigate: (direction: 'left' | 'right') => void;
  onAutoAdvance?: () => void;
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
      min,
      max,
      type,
      format,
      onValueChange,
      onNavigate,
      onAutoAdvance,
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
    const [previousInput, setPreviousInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync external value changes
    React.useEffect(() => {
      const formatted = formatSegmentValue(value, type, format);
      setLocalValue(formatted);
      // Reset previous input tracking when value changes externally
      setPreviousInput('');
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

      // Detect progressive typing patterns
      let processedInput = inputValue;
      let currentInput = previousInput;
      
      // Pattern 1: User typed single digit after a padded value was showing (e.g., "01" -> type "1" -> input becomes "1")
      // This happens because focus selects all text and typing replaces it
      // We want to build the two-digit number if the previous state was building
      if (previousInput && inputValue.length === 1 && /^\d$/.test(inputValue) && /^\d$/.test(previousInput)) {
        // We're continuing to build from the previous single digit
        processedInput = inputValue;
        currentInput = previousInput;
      }
      // Pattern 2: User typed digit after "0X" format when text wasn't selected (e.g., "01" -> "011")
      else if (localValue.length === 2 && inputValue.length === 3 && 
               localValue[0] === '0' && inputValue.startsWith(localValue)) {
        // User typed a digit after "0X" format, treat as building
        const firstDigit = localValue[1]; // The non-zero digit
        const secondDigit = inputValue[2]; // The newly typed digit
        processedInput = secondDigit;
        currentInput = firstDigit;
      }

      // Use smart input processing
      const smartResult = getSmartInputResult(processedInput, currentInput, type, format, min, max);

      // Update local display value
      setLocalValue(smartResult.displayValue);

      // Update parent component with actual value
      if (smartResult.actualValue !== null && smartResult.actualValue !== undefined) {
        onValueChange(smartResult.actualValue);
      }

      // Trigger auto-advance if needed
      if (smartResult.shouldAutoAdvance && onAutoAdvance) {
        onAutoAdvance();
      }

      // Store building state: only store the unpadded digit if we're building
      if (smartResult.isBuilding && smartResult.displayValue.startsWith('0') && smartResult.displayValue.length === 2) {
        // Store the actual digit (e.g., "01" -> store "1")
        setPreviousInput(smartResult.displayValue[1]);
      } else {
        setPreviousInput('');
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all text on focus for easy replacement
      e.target.select();
      // Reset building state on focus
      setPreviousInput('');
      onFocus?.();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Smart input handles formatting, just ensure we show valid value
      const inputValue = e.target.value;
      if (inputValue === '') {
        // Reset to formatted value if empty
        setLocalValue(formatSegmentValue(value, type, format));
        setPreviousInput('');
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
