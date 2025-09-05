export interface TimeOption {
  value: number | string;
  label: string;
  disabled?: boolean;
}

export interface TimeConstraints {
  minTime?: string;
  maxTime?: string;
}

/**
 * Generates hour options for the timepicker dropdown
 * @param is12Hour - Whether to use 12-hour format (1-12) or 24-hour format (0-23)
 * @param constraints - Optional time constraints for validation
 * @returns Array of hour options with value, label and disabled state
 */
export const generateHourOptions = (is12Hour: boolean, constraints?: TimeConstraints): TimeOption[] => {
  if (is12Hour) {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: (i + 1).toString().padStart(2, '0'),
      disabled: false, // TODO: Add constraint validation
    }));
  }

  return Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, '0'),
    disabled: false, // TODO: Add constraint validation
  }));
};

/**
 * Generates minute options for the timepicker dropdown
 * @param step - Step increment for minutes (default: 1, common values: 1, 5, 15, 30)
 * @param constraints - Optional time constraints for validation
 * @returns Array of minute options with value, label and disabled state
 */
export const generateMinuteOptions = (step: number = 1, constraints?: TimeConstraints): TimeOption[] => {
  const count = Math.floor(60 / step);

  return Array.from({ length: count }, (_, i) => {
    const value = i * step;
    return {
      value,
      label: value.toString().padStart(2, '0'),
      disabled: false, // TODO: Add constraint validation
    };
  });
};

/**
 * Generates second options for the timepicker dropdown
 * @param step - Step increment for seconds (default: 1, common values: 1, 5, 15, 30)
 * @param constraints - Optional time constraints for validation
 * @returns Array of second options with value, label and disabled state
 */
export const generateSecondOptions = (step: number = 1, constraints?: TimeConstraints): TimeOption[] => {
  const count = Math.floor(60 / step);

  return Array.from({ length: count }, (_, i) => {
    const value = i * step;
    return {
      value,
      label: value.toString().padStart(2, '0'),
      disabled: false, // TODO: Add constraint validation
    };
  });
};
