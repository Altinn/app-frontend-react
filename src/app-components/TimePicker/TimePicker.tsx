import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Popover } from '@digdir/designsystemet-react';
import { ClockIcon } from '@navikt/aksel-icons';

import { getSegmentConstraints } from 'src/app-components/TimePicker/timeConstraintUtils';
import { formatTimeValue } from 'src/app-components/TimePicker/timeFormatUtils';
import styles from 'src/app-components/TimePicker/TimePicker.module.css';
import { TimeSegment } from 'src/app-components/TimePicker/TimeSegment';
import type { SegmentType } from 'src/app-components/TimePicker/keyboardNavigation';
import type { TimeConstraints, TimeValue } from 'src/app-components/TimePicker/timeConstraintUtils';

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

  let actualHours = isNaN(hours) ? 0 : hours;

  if (is12Hour && !isNaN(hours)) {
    // Parse 12-hour format properly
    if (period === 'AM' && actualHours === 12) {
      actualHours = 0;
    } else if (period === 'PM' && actualHours !== 12) {
      actualHours += 12;
    }
  }

  return {
    hours: actualHours,
    minutes: isNaN(minutes) ? 0 : minutes,
    seconds: isNaN(seconds) ? 0 : seconds,
    period: is12Hour ? period : 'AM',
  };
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
  minTime,
  maxTime,
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [_focusedSegment, setFocusedSegment] = useState<number | null>(null);
  const [highlightedHour, setHighlightedHour] = useState<number | null>(null);
  const [highlightedMinute, setHighlightedMinute] = useState<number | null>(null);
  const [highlightedSecond, setHighlightedSecond] = useState<number | null>(null);
  const [focusedColumn, setFocusedColumn] = useState<'hours' | 'minutes' | 'seconds' | 'period' | null>(null);
  const segmentRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hoursListRef = useRef<HTMLDivElement | null>(null);
  const minutesListRef = useRef<HTMLDivElement | null>(null);
  const secondsListRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const is12Hour = format.includes('a');
  const includesSeconds = format.includes('ss');

  // Define segments based on format
  const segments: SegmentType[] = ['hours', 'minutes'];
  if (includesSeconds) {
    segments.push('seconds');
  }
  if (is12Hour) {
    segments.push('period');
  }

  const constraints: TimeConstraints = {
    minTime,
    maxTime,
  };

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

  // Scroll to selected options when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        // Scroll hours into view
        if (hoursListRef.current) {
          const selectedHour = hoursListRef.current.querySelector(`.${styles.dropdownOptionSelected}`);
          if (selectedHour) {
            const container = hoursListRef.current;
            const elementTop = (selectedHour as HTMLElement).offsetTop;
            const elementHeight = (selectedHour as HTMLElement).offsetHeight;
            const containerHeight = container.offsetHeight;

            // Center the selected item in the container
            container.scrollTop = elementTop - containerHeight / 2 + elementHeight / 2;
          }
        }

        // Scroll minutes into view
        if (minutesListRef.current) {
          const selectedMinute = minutesListRef.current.querySelector(`.${styles.dropdownOptionSelected}`);
          if (selectedMinute) {
            const container = minutesListRef.current;
            const elementTop = (selectedMinute as HTMLElement).offsetTop;
            const elementHeight = (selectedMinute as HTMLElement).offsetHeight;
            const containerHeight = container.offsetHeight;

            container.scrollTop = elementTop - containerHeight / 2 + elementHeight / 2;
          }
        }

        // Scroll seconds into view
        if (secondsListRef.current) {
          const selectedSecond = secondsListRef.current.querySelector(`.${styles.dropdownOptionSelected}`);
          if (selectedSecond) {
            const container = secondsListRef.current;
            const elementTop = (selectedSecond as HTMLElement).offsetTop;
            const elementHeight = (selectedSecond as HTMLElement).offsetHeight;
            const containerHeight = container.offsetHeight;

            container.scrollTop = elementTop - containerHeight / 2 + elementHeight / 2;
          }
        }
      }, 0);
    }
  }, [showDropdown]);

  const updateTime = useCallback(
    (updates: Partial<TimeValue>) => {
      const newTime = { ...timeValue, ...updates };
      setTimeValue(newTime);
      onChange(formatTimeValue(newTime, format));
    },
    [timeValue, onChange, format],
  );

  const handleSegmentValueChange = (segmentType: SegmentType, newValue: number | string) => {
    if (segmentType === 'period') {
      const period = newValue as 'AM' | 'PM';
      let newHours = timeValue.hours;

      // Adjust hours when period changes
      if (period === 'PM' && timeValue.hours < 12) {
        newHours += 12;
      } else if (period === 'AM' && timeValue.hours >= 12) {
        newHours -= 12;
      }

      updateTime({ period, hours: newHours });
    } else {
      // Apply constraints for numeric segments
      const segmentConstraints = getSegmentConstraints(segmentType, timeValue, constraints, format);
      let validValue = newValue as number;

      // Handle increment/decrement with wrapping
      if (segmentType === 'hours') {
        if (is12Hour) {
          if (validValue > 12) {
            validValue = 1;
          }
          if (validValue < 1) {
            validValue = 12;
          }
        } else {
          if (validValue > 23) {
            validValue = 0;
          }
          if (validValue < 0) {
            validValue = 23;
          }
        }
      } else if (segmentType === 'minutes' || segmentType === 'seconds') {
        if (validValue > 59) {
          validValue = 0;
        }
        if (validValue < 0) {
          validValue = 59;
        }
      }

      // Check if value is within constraints
      if (segmentConstraints.validValues.includes(validValue)) {
        updateTime({ [segmentType]: validValue });
      } else {
        // Find nearest valid value
        const nearestValid = segmentConstraints.validValues.reduce((prev, curr) =>
          Math.abs(curr - validValue) < Math.abs(prev - validValue) ? curr : prev,
        );
        updateTime({ [segmentType]: nearestValid });
      }
    }
  };

  const handleSegmentNavigate = (direction: 'left' | 'right', currentIndex: number) => {
    let nextIndex = currentIndex;

    if (direction === 'right') {
      nextIndex = (currentIndex + 1) % segments.length;
    } else {
      nextIndex = (currentIndex - 1 + segments.length) % segments.length;
    }

    segmentRefs.current[nextIndex]?.focus();
    setFocusedSegment(nextIndex);
  };

  const toggleDropdown = () => {
    if (!disabled && !readOnly) {
      setShowDropdown(!showDropdown);
    }
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  // Mobile: Use native time input
  if (isMobile) {
    const mobileValue = `${String(timeValue.hours).padStart(2, '0')}:${String(timeValue.minutes).padStart(2, '0')}`;

    return (
      <div className={styles.calendarInputWrapper}>
        <input
          type='time'
          id={id}
          value={mobileValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          className={styles.nativeInput}
        />
      </div>
    );
  }

  // Get display values for segments
  const displayHours = is12Hour
    ? timeValue.hours === 0
      ? 12
      : timeValue.hours > 12
        ? timeValue.hours - 12
        : timeValue.hours
    : timeValue.hours;

  // Generate options for dropdown
  const hourOptions = is12Hour
    ? Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: (i + 1).toString().padStart(2, '0') }))
    : Array.from({ length: 24 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') }));
  const secondOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') }));

  const handleDropdownHoursChange = (selectedHour: string) => {
    const hour = parseInt(selectedHour, 10);
    if (is12Hour) {
      let newHour = hour;
      if (timeValue.period === 'AM' && hour === 12) {
        newHour = 0;
      } else if (timeValue.period === 'PM' && hour !== 12) {
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

  return (
    <div className={styles.calendarInputWrapper}>
      <div className={styles.segmentContainer}>
        {segments.map((segmentType, index) => {
          const segmentValue = segmentType === 'period' ? timeValue.period : timeValue[segmentType];
          const segmentConstraints =
            segmentType !== 'period'
              ? getSegmentConstraints(segmentType as 'hours' | 'minutes' | 'seconds', timeValue, constraints, format)
              : { min: 0, max: 0, validValues: [] };

          return (
            <React.Fragment key={segmentType}>
              {index > 0 && segmentType !== 'period' && <span className={styles.segmentSeparator}>:</span>}
              {index > 0 && segmentType === 'period' && <span className={styles.segmentSeparator}>&nbsp;</span>}
              <TimeSegment
                ref={(el) => {
                  segmentRefs.current[index] = el;
                }}
                value={segmentValue}
                min={segmentConstraints.min}
                max={segmentConstraints.max}
                type={segmentType}
                format={format}
                onValueChange={(newValue) => handleSegmentValueChange(segmentType, newValue)}
                onNavigate={(direction) => handleSegmentNavigate(direction, index)}
                onFocus={() => setFocusedSegment(index)}
                onBlur={() => setFocusedSegment(null)}
                placeholder={
                  segmentType === 'hours'
                    ? 'HH'
                    : segmentType === 'minutes'
                      ? 'MM'
                      : segmentType === 'seconds'
                        ? 'SS'
                        : 'AM'
                }
                disabled={disabled}
                readOnly={readOnly}
                aria-label={`${ariaLabel} ${segmentType}`}
                autoFocus={index === 0}
              />
            </React.Fragment>
          );
        })}
      </div>

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
              <div
                className={styles.dropdownList}
                ref={hoursListRef}
              >
                {hourOptions.map((option) => {
                  const isDisabled =
                    constraints.minTime || constraints.maxTime
                      ? !getSegmentConstraints('hours', timeValue, constraints, format).validValues.includes(
                          is12Hour
                            ? option.value === 12
                              ? timeValue.period === 'AM'
                                ? 0
                                : 12
                              : timeValue.period === 'PM' && option.value !== 12
                                ? option.value + 12
                                : option.value
                            : option.value,
                        )
                      : false;

                  return (
                    <button
                      key={option.value}
                      type='button'
                      className={`${styles.dropdownOption} ${
                        option.value === displayHours ? styles.dropdownOptionSelected : ''
                      } ${isDisabled ? styles.dropdownOptionDisabled : ''}`}
                      onClick={() => !isDisabled && handleDropdownHoursChange(option.value.toString())}
                      disabled={isDisabled}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div className={styles.dropdownColumn}>
              <div className={styles.dropdownLabel}>Minutter</div>
              <div
                className={styles.dropdownList}
                ref={minutesListRef}
              >
                {minuteOptions.map((option) => {
                  const isDisabled =
                    constraints.minTime || constraints.maxTime
                      ? !getSegmentConstraints('minutes', timeValue, constraints, format).validValues.includes(
                          option.value,
                        )
                      : false;

                  return (
                    <button
                      key={option.value}
                      type='button'
                      className={`${styles.dropdownOption} ${
                        option.value === timeValue.minutes ? styles.dropdownOptionSelected : ''
                      } ${isDisabled ? styles.dropdownOptionDisabled : ''}`}
                      onClick={() => !isDisabled && handleDropdownMinutesChange(option.value.toString())}
                      disabled={isDisabled}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seconds Column (if included) */}
            {includesSeconds && (
              <div className={styles.dropdownColumn}>
                <div className={styles.dropdownLabel}>Sekunder</div>
                <div
                  className={styles.dropdownList}
                  ref={secondsListRef}
                >
                  {secondOptions.map((option) => {
                    const isDisabled =
                      constraints.minTime || constraints.maxTime
                        ? !getSegmentConstraints('seconds', timeValue, constraints, format).validValues.includes(
                            option.value,
                          )
                        : false;

                    return (
                      <button
                        key={option.value}
                        type='button'
                        className={`${styles.dropdownOption} ${
                          option.value === timeValue.seconds ? styles.dropdownOptionSelected : ''
                        } ${isDisabled ? styles.dropdownOptionDisabled : ''}`}
                        onClick={() => !isDisabled && handleDropdownSecondsChange(option.value.toString())}
                        disabled={isDisabled}
                      >
                        {option.label}
                      </button>
                    );
                  })}
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
