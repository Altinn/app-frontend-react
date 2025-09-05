import { useCallback, useEffect, useState } from 'react';

import { formatSegmentValue } from 'src/app-components/TimePicker/utils/timeFormatUtils';
import type { TimeFormat } from 'src/app-components/TimePicker/components/TimePicker';
import type { SegmentType } from 'src/app-components/TimePicker/utils/keyboardNavigation';

export function useSegmentDisplay(externalValue: number | string, segmentType: SegmentType, timeFormat: TimeFormat) {
  const [displayValue, setDisplayValue] = useState(() => formatSegmentValue(externalValue, segmentType, timeFormat));

  const updateDisplayFromBuffer = useCallback((bufferValue: string) => {
    setDisplayValue(bufferValue);
  }, []);

  const syncWithExternalValue = useCallback(() => {
    const formattedValue = formatSegmentValue(externalValue, segmentType, timeFormat);
    setDisplayValue(formattedValue);
  }, [externalValue, segmentType, timeFormat]);

  useEffect(() => {
    syncWithExternalValue();
  }, [syncWithExternalValue]);

  return {
    displayValue,
    updateDisplayFromBuffer,
    syncWithExternalValue,
  };
}
