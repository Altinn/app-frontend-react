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
import type { TimeFormat } from 'src/app-components/TimePicker/TimePicker';
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
  function incrementCurrentValue() {
    const newValue = handleValueIncrement(currentValue, segmentType, timeFormat);
    onValueChange(newValue);
  }

  function decrementCurrentValue() {
    const newValue = handleValueDecrement(currentValue, segmentType, timeFormat);
    onValueChange(newValue);
  }

  function clearCurrentValueAndDisplay() {
    const clearedSegment = clearSegment();
    onUpdateDisplay(clearedSegment.displayValue);
    if (clearedSegment.actualValue) {
      const committedValue = commitSegmentValue(clearedSegment.actualValue, segmentType);
      onValueChange(committedValue);
    }
  }

  function fillEmptyTimeSegmentWithZero() {
    const valueIsEmpty =
      currentValue === null || currentValue === '' || (typeof currentValue === 'number' && isNaN(currentValue));

    if (valueIsEmpty && (segmentType === 'minutes' || segmentType === 'seconds')) {
      onValueChange(0);
    }
  }

  function processCharacterInput(character: string, currentBuffer: string) {
    const inputResult = handleSegmentCharacterInput(character, segmentType, currentBuffer, timeFormat);
    const bufferResult = processSegmentBuffer(inputResult.newBuffer, segmentType, timeFormat.includes('a'));

    onUpdateDisplay(bufferResult.displayValue);

    return {
      newBuffer: inputResult.newBuffer,
      shouldNavigateRight: inputResult.shouldNavigate || inputResult.shouldAdvance,
      shouldCommitImmediately: inputResult.shouldAdvance,
      processedValue: bufferResult.actualValue,
    };
  }

  function commitBufferValue(bufferValue: string) {
    if (segmentType === 'period') {
      onValueChange(bufferValue);
      return;
    }

    const processed = processSegmentBuffer(bufferValue, segmentType, timeFormat.includes('a'));
    if (processed.actualValue !== null) {
      const committedValue = commitSegmentValue(processed.actualValue, segmentType);
      onValueChange(committedValue);
    }
  }

  function handleArrowKeyNavigation(event: React.KeyboardEvent<HTMLInputElement>) {
    const result = handleSegmentKeyDown(event);

    if (result.shouldNavigate && result.direction) {
      onNavigate(result.direction);
      return true;
    }

    if (result.shouldIncrement) {
      incrementCurrentValue();
      return true;
    }

    if (result.shouldDecrement) {
      decrementCurrentValue();
      return true;
    }

    return false;
  }

  function handleDeleteOrBackspace() {
    clearCurrentValueAndDisplay();
  }

  function fillEmptyMinutesOrSecondsWithZero() {
    fillEmptyTimeSegmentWithZero();
  }

  return {
    processCharacterInput,
    commitBufferValue,
    handleArrowKeyNavigation,
    handleDeleteOrBackspace,
    fillEmptyMinutesOrSecondsWithZero,
  };
}
