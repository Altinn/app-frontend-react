import {
  type NumericFormatProps,
  numericFormatter,
  type PatternFormatProps,
  patternFormatter,
  removeNumericFormat,
  removePatternFormat,
} from 'react-number-format';

import type { IInputFormatting, NumberFormatProps } from 'src/layout/Input/config.generated';

export const isPatternFormat = (
  numberFormat: NumericFormatProps | PatternFormatProps,
): numberFormat is PatternFormatProps => (numberFormat as PatternFormatProps).format !== undefined;
export const isNumericFormat = (
  numberFormat: NumericFormatProps | PatternFormatProps,
): numberFormat is NumericFormatProps => (numberFormat as PatternFormatProps).format === undefined;

export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

export const getChangeMeta = (newValue: string) => ({
  from: { start: 0, end: 0 },
  to: { start: 0, end: newValue.length },
  lastValue: '',
});

export const getCleanValue = (newValue: string, inputFormatting: IInputFormatting): string => {
  if (isEmptyObject(inputFormatting)) {
    return newValue;
  }
  if (isNumericFormat(inputFormatting)) {
    return removeNumericFormat(newValue, getChangeMeta(newValue), {
      ...inputFormatting,
    });
  }

  if (isPatternFormat(inputFormatting)) {
    return removePatternFormat(newValue, getChangeMeta(newValue), {
      ...(inputFormatting as PatternFormatProps),
    });
  }
  throw new Error('Tried to remove input formatting with an invalid input config. ');
};

export const getFormattedValue = (newValue: string, inputFormatting: IInputFormatting): string => {
  if (isEmptyObject(inputFormatting)) {
    return newValue;
  }

  const cleanedValue = getCleanValue(newValue, inputFormatting);
  if (isNumericFormat(inputFormatting) && inputFormatting.number) {
    if ((inputFormatting.number as NumberFormatProps).allowedDecimalSeparators) {
      return numericFormatter(cleanedValue, inputFormatting);
    }
    return numericFormatter(cleanedValue, inputFormatting.number);
  }

  if (isPatternFormat(inputFormatting)) {
    return patternFormatter(cleanedValue, inputFormatting);
  }
  throw new Error('Tried to get a formatted value with invalid input formatting config.');
};
