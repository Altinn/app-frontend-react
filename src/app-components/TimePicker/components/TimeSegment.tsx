import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Textfield } from '@digdir/designsystemet-react';

import {
  handleSegmentKeyDown,
  handleValueDecrement,
  handleValueIncrement,
} from 'src/app-components/TimePicker/utils/keyboardNavigation';
import {
  clearSegment,
  commitSegmentValue,
  handleSegmentCharacterInput,
  processSegmentBuffer,
} from 'src/app-components/TimePicker/utils/segmentTyping';
import { formatSegmentValue } from 'src/app-components/TimePicker/utils/timeFormatUtils';
import type { TimeFormat } from 'src/app-components/TimePicker/components/TimePicker';
import type { SegmentType } from 'src/app-components/TimePicker/utils/keyboardNavigation';

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
    const [typingEndTimeout, setTypingEndTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isTypingRef = useRef(false);
    const bufferRef = useRef(''); // Keep current buffer in a ref for timeouts

    // Sync external value changes
    React.useEffect(() => {
      const formattedValue = formatSegmentValue(value, type, format);
      setLocalValue(formattedValue);

      // Only clear buffer if we're not currently typing
      // This prevents clearing the buffer when our own input triggers an external value change
      if (!isTypingRef.current) {
        setSegmentBuffer('');
        bufferRef.current = '';
      }
    }, [value, type, format]);

    // Clear timeouts on unmount
    useEffect(
      () => () => {
        if (bufferTimeout) {
          clearTimeout(bufferTimeout);
        }
        if (typingEndTimeout) {
          clearTimeout(typingEndTimeout);
        }
      },
      [bufferTimeout, typingEndTimeout],
    );

    const commitBuffer = useCallback(
      (shouldEndTyping = true) => {
        // Use the current buffer from ref to avoid stale closures
        const currentBuffer = bufferRef.current;
        if (currentBuffer) {
          const buffer = processSegmentBuffer(currentBuffer, type, format.includes('a'));
          if (buffer.actualValue !== null) {
            const committedValue = commitSegmentValue(buffer.actualValue, type);
            onValueChange(committedValue);
          }
          setSegmentBuffer('');
          bufferRef.current = '';
        }
        // Only end typing state if explicitly requested
        // This allows us to keep typing state during timeout commits
        if (shouldEndTyping) {
          isTypingRef.current = false;
        }
      },
      [type, format, onValueChange],
    ); // Remove segmentBuffer dependency

    const resetBufferTimeout = useCallback(() => {
      // Clear any existing timeouts
      if (bufferTimeout) {
        clearTimeout(bufferTimeout);
        setBufferTimeout(null);
      }
      if (typingEndTimeout) {
        clearTimeout(typingEndTimeout);
        setTypingEndTimeout(null);
      }

      const timeout = setTimeout(() => {
        commitBuffer(false); // Don't end typing on timeout - keep buffer alive
      }, 1000); // 1 second timeout
      setBufferTimeout(timeout);

      // End typing after a longer delay to allow multi-digit input
      const endTimeout = setTimeout(() => {
        isTypingRef.current = false;
      }, 2000); // 2 second timeout to end typing
      setTypingEndTimeout(endTimeout);
    }, [bufferTimeout, typingEndTimeout, commitBuffer]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle special keys (arrows, delete, backspace, etc.)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const cleared = clearSegment();
        setLocalValue(cleared.displayValue);
        setSegmentBuffer('');
        bufferRef.current = '';
        isTypingRef.current = false; // End typing state
        if (bufferTimeout) {
          clearTimeout(bufferTimeout);
          setBufferTimeout(null);
        }
        if (typingEndTimeout) {
          clearTimeout(typingEndTimeout);
          setTypingEndTimeout(null);
        }
        return;
      }

      const result = handleSegmentKeyDown(e);

      if (result.shouldNavigate && result.direction) {
        commitBuffer(true); // End typing when navigating away
        onNavigate(result.direction);
      } else if (result.shouldIncrement) {
        commitBuffer(true); // End typing when using arrows
        const newValue = handleValueIncrement(value, type, format);
        onValueChange(newValue);
      } else if (result.shouldDecrement) {
        commitBuffer(true); // End typing when using arrows
        const newValue = handleValueDecrement(value, type, format);
        onValueChange(newValue);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle character input with Chrome-like segment typing
      const char = e.key;

      if (char.length === 1) {
        e.preventDefault();

        // Set typing state when we start typing
        isTypingRef.current = true;

        const result = handleSegmentCharacterInput(char, type, segmentBuffer, format);

        if (result.shouldNavigate) {
          commitBuffer(true); // End typing when navigating
          onNavigate('right');
          return;
        }

        setSegmentBuffer(result.newBuffer);
        bufferRef.current = result.newBuffer; // Keep ref in sync
        const buffer = processSegmentBuffer(result.newBuffer, type, format.includes('a'));
        setLocalValue(buffer.displayValue);

        if (result.shouldAdvance) {
          // Commit immediately and advance
          if (buffer.actualValue !== null) {
            const committedValue = commitSegmentValue(buffer.actualValue, type);
            onValueChange(committedValue);
          }
          setSegmentBuffer('');
          bufferRef.current = '';
          isTypingRef.current = false; // End typing state on immediate commit
          if (bufferTimeout) {
            clearTimeout(bufferTimeout);
            setBufferTimeout(null);
          }
          if (typingEndTimeout) {
            clearTimeout(typingEndTimeout);
            setTypingEndTimeout(null);
          }
          onNavigate('right');
        } else {
          // Start or reset timeout
          resetBufferTimeout();
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Don't clear buffer if we're already focused and typing
      const wasAlreadyFocused = inputRef.current === document.activeElement;

      if (!wasAlreadyFocused) {
        // Clear buffer and select all text only on fresh focus
        setSegmentBuffer('');
        bufferRef.current = '';
        isTypingRef.current = false; // End typing state on fresh focus
        if (bufferTimeout) {
          clearTimeout(bufferTimeout);
          setBufferTimeout(null);
        }
        if (typingEndTimeout) {
          clearTimeout(typingEndTimeout);
          setTypingEndTimeout(null);
        }
        e.target.select();
      }

      onFocus?.();
    };

    const handleBlur = () => {
      // Commit any pending buffer and fill empty minutes with 00
      commitBuffer(true); // End typing on blur

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
