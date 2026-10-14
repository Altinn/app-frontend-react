import { numericFormatter, removeNumericFormat } from 'react-number-format';
import type { NumericFormatProps } from 'react-number-format';

import type { NumberFormatProps, PatternFormatProps } from 'src/layout/common.generated';

export const isPatternFormat = (
  format: NumberFormatProps | PatternFormatProps | undefined,
): format is PatternFormatProps => (format ? (format as PatternFormatProps).format !== undefined : false);

export const isNumberFormat = (
  format: NumberFormatProps | PatternFormatProps | undefined,
): format is NumberFormatProps => (format ? (format as PatternFormatProps).format === undefined : false);

export function parsePastedNumber(pastedText: string, format: NumericFormatProps): string {
  const thousandSeparator = format.thousandSeparator === true ? ',' : format.thousandSeparator;
  const ungroupedText = thousandSeparator ? pastedText.split(thousandSeparator).join('') : pastedText;
  // Apply the input's precision before saving, so decimals hidden by decimalScale are not stored.
  const formatted = numericFormatter(ungroupedText.replace(',', '.'), format);
  const changeMeta = {
    from: { start: 0, end: 0 },
    to: { start: 0, end: formatted.length },
    lastValue: '',
  };
  return removeNumericFormat(formatted, changeMeta, format);
}
