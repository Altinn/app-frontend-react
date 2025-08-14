import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Popover, Textfield } from '@digdir/designsystemet-react';
import { ClockIcon } from '@navikt/aksel-icons';

import styles from 'src/app-components/TimePicker/TimePicker.module.css';

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
  'aria-label': string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-labelledby'?: never;
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
  'aria-labelledby': ariaLabelledby,
}) => {
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [timeValue, setTimeValue] = useState<TimeValue>(() => parseTimeString(value, format));
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const toggleDropdown = () => {
    if (!disabled && !readOnly) {
      setShowDropdown(!showDropdown);
    }
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  if (isMobile) {
    return (
      <Textfield
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
        aria-labelledby={ariaLabelledby}
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

  // Generate hour options for dropdown
  const hourOptions = is12Hour
    ? Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: (i + 1).toString().padStart(2, '0') }))
    : Array.from({ length: 24 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') }));

  // Generate minute options for dropdown
  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') }));

  // Generate second options for dropdown
  const secondOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') }));

  const handleDropdownHoursChange = (selectedHour: string) => {
    const hour = parseInt(selectedHour, 10);
    if (is12Hour) {
      let newHour = hour === 12 ? 0 : hour;
      if (timeValue.period === 'PM') {
        newHour += 12;
      }
      updateTime({ hours: newHour });
    } else {
      updateTime({ hours: hour });
    }
  };

  const handleDropdownMinutesChange = (selectedMinute: string) => {
    updateTime({ minutes: parseInt(selectedMinute, 10) });
  };

  const handleDropdownSecondsChange = (selectedSecond: string) => {
    updateTime({ seconds: parseInt(selectedSecond, 10) });
  };

  const handleDropdownPeriodChange = (period: 'AM' | 'PM') => {
    let newHours = timeValue.hours;
    if (period === 'PM' && timeValue.hours < 12) {
      newHours += 12;
    } else if (period === 'AM' && timeValue.hours >= 12) {
      newHours -= 12;
    }
    updateTime({ period, hours: newHours });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsedTime = parseTimeString(inputValue, format);
    setTimeValue(parsedTime);
    onChange(formatTimeValue(parsedTime, format));
  };

  return (
    <div className={styles.calendarInputWrapper}>
      <Textfield
        ref={inputRef}
        data-size='sm'
        className={styles.calendarInput}
        type='text'
        id={id}
        value={formatTimeValue(timeValue, format)}
        placeholder={format.toUpperCase()}
        onChange={handleInputChange}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        autoComplete={autoComplete}
      />
      <Popover.TriggerContext>
        <Popover.Trigger
          variant='tertiary'
          icon
          onClick={toggleDropdown}
          aria-label='Open time picker'
          disabled={disabled || readOnly}
          data-size='sm'
        >
          <ClockIcon />
        </Popover.Trigger>
        <Popover
          className={styles.timePickerDropdown}
          aria-modal
          aria-hidden={!showDropdown}
          role='dialog'
          open={showDropdown}
          data-size='lg'
          placement='bottom'
          autoFocus={true}
          onClose={closeDropdown}
        >
          <div className={styles.dropdownColumns}>
            {/* Hours Column */}
            <div className={styles.dropdownColumn}>
              <div className={styles.dropdownLabel}>Timer</div>
              <div className={styles.dropdownList}>
                {hourOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    className={`${styles.dropdownOption} ${
                      option.value === displayHours ? styles.dropdownOptionSelected : ''
                    }`}
                    onClick={() => handleDropdownHoursChange(option.value.toString())}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className={styles.dropdownColumn}>
              <div className={styles.dropdownLabel}>Minutter</div>
              <div className={styles.dropdownList}>
                {minuteOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    className={`${styles.dropdownOption} ${
                      option.value === timeValue.minutes ? styles.dropdownOptionSelected : ''
                    }`}
                    onClick={() => handleDropdownMinutesChange(option.value.toString())}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seconds Column (if included) */}
            {includesSeconds && (
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownLabel}>Sekunder</div>
                <div className={styles.dropdownList}>
                  {secondOptions.map((option) => (
                    <button
                      key={option.value}
                      type='button'
                      className={`${styles.dropdownOption} ${
                        option.value === timeValue.seconds ? styles.dropdownOptionSelected : ''
                      }`}
                      onClick={() => handleDropdownSecondsChange(option.value.toString())}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AM/PM Column (if 12-hour format) */}
            {is12Hour && (
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownLabel}>AM/PM</div>
                <div className={styles.dropdownList}>
                  <button
                    type='button'
                    className={`${styles.dropdownOption} ${
                      timeValue.period === 'AM' ? styles.dropdownOptionSelected : ''
                    }`}
                    onClick={() => handleDropdownPeriodChange('AM')}
                  >
                    AM
                  </button>
                  <button
                    type='button'
                    className={`${styles.dropdownOption} ${
                      timeValue.period === 'PM' ? styles.dropdownOptionSelected : ''
                    }`}
                    onClick={() => handleDropdownPeriodChange('PM')}
                  >
                    PM
                  </button>
                </div>
              </div>
            )}
          </div>
        </Popover>
      </Popover.TriggerContext>
    </div>
  );
};
