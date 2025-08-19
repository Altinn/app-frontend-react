import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Textfield } from '@digdir/designsystemet-react';

import {
  handleSegmentKeyDown,
  handleValueDecrement,
  handleValueIncrement,
} from 'src/app-components/TimePicker/keyboardNavigation';
import {
  clearSegment,
  commitSegmentValue,
  handleSegmentCharacterInput,
  processSegmentBuffer,
} from 'src/app-components/TimePicker/segmentTyping';
import { formatSegmentValue } from 'src/app-components/TimePicker/timeFormatUtils';
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
    const [segmentBuffer, setSegmentBuffer] = useState('');
    const [bufferTimeout, setBufferTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync external value changes
    React.useEffect(() => {
      setLocalValue(formatSegmentValue(value, type, format));
      setSegmentBuffer(''); // Clear buffer when external value changes
    }, [value, type, format]);

    // Clear buffer timeout on unmount
    useEffect(
      () => () => {
        if (bufferTimeout) {
          clearTimeout(bufferTimeout);
        }
      },
      [bufferTimeout],
    );

    const commitBuffer = useCallback(() => {
      if (segmentBuffer) {
        const buffer = processSegmentBuffer(segmentBuffer, type, format.includes('a'));
        if (buffer.actualValue !== null) {
          const committedValue = commitSegmentValue(buffer.actualValue, type);
          onValueChange(committedValue);
        }
        setSegmentBuffer('');
      }
    }, [segmentBuffer, type, format, onValueChange]);

    const resetBufferTimeout = useCallback(() => {
      if (bufferTimeout) {
        clearTimeout(bufferTimeout);
      }
      const timeout = setTimeout(() => {
        commitBuffer();
      }, 1000); // 1 second timeout
      setBufferTimeout(timeout);
    }, [bufferTimeout, commitBuffer]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle special keys (arrows, delete, backspace, etc.)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const cleared = clearSegment();
        setLocalValue(cleared.displayValue);
        setSegmentBuffer('');
        if (bufferTimeout) {
          clearTimeout(bufferTimeout);
          setBufferTimeout(null);
        }
        return;
      }

      const result = handleSegmentKeyDown(e);

      if (result.shouldNavigate && result.direction) {
        commitBuffer(); // Commit current buffer before navigating
        onNavigate(result.direction);
      } else if (result.shouldIncrement) {
        commitBuffer();
        const newValue = handleValueIncrement(value, type, format);
        onValueChange(newValue);
      } else if (result.shouldDecrement) {
        commitBuffer();
        const newValue = handleValueDecrement(value, type, format);
        onValueChange(newValue);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle character input with Chrome-like segment typing
      const char = e.key;

      if (char.length === 1) {
        e.preventDefault();

        const result = handleSegmentCharacterInput(char, type, segmentBuffer, format);

        if (result.shouldNavigate) {
          commitBuffer();
          onNavigate('right');
          return;
        }

        setSegmentBuffer(result.newBuffer);
        const buffer = processSegmentBuffer(result.newBuffer, type, format.includes('a'));
        setLocalValue(buffer.displayValue);

        if (result.shouldAdvance) {
          // Commit immediately and advance
          if (buffer.actualValue !== null) {
            const committedValue = commitSegmentValue(buffer.actualValue, type);
            onValueChange(committedValue);
          }
          setSegmentBuffer('');
          if (bufferTimeout) {
            clearTimeout(bufferTimeout);
            setBufferTimeout(null);
          }
          onNavigate('right');
        } else {
          // Start or reset timeout
          resetBufferTimeout();
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Clear buffer and select all text on focus
      setSegmentBuffer('');
      if (bufferTimeout) {
        clearTimeout(bufferTimeout);
        setBufferTimeout(null);
      }
      e.target.select();
      onFocus?.();
    };

    const handleBlur = () => {
      // Commit any pending buffer and fill empty minutes with 00
      commitBuffer();

      if (
        (value === null || value === '' || (typeof value === 'number' && isNaN(value))) &&
        (type === 'minutes' || type === 'seconds')
      ) {
        onValueChange(0); // Fill empty minutes/seconds with 00
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
        onChange={() => {}} // Prevent React warnings - actual input handled by onKeyPress
        onKeyPress={handleKeyPress}
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
