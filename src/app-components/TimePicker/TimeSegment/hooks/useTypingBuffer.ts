import { useCallback, useRef, useState } from 'react';

import { useTimeout } from 'src/app-components/TimePicker/TimeSegment/hooks/useTimeout';

interface TypingBufferConfig {
  onCommit: (buffer: string) => void;
  commitDelayMs: number;
  typingEndDelayMs: number;
}

export function useTypingBuffer({ onCommit, commitDelayMs, typingEndDelayMs }: TypingBufferConfig) {
  const [buffer, setBuffer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bufferRef = useRef('');

  const commitTimer = useTimeout(() => commitBufferWithoutEndingTyping(), commitDelayMs);
  const typingEndTimer = useTimeout(() => setIsTyping(false), typingEndDelayMs);

  const clearBuffer = useCallback(() => {
    setBuffer('');
    bufferRef.current = '';
  }, []);

  const commitBufferWithoutEndingTyping = useCallback(() => {
    const currentBuffer = bufferRef.current;
    if (currentBuffer) {
      onCommit(currentBuffer);
      clearBuffer();
    }
  }, [clearBuffer, onCommit]);

  const clearAllTimers = useCallback(() => {
    commitTimer.clear();
    typingEndTimer.clear();
  }, [commitTimer, typingEndTimer]);

  const restartTimers = useCallback(() => {
    clearAllTimers();
    commitTimer.start();
    typingEndTimer.start();
  }, [clearAllTimers, commitTimer, typingEndTimer]);

  const addCharacterToBuffer = useCallback(
    (char: string) => {
      const newBuffer = bufferRef.current + char;
      setBuffer(newBuffer);
      bufferRef.current = newBuffer;
      setIsTyping(true);

      restartTimers();

      return newBuffer;
    },
    [restartTimers],
  );

  const commitImmediatelyAndEndTyping = useCallback(() => {
    commitBufferWithoutEndingTyping();
    setIsTyping(false);
    clearAllTimers();
  }, [commitBufferWithoutEndingTyping, clearAllTimers]);

  const resetToIdleState = useCallback(() => {
    clearBuffer();
    setIsTyping(false);
    clearAllTimers();
  }, [clearBuffer, clearAllTimers]);

  const replaceBuffer = useCallback(
    (newBuffer: string) => {
      setBuffer(newBuffer);
      bufferRef.current = newBuffer;
      setIsTyping(true);

      restartTimers();
    },
    [restartTimers],
  );

  return {
    buffer,
    isTyping,
    addCharacterToBuffer,
    replaceBuffer,
    commitImmediatelyAndEndTyping,
    resetToIdleState,
  };
}
