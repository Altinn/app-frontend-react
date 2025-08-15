import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import cn from 'classnames';

import styles from 'src/app-components/TimePicker/TimePicker.module.css';

export interface TimeSegmentProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  placeholder: string;
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  padZero?: boolean;
  className?: string;
}

export const TimeSegment = forwardRef<HTMLInputElement, TimeSegmentProps>(
  (
    {
      value,
      onChange,
      min,
      max,
      label,
      placeholder,
      disabled = false,
      readOnly = false,
      onFocus,
      onBlur,
      onNext,
      onPrevious,
      padZero = true,
      className,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    const displayValue = padZero ? value.toString().padStart(2, '0') : value.toString();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onChange(value >= max ? min : value + 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          onChange(value <= min ? max : value - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevious?.();
          break;
        case 'Tab':
          if (!e.shiftKey) {
            onNext?.();
          } else {
            onPrevious?.();
          }
          break;
        case 'Backspace':
          e.preventDefault();
          setInputValue('');
          break;
        default:
          break;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) {
        return;
      }

      const newValue = e.target.value;

      if (!/^\d*$/.test(newValue)) {
        return;
      }

      setInputValue(newValue);

      if (newValue.length === 2 || parseInt(newValue) * 10 > max) {
        const num = parseInt(newValue);
        if (!isNaN(num) && num >= min && num <= max) {
          onChange(num);
          setInputValue('');
          setTimeout(() => onNext?.(), 0);
        } else {
          setInputValue('');
        }
      }
    };

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (disabled || readOnly || !isFocused) {
        return;
      }

      e.preventDefault();
      if (e.deltaY < 0) {
        onChange(value >= max ? min : value + 1);
      } else {
        onChange(value <= min ? max : value - 1);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      inputRef.current?.select();
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (inputValue) {
        const num = parseInt(inputValue);
        if (!isNaN(num) && num >= min && num <= max) {
          onChange(num);
        }
        setInputValue('');
      }
      onBlur?.();
    };

    const handleClick = () => {
      inputRef.current?.select();
    };

    return (
      <input
        ref={inputRef}
        type='text'
        inputMode='numeric'
        className={cn(styles.timeSegment, className, {
          [styles.focused]: isFocused,
          [styles.disabled]: disabled,
        })}
        value={inputValue || displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={label}
        placeholder={placeholder}
        maxLength={2}
        size={2}
      />
    );
  },
);

TimeSegment.displayName = 'TimeSegment';
