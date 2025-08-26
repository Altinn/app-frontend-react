import { useCallback } from 'react';
import type React from 'react';

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
import type { TimeFormat } from 'src/app-components/TimePicker/components/TimePicker';
import type { SegmentType } from 'src/app-components/TimePicker/utils/keyboardNavigation';

interface SegmentInputConfig {
  segmentType: SegmentType;
  timeFormat: TimeFormat;
  currentValue: number | string;
  onValueChange: (value: number | string) => void;
  onNavigate: (direction: 'left' | 'right') => void;
  onUpdateDisplay: (value: string) => void;
}

export function useSegmentInputHandlers({
  segmentType,
  timeFormat,
  currentValue,
  onValueChange,
  onNavigate,
  onUpdateDisplay,
}: SegmentInputConfig) {
  const processCharacterInput = useCallback(
    (character: string, currentBuffer: string) => {
      const inputResult = handleSegmentCharacterInput(character, segmentType, currentBuffer, timeFormat);
      const bufferResult = processSegmentBuffer(inputResult.newBuffer, segmentType, timeFormat.includes('a'));

      onUpdateDisplay(bufferResult.displayValue);

      return {
        newBuffer: inputResult.newBuffer,
        shouldNavigateRight: inputResult.shouldNavigate || inputResult.shouldAdvance,
        shouldCommitImmediately: inputResult.shouldAdvance,
        processedValue: bufferResult.actualValue,
      };
    },
    [segmentType, timeFormat, onUpdateDisplay],
  );

  const commitBufferValue = useCallback(
    (bufferValue: string) => {
      if (segmentType === 'period') {
        // Period segments are handled differently - the buffer IS the final value
        onValueChange(bufferValue);
      } else {
        const processed = processSegmentBuffer(bufferValue, segmentType, timeFormat.includes('a'));
        if (processed.actualValue !== null) {
          const committedValue = commitSegmentValue(processed.actualValue, segmentType);
          onValueChange(committedValue);
        }
      }
    },
    [segmentType, timeFormat, onValueChange],
  );

  const handleArrowKeyIncrement = useCallback(() => {
    const newValue = handleValueIncrement(currentValue, segmentType, timeFormat);
    onValueChange(newValue);
  }, [currentValue, segmentType, timeFormat, onValueChange]);

  const handleArrowKeyDecrement = useCallback(() => {
    const newValue = handleValueDecrement(currentValue, segmentType, timeFormat);
    onValueChange(newValue);
  }, [currentValue, segmentType, timeFormat, onValueChange]);

  const handleDeleteOrBackspace = useCallback(() => {
    const clearedSegment = clearSegment();
    onUpdateDisplay(clearedSegment.displayValue);
  }, [onUpdateDisplay]);

  const handleArrowKeyNavigation = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const result = handleSegmentKeyDown(event);

      if (result.shouldNavigate && result.direction) {
        onNavigate(result.direction);
        return true;
      }

      if (result.shouldIncrement) {
        handleArrowKeyIncrement();
        return true;
      }

      if (result.shouldDecrement) {
        handleArrowKeyDecrement();
        return true;
      }

      return false;
    },
    [onNavigate, handleArrowKeyIncrement, handleArrowKeyDecrement],
  );

  const fillEmptyMinutesOrSecondsWithZero = useCallback(() => {
    const valueIsEmpty =
      currentValue === null || currentValue === '' || (typeof currentValue === 'number' && isNaN(currentValue));

    if (valueIsEmpty && (segmentType === 'minutes' || segmentType === 'seconds')) {
      onValueChange(0);
    }
  }, [currentValue, segmentType, onValueChange]);

  return {
    processCharacterInput,
    commitBufferValue,
    handleArrowKeyNavigation,
    handleDeleteOrBackspace,
    fillEmptyMinutesOrSecondsWithZero,
  };
}
