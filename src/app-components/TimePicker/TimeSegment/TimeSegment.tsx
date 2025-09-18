import React from 'react';

import { Textfield } from '@digdir/designsystemet-react';

import { useSegmentDisplay } from 'src/app-components/TimePicker/TimeSegment/hooks/useSegmentDisplay';
import { useSegmentInputHandlers } from 'src/app-components/TimePicker/TimeSegment/hooks/useSegmentInputHandlers';
import { useTypingBuffer } from 'src/app-components/TimePicker/TimeSegment/hooks/useTypingBuffer';
import type { TimeFormat } from 'src/app-components/TimePicker/TimePicker';
import type { SegmentType } from 'src/app-components/TimePicker/utils/keyboardNavigation';

export interface TimeSegmentProps {
  value: number | string;
  min: number;
  max: number;
  type: SegmentType;
  format: TimeFormat;
  onValueChange: (value: number | string) => void;
  onNavigate: (direction: 'left' | 'right') => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
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
      onBlur,
      placeholder,
      disabled,
      readOnly,
      required,
      'aria-label': ariaLabel,
      className,
      // autoFocus,
    },
    ref,
  ) => {
    const { displayValue, updateDisplayFromBuffer, syncWithExternalValue } = useSegmentDisplay(value, type, format);

    const inputHandlers = useSegmentInputHandlers({
      segmentType: type,
      timeFormat: format,
      currentValue: value,
      onValueChange,
      onNavigate,
      onUpdateDisplay: updateDisplayFromBuffer,
    });

    const typingBuffer = useTypingBuffer({
      onCommit: inputHandlers.commitBufferValue,
      commitDelayMs: 1000,
      typingEndDelayMs: 2000,
    });

    const syncExternalChangesWhenNotTyping = () => {
      console.log('syncExternalChangesWhenNotTyping called, isTyping:', typingBuffer.isTyping);
      if (!typingBuffer.isTyping) {
        console.log('syncing external value and resetting to idle');
        syncWithExternalValue();
        typingBuffer.resetToIdleState();
      }
    };

    React.useEffect(syncExternalChangesWhenNotTyping, [value, type, format, syncWithExternalValue, typingBuffer]);

    const handleCharacterTyping = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const character = event.key;

      if (character.length === 1) {
        event.preventDefault();

        const currentBuffer = typingBuffer.buffer;
        const inputResult = inputHandlers.processCharacterInput(character, currentBuffer);

        // Use the processed buffer result, not the raw character
        typingBuffer.replaceBuffer(inputResult.newBuffer);

        if (inputResult.shouldNavigateRight) {
          typingBuffer.commitImmediatelyAndEndTyping();
          onNavigate('right');
        }
      }
    };

    const handleSpecialKeys = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isDeleteOrBackspace = event.key === 'Delete' || event.key === 'Backspace';

      if (isDeleteOrBackspace) {
        event.preventDefault();
        inputHandlers.handleDeleteOrBackspace();
        typingBuffer.resetToIdleState();
        return;
      }

      const wasArrowKeyHandled = inputHandlers.handleArrowKeyNavigation(event);
      if (wasArrowKeyHandled) {
        typingBuffer.commitImmediatelyAndEndTyping();
      }
    };

    const handleFocusEvent = (_: React.FocusEvent<HTMLInputElement>) => {
      console.log('focus');
      // Don't reset typing buffer on focus as it causes issues
      // Let the user focus and type naturally
    };

    const handleBlurEvent = () => {
      console.log('blur');
      typingBuffer.commitImmediatelyAndEndTyping();
      inputHandlers.fillEmptyMinutesOrSecondsWithZero();
      onBlur?.();
    };

    const handleClick = (_: React.MouseEvent<HTMLInputElement>) => {
      // Ensure the input gets focus when clicked
      // event.currentTarget.focus();
    };

    return (
      <Textfield
        ref={ref}
        type='text'
        value={displayValue}
        onChange={() => {}}
        onKeyPress={handleCharacterTyping}
        onKeyDown={handleSpecialKeys}
        onFocus={handleFocusEvent}
        onBlur={handleBlurEvent}
        onClick={handleClick}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        aria-label={ariaLabel}
        className={className}
        autoFocus={false}
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
