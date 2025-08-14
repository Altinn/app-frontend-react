import React from 'react';

import { Flex } from 'src/app-components/Flex/Flex';
import { Label } from 'src/app-components/Label/Label';
import { TimePicker as TimePickerControl } from 'src/app-components/TimePicker/TimePicker';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { useLabel } from 'src/utils/layout/useLabel';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export function TimePickerComponent({ baseComponentId, overrideDisplay }: PropsFromGenericComponent<'TimePicker'>) {
  const {
    minTime,
    maxTime,
    format = 'HH:mm',
    timeStamp = false,
    readOnly,
    required,
    id,
    dataModelBindings,
    grid,
    autocomplete,
  } = useItemWhenType(baseComponentId, 'TimePicker');

  const { setValue, formData } = useDataModelBindings(dataModelBindings);
  const value = formData.simpleBinding || '';

  const handleTimeChange = (timeString: string) => {
    if (timeStamp && timeString) {
      const now = new Date();
      const [hours, minutes, seconds] = timeString
        .replace(/\s*(AM|PM)/i, '')
        .split(':')
        .map(Number);
      const period = timeString.match(/(AM|PM)/i)?.[0];

      let adjustedHours = hours;
      if (period === 'PM' && hours !== 12) {
        adjustedHours += 12;
      }
      if (period === 'AM' && hours === 12) {
        adjustedHours = 0;
      }

      now.setHours(adjustedHours, minutes, seconds || 0, 0);
      setValue('simpleBinding', now.toISOString());
    } else {
      setValue('simpleBinding', timeString);
    }
  };

  const displayValue = React.useMemo(() => {
    if (!value) {
      return '';
    }

    if (timeStamp && value.includes('T')) {
      const date = new Date(value);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      if (format.includes('a')) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const timeStr = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const secondsStr = format.includes('ss') ? `:${seconds.toString().padStart(2, '0')}` : '';
        return `${timeStr}${secondsStr} ${period}`;
      } else {
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const secondsStr = format.includes('ss') ? `:${seconds.toString().padStart(2, '0')}` : '';
        return `${timeStr}${secondsStr}`;
      }
    }

    return value;
  }, [value, timeStamp, format]);

  const { labelText, getRequiredComponent, getOptionalComponent, getHelpTextComponent, getDescriptionComponent } =
    useLabel({ baseComponentId, overrideDisplay });

  return (
    <Label
      htmlFor={id}
      label={labelText}
      grid={grid?.labelGrid}
      required={required}
      requiredIndicator={getRequiredComponent()}
      optionalIndicator={getOptionalComponent()}
      help={getHelpTextComponent()}
      description={getDescriptionComponent()}
    >
      <ComponentStructureWrapper baseComponentId={baseComponentId}>
        <Flex
          container
          item
          size={{ xs: 12 }}
        >
          <TimePickerControl
            id={id}
            value={displayValue}
            onChange={handleTimeChange}
            format={format}
            minTime={minTime}
            maxTime={maxTime}
            disabled={readOnly}
            readOnly={readOnly}
            required={required}
            autoComplete={autocomplete}
            aria-label='schmable'
          />
        </Flex>
      </ComponentStructureWrapper>
    </Label>
  );
}
