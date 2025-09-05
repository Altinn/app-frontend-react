import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Popover } from '@digdir/designsystemet-react';
import { ClockIcon } from '@navikt/aksel-icons';

import styles from 'src/app-components/TimePicker/components/TimePicker.module.css';
import { TimeSegment } from 'src/app-components/TimePicker/components/TimeSegment';
import { calculateNextFocusState } from 'src/app-components/TimePicker/functions/calculateNextFocusState/calculateNextFocusState';
import { formatDisplayHour } from 'src/app-components/TimePicker/functions/formatDisplayHour/formatDisplayHour';
import {
  generateHourOptions,
  generateMinuteOptions,
  generateSecondOptions,
} from 'src/app-components/TimePicker/functions/generateTimeOptions/generateTimeOptions';
import { handleSegmentValueChange } from 'src/app-components/TimePicker/functions/handleSegmentValueChange/handleSegmentValueChange';
import { getSegmentConstraints, parseTimeString } from 'src/app-components/TimePicker/utils/timeConstraintUtils';
import { formatTimeValue } from 'src/app-components/TimePicker/utils/timeFormatUtils';
import type {
  DropdownFocusState,
  NavigationAction,
} from 'src/app-components/TimePicker/functions/calculateNextFocusState/calculateNextFocusState';
import type { SegmentType } from 'src/app-components/TimePicker/utils/keyboardNavigation';
import type { TimeConstraints, TimeValue } from 'src/app-components/TimePicker/utils/timeConstraintUtils';

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
  labels?: {
    hours?: string;
    minutes?: string;
    seconds?: string;
    amPm?: string;
  };
}

