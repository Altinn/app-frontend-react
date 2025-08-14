import React, { useCallback, useEffect, useRef, useState } from 'react';

import styles from 'src/app-components/TimePicker/TimePicker.module.css';
import { TimeSegment } from 'src/app-components/TimePicker/TimeSegment';

export type TimeFormat = 'HH:mm' | 'HH:mm:ss' | 'hh:mm a' | 'hh:mm:ss a';

export interface TimePickerProps {
  id: string;
  value: string;
  onChange: (time: string) => void;
  format?: TimeFormat;
  minTime?: string;
  maxTime?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoComplete?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

interface TimeValue {
  hours: number;
  minutes: number;
  seconds: number;
  period: 'AM' | 'PM';
}

const parseTimeString = (timeStr: string, format: TimeFormat): TimeValue => {
  const defaultValue: TimeValue = { hours: 0, minutes: 0, seconds: 0, period: 'AM' };

  if (!timeStr) {
    return defaultValue;
  }

  const is12Hour = format.includes('a');
  const includesSeconds = format.includes('ss');

  const parts = timeStr.replace(/\s*(AM|PM)/i, '').split(':');
  const periodMatch = timeStr.match(/(AM|PM)/i);

  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const seconds = includesSeconds ? parseInt(parts[2] || '0', 10) : 0;
  const period = periodMatch ? (periodMatch[1].toUpperCase() as 'AM' | 'PM') : 'AM';

  return {
    hours: isNaN(hours) ? 0 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
    seconds: isNaN(seconds) ? 0 : seconds,
    period: is12Hour ? period : 'AM',
  };
};

const formatTimeValue = (time: TimeValue, format: TimeFormat): string => {
  const is12Hour = format.includes('a');
  const includesSeconds = format.includes('ss');

  let displayHours = time.hours;

  if (is12Hour) {
    if (displayHours === 0) {
      displayHours = 12;
    } else if (displayHours > 12) {
      displayHours -= 12;
    }
  }

  const hoursStr = displayHours.toString().padStart(2, '0');
  const minutesStr = time.minutes.toString().padStart(2, '0');
  const secondsStr = includesSeconds ? `:${time.seconds.toString().padStart(2, '0')}` : '';
  const periodStr = is12Hour ? ` ${time.period}` : '';

  return `${hoursStr}:${minutesStr}${secondsStr}${periodStr}`;
};

const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

  return isMobile || isSmallScreen;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  id,
  value,
  onChange,
  format = 'HH:mm',
  minTime: _minTime,
  maxTime: _maxTime,
  disabled = false,
  readOnly = false,
  required = false,
  autoComplete,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}) => {
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [timeValue, setTimeValue] = useState<TimeValue>(() => parseTimeString(value, format));
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);
  const periodRef = useRef<HTMLButtonElement>(null);

  const is12Hour = format.includes('a');
  const includesSeconds = format.includes('ss');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTimeValue(parseTimeString(value, format));
  }, [value, format]);

  const updateTime = useCallback(
    (updates: Partial<TimeValue>) => {
      const newTime = { ...timeValue, ...updates };
      setTimeValue(newTime);
      onChange(formatTimeValue(newTime, format));
    },
    [timeValue, onChange, format],
  );

  const handleHoursChange = (hours: number) => {
    if (is12Hour) {
      updateTime({ hours: hours || 12 });
    } else {
      updateTime({ hours });
    }
  };

  const handleMinutesChange = (minutes: number) => {
    updateTime({ minutes });
  };

  const handleSecondsChange = (seconds: number) => {
    updateTime({ seconds });
  };

  const togglePeriod = () => {
    const newPeriod = timeValue.period === 'AM' ? 'PM' : 'AM';
    let newHours = timeValue.hours;

    if (newPeriod === 'PM' && timeValue.hours < 12) {
      newHours += 12;
    } else if (newPeriod === 'AM' && timeValue.hours >= 12) {
      newHours -= 12;
    }

    updateTime({ period: newPeriod, hours: newHours });
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (isMobile) {
    return (
      <input
        id={id}
        type='time'
        value={value}
        onChange={handleNativeChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={styles.nativeInput}
      />
    );
  }

  const displayHours = is12Hour
    ? timeValue.hours === 0
      ? 12
      : timeValue.hours > 12
        ? timeValue.hours - 12
        : timeValue.hours
    : timeValue.hours;

  return (
    <div
      className={styles.timePickerContainer}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
    >
      <div className={styles.timeSegments}>
        <TimeSegment
          ref={hourRef}
          value={displayHours}
          onChange={handleHoursChange}
          min={is12Hour ? 1 : 0}
          max={is12Hour ? 12 : 23}
          label='Hours'
          placeholder='HH'
          disabled={disabled}
          readOnly={readOnly}
          onNext={() => minuteRef.current?.focus()}
        />

        <span className={styles.separator}>:</span>

        <TimeSegment
          ref={minuteRef}
          value={timeValue.minutes}
          onChange={handleMinutesChange}
          min={0}
          max={59}
          label='Minutes'
          placeholder='MM'
          disabled={disabled}
          readOnly={readOnly}
          onPrevious={() => hourRef.current?.focus()}
          onNext={() => (includesSeconds ? secondRef.current?.focus() : periodRef.current?.focus())}
        />

        {includesSeconds && (
          <>
            <span className={styles.separator}>:</span>
            <TimeSegment
              ref={secondRef}
              value={timeValue.seconds}
              onChange={handleSecondsChange}
              min={0}
              max={59}
              label='Seconds'
              placeholder='SS'
              disabled={disabled}
              readOnly={readOnly}
              onPrevious={() => minuteRef.current?.focus()}
              onNext={() => periodRef.current?.focus()}
            />
          </>
        )}

        {is12Hour && (
          <button
            ref={periodRef}
            type='button'
            className={styles.periodToggle}
            onClick={togglePeriod}
            disabled={disabled || readOnly}
            aria-label='Toggle AM/PM'
            tabIndex={0}
          >
            {timeValue.period}
          </button>
        )}
      </div>
    </div>
  );
};
