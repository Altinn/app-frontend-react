import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Popover } from '@digdir/designsystemet-react';
import { ClockIcon } from '@navikt/aksel-icons';

import { Lang } from 'src/features/language/Lang';

import { getSegmentConstraints } from 'src/app-components/TimePicker/timeConstraintUtils';
import { formatTimeValue } from 'src/app-components/TimePicker/timeFormatUtils';
import styles from 'src/app-components/TimePicker/TimePicker.module.css';
import { TimeSegment } from 'src/app-components/TimePicker/TimeSegment';
import {
  getDropdownColumns,
  getInitialFocusedOption,
  getNextOption,
  getNextColumn,
  handleDropdownKeyDown,
} from 'src/app-components/TimePicker/dropdownNavigation';
import type { SegmentType } from 'src/app-components/TimePicker/keyboardNavigation';
import type { TimeConstraints, TimeValue } from 'src/app-components/TimePicker/timeConstraintUtils';
import type { DropdownColumn, DropdownState } from 'src/app-components/TimePicker/dropdownNavigation';

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
  const segmentRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Dropdown navigation state
  const [dropdownState, setDropdownState] = useState<DropdownState>({
    focusedColumn: 0,
    focusedOption: 0,
    isOpen: false,
  });
  
  // Refs for dropdown options to enable scrolling
  const dropdownOptionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  // Ref for the dropdown to enable focus
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Generate dropdown columns for current format
  const dropdownColumns = React.useMemo(
    () => getDropdownColumns(format, timeValue, constraints),
    [format, timeValue, constraints],
  );

  // Function to scroll focused option into view
  const scrollFocusedOptionIntoView = useCallback(() => {
    if (dropdownState.isOpen && dropdownColumns.length > 0) {
      const focusedColumn = dropdownColumns[dropdownState.focusedColumn];
      const focusedOption = focusedColumn?.options[dropdownState.focusedOption];
      
      if (focusedOption) {
        const optionKey = `${focusedColumn.type}-${dropdownState.focusedColumn}-${dropdownState.focusedOption}`;
        const optionElement = dropdownOptionRefs.current.get(optionKey);
        
        if (optionElement) {
          optionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
        }
      }
    }
  }, [dropdownState, dropdownColumns]);

  // Scroll focused option into view when focus changes
  useEffect(() => {
    scrollFocusedOptionIntoView();
  }, [scrollFocusedOptionIntoView]);

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

      // Only apply wrapping for arrow key increments/decrements (negative values or values beyond max)
      // Normal typing should not wrap - just validate
      if (segmentType === 'hours') {
        if (is12Hour) {
          // For 12-hour format, valid range is 1-12
          if (validValue < 1 || validValue > 12) {
            // Only wrap if it's from arrow keys (negative or beyond max by 1)
            if (validValue === 0) {
              validValue = 12; // Wrap 0 to 12
            } else if (validValue === 13) {
              validValue = 1; // Wrap 13 to 1
            }
            // Otherwise, it's invalid input from typing - don't update
            else {
              return;
            }
          }
        } else {
          // For 24-hour format, valid range is 0-23
          if (validValue < 0 || validValue > 23) {
            // Only wrap if it's from arrow keys
            if (validValue === -1) {
              validValue = 23; // Wrap -1 to 23
            } else if (validValue === 24) {
              validValue = 0; // Wrap 24 to 0
            }
            // Otherwise, it's invalid input from typing - don't update
            else {
              return;
            }
          }
        }
      } else if (segmentType === 'minutes' || segmentType === 'seconds') {
        if (validValue < 0 || validValue > 59) {
          // Only wrap if it's from arrow keys
          if (validValue === -1) {
            validValue = 59;
          } else if (validValue === 60) {
            validValue = 0;
          }
          // Otherwise, it's invalid input from typing - don't update
          else {
            return;
          }
        }
      }

      // Check if value is within constraints
      if (segmentConstraints.validValues.includes(validValue)) {
        updateTime({ [segmentType]: validValue });
      } else {
        // For constrained time ranges, find nearest valid value
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
      const newShowDropdown = !showDropdown;
      setShowDropdown(newShowDropdown);
      
      if (newShowDropdown && dropdownColumns.length > 0) {
        // Initialize dropdown focus state when opening - focus on currently selected values
        const initialColumn = 0; // Start with hours column
        const initialOption = getInitialFocusedOption(dropdownColumns[initialColumn]);
        
        setDropdownState({
          focusedColumn: initialColumn,
          focusedOption: initialOption,
          isOpen: true,
        });
        
        // Focus dropdown and scroll to selected option after state update
        requestAnimationFrame(() => {
          if (dropdownRef.current) {
            dropdownRef.current.focus();
          }
          scrollFocusedOptionIntoView();
        });
      } else {
        setDropdownState(prev => ({ ...prev, isOpen: false }));
      }
    }
  };

  const closeDropdown = () => {
    setShowDropdown(false);
    setDropdownState(prev => ({ ...prev, isOpen: false }));
  };

  const handleDropdownKeyEvent = (event: React.KeyboardEvent) => {
    if (!dropdownState.isOpen || dropdownColumns.length === 0) {
      return;
    }

    const result = handleDropdownKeyDown(event, dropdownState, dropdownColumns);

    if (result.shouldNavigate && result.direction) {
      // Navigate within current column and immediately update the time value
      const currentColumn = dropdownColumns[dropdownState.focusedColumn];
      const newOptionIndex = getNextOption(dropdownState.focusedOption, result.direction, currentColumn);
      const newSelectedOption = currentColumn.options[newOptionIndex];
      
      // Update focus state
      setDropdownState(prev => ({
        ...prev,
        focusedOption: newOptionIndex,
      }));
      
      // Immediately update the time value
      if (currentColumn.type === 'hours') {
        handleDropdownHoursChange(newSelectedOption.value.toString());
      } else if (currentColumn.type === 'minutes') {
        handleDropdownMinutesChange(newSelectedOption.value.toString());
      } else if (currentColumn.type === 'seconds') {
        handleDropdownSecondsChange(newSelectedOption.value.toString());
      } else if (currentColumn.type === 'period') {
        handleDropdownPeriodChange(newSelectedOption.value as 'AM' | 'PM');
      }
    } else if (result.shouldSwitchColumn && result.columnDirection) {
      // Navigate between columns
      const newColumnIndex = getNextColumn(dropdownState.focusedColumn, result.columnDirection, dropdownColumns.length);
      const newColumn = dropdownColumns[newColumnIndex];
      const newOptionIndex = getInitialFocusedOption(newColumn);
      
      setDropdownState(prev => ({
        ...prev,
        focusedColumn: newColumnIndex,
        focusedOption: newOptionIndex,
      }));
    } else if (result.shouldSelect) {
      // Enter key just closes the dropdown since values update automatically
      closeDropdown();
    } else if (result.shouldClose) {
      closeDropdown();
    }
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
          ref={dropdownRef}
          className={styles.timePickerDropdown}
          aria-modal
          aria-hidden={!showDropdown}
          role='dialog'
          open={showDropdown}
          data-size='lg'
          placement='bottom'
          autoFocus={true}
          tabIndex={-1}
          onClose={closeDropdown}
          onKeyDown={handleDropdownKeyEvent}
        >
          <div className={styles.dropdownColumns}>
            {dropdownColumns.map((column, columnIndex) => (
              <div key={column.type} className={styles.dropdownColumn}>
                <div className={styles.dropdownLabel}>
                  <Lang 
                    id={
                      column.type === 'hours' ? 'time_picker.hours_label' : 
                      column.type === 'minutes' ? 'time_picker.minutes_label' : 
                      column.type === 'seconds' ? 'time_picker.seconds_label' : 
                      'time_picker.period_label'
                    } 
                  />
                </div>
                <div className={styles.dropdownList}>
                  {column.options.map((option, optionIndex) => {
                    const isSelected = option.value === column.selectedValue;
                    const isFocused = dropdownState.focusedColumn === columnIndex && 
                                     dropdownState.focusedOption === optionIndex;
                    const isDisabled = option.disabled || false;

                    const optionKey = `${column.type}-${columnIndex}-${optionIndex}`;
                    
                    return (
                      <button
                        key={`${column.type}-${option.value}`}
                        ref={(el) => {
                          if (el) {
                            dropdownOptionRefs.current.set(optionKey, el);
                          } else {
                            dropdownOptionRefs.current.delete(optionKey);
                          }
                        }}
                        type='button'
                        className={`${styles.dropdownOption} ${
                          isSelected ? styles.dropdownOptionSelected : ''
                        } ${isFocused ? styles.dropdownOptionFocused : ''} ${
                          isDisabled ? styles.dropdownOptionDisabled : ''
                        }`}
                        onClick={() => {
                          if (!isDisabled) {
                            if (column.type === 'hours') {
                              handleDropdownHoursChange(option.value.toString());
                            } else if (column.type === 'minutes') {
                              handleDropdownMinutesChange(option.value.toString());
                            } else if (column.type === 'seconds') {
                              handleDropdownSecondsChange(option.value.toString());
                            } else if (column.type === 'period') {
                              handleDropdownPeriodChange(option.value as 'AM' | 'PM');
                            }
                          }
                        }}
                        disabled={isDisabled}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Popover>
      </Popover.TriggerContext>
    </div>
  );
};