export const TimePicker: React.FC<TimePickerProps> = ({
  id,
  value,
  onChange,
  format = 'HH:mm',
  minTime,
  maxTime,
  disabled = false,
  readOnly = false,

  labels = {},
}) => {
  const [timeValue, setTimeValue] = useState<TimeValue>(() => parseTimeString(value, format));
  const [showDropdown, setShowDropdown] = useState(false);
  const [_focusedSegment, setFocusedSegment] = useState<number | null>(null);

  // Dropdown keyboard navigation state
  const [dropdownFocus, setDropdownFocus] = useState<DropdownFocusState>({
    column: 0, // 0=hours, 1=minutes, 2=seconds, 3=period
    option: -1, // index within current column, -1 means no focus
    isActive: false, // is keyboard navigation active
  });

  const segmentRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hoursListRef = useRef<HTMLDivElement | null>(null);
  const minutesListRef = useRef<HTMLDivElement | null>(null);
  const secondsListRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

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

  // Segment labels and placeholders
  const segmentLabels = {
    hours: labels.hours || 'Hours',
    minutes: labels.minutes || 'Minutes',
    seconds: labels.seconds || 'Seconds',
    period: labels.amPm || 'AM/PM',
  };

  const segmentPlaceholders = {
    hours: 'HH',
    minutes: 'MM',
    seconds: 'SS',
    period: 'AM',
  };

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

  const handleSegmentChange = (segmentType: SegmentType, newValue: number | string) => {
    const segmentConstraints =
      segmentType !== 'period'
        ? getSegmentConstraints(segmentType, timeValue, constraints, format)
        : { min: 0, max: 0, validValues: [] };

    const result = handleSegmentValueChange(segmentType, newValue, timeValue, segmentConstraints, is12Hour);

    updateTime(result.updatedTimeValue);
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

      if (newShowDropdown) {
        // Initialize dropdown focus on the currently selected hour
        const currentHourIndex = hourOptions.findIndex((option) => option.value === displayHours);
        setDropdownFocus({
          column: 0, // Start with hours column
          option: Math.max(0, currentHourIndex),
          isActive: true,
        });

        // Focus the dropdown after a small delay to ensure it's rendered
        setTimeout(() => {
          dropdownRef.current?.focus();
        }, 10);
      }
    }
  };

  const closeDropdown = () => {
    setShowDropdown(false);
    setDropdownFocus({ column: 0, option: -1, isActive: false });
  };

  const closeDropdownAndRestoreFocus = () => {
    closeDropdown();
    // Restore focus to the trigger button
    setTimeout(() => {
      triggerButtonRef.current?.focus();
    }, 10);
  };

  // Scroll focused option into view
  const scrollFocusedOptionIntoView = (columnIndex: number, optionIndex: number) => {
    const getContainerRef = () => {
      switch (columnIndex) {
        case 0:
          return hoursListRef.current;
        case 1:
          return minutesListRef.current;
        case 2:
          return includesSeconds ? secondsListRef.current : null; // AM/PM doesn't need scrolling
        case 3:
          return null; // AM/PM doesn't need scrolling
        default:
          return null;
      }
    };

    const container = getContainerRef();
    if (!container) {
      return;
    }

    // Find the focused option element
    const options = container.children;
    const focusedOption = options[optionIndex] as HTMLElement;

    if (focusedOption && focusedOption.scrollIntoView) {
      focusedOption.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  // Helper function to get current column options
  const getCurrentColumnOptions = (columnIndex: number) => {
    switch (columnIndex) {
      case 0:
        return hourOptions;
      case 1:
        return minuteOptions;
      case 2:
        return includesSeconds ? secondOptions : is12Hour ? [{ value: 'AM' }, { value: 'PM' }] : [];
      case 3:
        return is12Hour && includesSeconds ? [{ value: 'AM' }, { value: 'PM' }] : [];
      default:
        return [];
    }
  };

  // Helper function to handle value updates for different columns
  const updateColumnValue = (columnIndex: number, optionIndex: number) => {
    const options = getCurrentColumnOptions(columnIndex);
    const option = options[optionIndex];
    if (!option) {
      return;
    }

    switch (columnIndex) {
      case 0: // Hours
        handleDropdownHoursChange(option.value.toString());
        break;
      case 1: // Minutes
        handleDropdownMinutesChange(option.value.toString());
        break;
      case 2: // Seconds or AM/PM (if no seconds)
        if (includesSeconds) {
          handleDropdownSecondsChange(option.value.toString());
        } else if (is12Hour) {
          handleDropdownPeriodChange(option.value as 'AM' | 'PM');
        }
        break;
      case 3: // AM/PM (if seconds included)
        if (is12Hour && includesSeconds) {
          handleDropdownPeriodChange(option.value as 'AM' | 'PM');
        }
        break;
    }
  };

  // Get column option counts for navigation
  const getOptionCounts = (): number[] => {
    const counts = [hourOptions.length, minuteOptions.length];
    if (includesSeconds) {
      counts.push(secondOptions.length);
    }
    if (is12Hour) {
      counts.push(2);
    } // AM/PM
    return counts;
  };

  // Get max columns for navigation
  const getMaxColumns = (): number => {
    let maxColumns = 2; // hours, minutes
    if (includesSeconds) {
      maxColumns++;
    }
    if (is12Hour) {
      maxColumns++;
    }
    return maxColumns;
  };

  // Navigate up/down within current column
  const navigateUpDown = (direction: 'up' | 'down') => {
    const action: NavigationAction = { type: direction === 'up' ? 'ARROW_UP' : 'ARROW_DOWN' };
    const newFocus = calculateNextFocusState(dropdownFocus, action, getMaxColumns(), getOptionCounts());

    setDropdownFocus(newFocus);
    updateColumnValue(newFocus.column, newFocus.option);
    scrollFocusedOptionIntoView(newFocus.column, newFocus.option);
  };

  // Navigate left/right between columns
  const navigateLeftRight = (direction: 'left' | 'right') => {
    const action: NavigationAction = { type: direction === 'left' ? 'ARROW_LEFT' : 'ARROW_RIGHT' };
    const newFocus = calculateNextFocusState(dropdownFocus, action, getMaxColumns(), getOptionCounts());

    setDropdownFocus(newFocus);
  };

  // Handle keyboard navigation in dropdown
  const handleDropdownKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!dropdownFocus.isActive) {
      return;
    }

    const keyActionMap: Record<string, NavigationAction> = {
      ArrowUp: { type: 'ARROW_UP' },
      ArrowDown: { type: 'ARROW_DOWN' },
      ArrowLeft: { type: 'ARROW_LEFT' },
      ArrowRight: { type: 'ARROW_RIGHT' },
      Enter: { type: 'ENTER' },
      Escape: { type: 'ESCAPE' },
    };

    const action = keyActionMap[event.key];
    if (!action) {
      return;
    }

    event.preventDefault();

    if (action.type === 'ARROW_UP' || action.type === 'ARROW_DOWN') {
      navigateUpDown(action.type === 'ARROW_UP' ? 'up' : 'down');
    } else if (action.type === 'ARROW_LEFT' || action.type === 'ARROW_RIGHT') {
      navigateLeftRight(action.type === 'ARROW_LEFT' ? 'left' : 'right');
    } else if (action.type === 'ENTER' || action.type === 'ESCAPE') {
      const newFocus = calculateNextFocusState(dropdownFocus, action, getMaxColumns(), getOptionCounts());
      setDropdownFocus(newFocus);
      closeDropdownAndRestoreFocus();
    }
  };

  // Get display values for segments using pure functions
  const displayHours = formatDisplayHour(timeValue.hours, is12Hour);

  // Generate options for dropdown using pure functions
  const hourOptions = generateHourOptions(is12Hour);
  const minuteOptions = generateMinuteOptions(1);
  const secondOptions = generateSecondOptions(1);

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
    <div
      id={id}
      className={styles.calendarInputWrapper}
      role='group'
      aria-labelledby={`${id}-label`}
    >
      <div className={styles.segmentContainer}>
        {segments.map((segmentType, index) => {
          const segmentValue = segmentType === 'period' ? timeValue.period || 'AM' : timeValue[segmentType];
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
                onValueChange={(newValue) => handleSegmentChange(segmentType, newValue)}
                onNavigate={(direction) => handleSegmentNavigate(direction, index)}
                onFocus={() => setFocusedSegment(index)}
                onBlur={() => setFocusedSegment(null)}
                placeholder={segmentPlaceholders[segmentType]}
                disabled={disabled}
                readOnly={readOnly}
                aria-label={segmentLabels[segmentType]}
                aria-describedby={`${id}-label`}
                autoFocus={index === 0}
              />
            </React.Fragment>
          );
        })}
      </div>

      <Popover.TriggerContext>
        <Popover.Trigger
          ref={triggerButtonRef}
          variant='tertiary'
          icon
          onClick={toggleDropdown}
          aria-label='Open time picker'
          aria-expanded={showDropdown}
          aria-controls={`${id}-dropdown`}
          disabled={disabled || readOnly}
          data-size='sm'
        >
          <ClockIcon />
        </Popover.Trigger>
        <Popover
          ref={dropdownRef}
          id={`${id}-dropdown`}
          className={styles.timePickerDropdown}
          aria-modal='true'
          aria-label='Time selection dropdown'
          role='dialog'
          open={showDropdown}
          data-size='lg'
          placement='bottom'
          autoFocus={true}
          onClose={closeDropdown}
          onKeyDown={handleDropdownKeyDown}
          tabIndex={0}
        >
          <div className={styles.dropdownColumns}>
            {/* Hours Column */}
            <div
              className={styles.dropdownColumn}
              role='group'
              aria-label='Hours selection'
            >
              <div className={styles.dropdownLabel}>Timer</div>
              <div
                className={`${styles.dropdownList} ${
                  dropdownFocus.isActive && dropdownFocus.column === 0 ? styles.dropdownListFocused : ''
                }`}
                ref={hoursListRef}
              >
                {hourOptions.map((option, optionIndex) => {
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

                  const isSelected = option.value === displayHours;
                  const isFocused =
                    dropdownFocus.isActive && dropdownFocus.column === 0 && dropdownFocus.option === optionIndex;

                  return (
                    <button
                      key={option.value}
                      type='button'
                      className={`${styles.dropdownOption} ${
                        isSelected ? styles.dropdownOptionSelected : ''
                      } ${isFocused ? styles.dropdownOptionFocused : ''} ${
                        isDisabled ? styles.dropdownOptionDisabled : ''
                      }`}
                      onClick={() => !isDisabled && handleDropdownHoursChange(option.value.toString())}
                      disabled={isDisabled}
                      aria-label={option.label}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div
              className={styles.dropdownColumn}
              role='group'
              aria-label='Minutes selection'
            >
              <div className={styles.dropdownLabel}>Minutter</div>
              <div
                className={`${styles.dropdownList} ${
                  dropdownFocus.isActive && dropdownFocus.column === 1 ? styles.dropdownListFocused : ''
                }`}
                ref={minutesListRef}
              >
                {minuteOptions.map((option, optionIndex) => {
                  const isDisabled =
                    constraints.minTime || constraints.maxTime
                      ? !getSegmentConstraints('minutes', timeValue, constraints, format).validValues.includes(
                          option.value,
                        )
                      : false;

                  const isSelected = option.value === timeValue.minutes;
                  const isFocused =
                    dropdownFocus.isActive && dropdownFocus.column === 1 && dropdownFocus.option === optionIndex;

                  return (
                    <button
                      key={option.value}
                      type='button'
                      className={`${styles.dropdownOption} ${
                        isSelected ? styles.dropdownOptionSelected : ''
                      } ${isFocused ? styles.dropdownOptionFocused : ''} ${
                        isDisabled ? styles.dropdownOptionDisabled : ''
                      }`}
                      onClick={() => !isDisabled && handleDropdownMinutesChange(option.value.toString())}
                      disabled={isDisabled}
                      aria-label={option.label}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seconds Column (if included) */}
            {includesSeconds && (
              <div
                className={styles.dropdownColumn}
                role='group'
                aria-label='Seconds selection'
              >
                <div className={styles.dropdownLabel}>Sekunder</div>
                <div
                  className={`${styles.dropdownList} ${
                    dropdownFocus.isActive && dropdownFocus.column === 2 ? styles.dropdownListFocused : ''
                  }`}
                  ref={secondsListRef}
                >
                  {secondOptions.map((option, optionIndex) => {
                    const isDisabled =
                      constraints.minTime || constraints.maxTime
                        ? !getSegmentConstraints('seconds', timeValue, constraints, format).validValues.includes(
                            option.value,
                          )
                        : false;

                    const isSelected = option.value === timeValue.seconds;
                    const isFocused =
                      dropdownFocus.isActive && dropdownFocus.column === 2 && dropdownFocus.option === optionIndex;

                    return (
                      <button
                        key={option.value}
                        type='button'
                        className={`${styles.dropdownOption} ${
                          isSelected ? styles.dropdownOptionSelected : ''
                        } ${isFocused ? styles.dropdownOptionFocused : ''} ${
                          isDisabled ? styles.dropdownOptionDisabled : ''
                        }`}
                        onClick={() => !isDisabled && handleDropdownSecondsChange(option.value.toString())}
                        disabled={isDisabled}
                        aria-label={option.label}
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
              <div
                className={styles.dropdownColumn}
                role='group'
                aria-label='AM/PM selection'
              >
                <div className={styles.dropdownLabel}>AM/PM</div>
                <div
                  className={`${styles.dropdownList} ${
                    dropdownFocus.isActive && dropdownFocus.column === (includesSeconds ? 3 : 2)
                      ? styles.dropdownListFocused
                      : ''
                  }`}
                >
                  {['AM', 'PM'].map((period, optionIndex) => {
                    const isSelected = timeValue.period === period;
                    const columnIndex = includesSeconds ? 3 : 2; // AM/PM is last column
                    const isFocused =
                      dropdownFocus.isActive &&
                      dropdownFocus.column === columnIndex &&
                      dropdownFocus.option === optionIndex;

                    return (
                      <button
                        key={period}
                        type='button'
                        className={`${styles.dropdownOption} ${
                          isSelected ? styles.dropdownOptionSelected : ''
                        } ${isFocused ? styles.dropdownOptionFocused : ''}`}
                        onClick={() => handleDropdownPeriodChange(period as 'AM' | 'PM')}
                        aria-label={period}
                      >
                        {period}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Popover>
      </Popover.TriggerContext>
    </div>
  );
};
