import React from 'react';

import { DatePickerControl } from 'src/app-components/Datepicker/Datepicker';
import { getDateConstraint, getDateFormat } from 'src/app-components/Datepicker/utils/dateHelpers';
import { Flex } from 'src/app-components/Flex/Flex';
import { Label } from 'src/app-components/Label/Label';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { DropdownCaption } from 'src/layout/Datepicker/DropdownCaption';
import { getDatepickerFormat } from 'src/utils/dateUtils';
import { useLabel } from 'src/utils/layout/useLabel';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

import 'react-day-picker/style.css';

export type IDatepickerProps = PropsFromGenericComponent<'Datepicker'>;

export function DatepickerComponent({ node, overrideDisplay }: IDatepickerProps) {
  const { langAsString } = useLanguage();
  const languageLocale = useCurrentLanguage();
  const {
    minDate,
    maxDate,
    format,
    timeStamp = true,
    readOnly,
    required,
    id,
    dataModelBindings,
    grid,
  } = useNodeItem(node);

  const calculatedMinDate = getDateConstraint(minDate, 'min');
  const calculatedMaxDate = getDateConstraint(maxDate, 'max');
  const dateFormat = getDatepickerFormat(getDateFormat(format, languageLocale));
  const isMobile = useIsMobile();

  const { setValue, formData } = useDataModelBindings(dataModelBindings);
  const value = formData.simpleBinding;

  const handleInputValueChange = (isoDateString: string) => {
    setValue('simpleBinding', isoDateString);
  };

  const { labelText, getRequiredComponent, getOptionalComponent, getHelpTextComponent, getDescriptionComponent } =
    useLabel({ node, overrideDisplay });

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
      <ComponentStructureWrapper node={node}>
        <Flex
          container
          item
          size={{ xs: 12 }}
        >
          <DatePickerControl
            id={id}
            value={value}
            dateFormat={dateFormat}
            timeStamp={timeStamp}
            onValueChange={handleInputValueChange}
            readOnly={readOnly}
            required={required}
            locale={languageLocale}
            isMobile={isMobile}
            minDate={calculatedMinDate}
            maxDate={calculatedMaxDate}
            DropdownCaption={DropdownCaption}
            buttonAriaLabel={langAsString('date_picker.aria_label_icon')}
            calendarIconTitle={langAsString('date_picker.aria_label_icon')}
          />
        </Flex>
      </ComponentStructureWrapper>
    </Label>
  );
}
