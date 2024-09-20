import React, { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Modal, Popover } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import { isValid as isValidDate, parse, parseISO } from 'date-fns';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import styles from 'src/layout/Datepicker/Calendar.module.css';
import { DatePickerCalendar } from 'src/layout/Datepicker/DatePickerCalendar';
import DatePickerInput from 'src/layout/Datepicker/DatePickerInput';
import { getDateConstraint, getDateFormat, getSaveFormattedDateString } from 'src/utils/dateHelpers';
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
    textResourceBindings,
    dataModelBindings,
  } = useNodeItem(node);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const calculatedMinDate = getDateConstraint(minDate, 'min');
  const calculatedMaxDate = getDateConstraint(maxDate, 'max');
  const dateFormat = getDateFormat(format, languageLocale);
  const isMobile = useIsMobile();

  const { setValue, formData } = useDataModelBindings(dataModelBindings);
  const value = formData.simpleBinding;
  const selectedDate = isValidDate(parseISO(value)) ? parseISO(value) : new Date();
  const handleDayPickerSelect = (date: Date) => {
    if (date && isValidDate(date)) {
      setValue('simpleBinding', getSaveFormattedDateString(date, timeStamp));
    }
    modalRef.current?.close();
    setIsDialogOpen(false);
  };

  /*const mobileOnlyProps = isMobile
    ? {
        cancelLabel: langAsString('date_picker.cancel_label'),
        clearLabel: langAsString('date_picker.clear_label'),
        todayLabel: langAsString('date_picker.today_label'),
      }
    : {};*/

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsedDate = parse(e.target.value, dateFormat, new Date());
    if (isValidDate(parsedDate)) {
      setValue('simpleBinding', getSaveFormattedDateString(parsedDate, timeStamp));
    } else {
      setValue('simpleBinding', e.target.value ?? '');
    }
  };

  const renderModal = (trigger: ReactNode, content: ReactNode) =>
    isMobile ? (
      <>
        {trigger}
        <Modal
          role='dialog'
          ref={modalRef}
          onInteractOutside={() => modalRef.current?.close()}
        >
          <Modal.Content>{content}</Modal.Content>
        </Modal>
      </>
    ) : (
      <Popover
        portal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        size='lg'
        placement='top'
      >
        <Popover.Trigger
          onClick={() => setIsDialogOpen(!isDialogOpen)}
          asChild={true}
        >
          {trigger}
        </Popover.Trigger>
        <Popover.Content
          className={styles.calendarWrapper}
          aria-modal
        >
          {content}
        </Popover.Content>
      </Popover>
    );

  return (
    <ComponentStructureWrapper
      node={node}
      label={{ node, renderLabelAs: 'label', title: 'Test' }}
    >
      <Grid
        container
        item
        xs={12}
      >
        {renderModal(
          <DatePickerInput
            id={id}
            value={value}
            isDialogOpen={true}
            formatString={dateFormat}
            onBlur={handleInputChange}
            onClick={() => (isMobile ? modalRef.current?.showModal() : setIsDialogOpen(!isDialogOpen))}
            ariaLabel={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
            description={
              textResourceBindings?.description ? langAsString(textResourceBindings?.description) : undefined
            }
            readOnly={readOnly}
          />,
          <DatePickerCalendar
            id={id}
            locale={languageLocale}
            selectedDate={selectedDate}
            isOpen={isDialogOpen}
            onSelect={handleDayPickerSelect}
            minDate={calculatedMinDate}
            maxDate={calculatedMaxDate}
            required={required}
            autoFocus={isMobile}
          />,
        )}

        {/*<KeyboardDatePicker
            readOnly={readOnly}
            required={required}
            variant={isMobile ? 'dialog' : 'inline'}
            format={calculatedFormat}
            margin='normal'
            id={id}
            data-testid={id}
            value={date}
            inputValue={input}
            placeholder={calculatedFormat}
            key={id}
            onChange={handleDateValueChange}
            onBlur={debounce}
            onAccept={(dateValue) => handleDateValueChange(dateValue, undefined)}
            autoOk={true}
            invalidDateMessage={emptyString}
            maxDateMessage={emptyString}
            minDateMessage={emptyString}
            minDate={calculatedMinDate}
            maxDate={calculatedMaxDate}
            InputProps={{
              disableUnderline: true,
              error: !isValid,
              readOnly,
              classes: {
                root: classes.root + (!isValid ? ` ${classes.invalid}` : '') + (readOnly ? ' disabled' : ''),
                input: classes.input,
              },
              ...(textResourceBindings?.description && {
                'aria-describedby': `description-${id}`,
              }),
            }}
            inputProps={{
              className: 'no-visual-testing',
              'aria-label': overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined,
            }}
            DialogProps={{ className: classes.dialog }}
            PopoverProps={{ className: classes.dialog }}
            FormHelperTextProps={{
              classes: {
                root: classes.formHelperText,
              },
            }}
            KeyboardButtonProps={{
              'aria-label': langAsString('date_picker.aria_label_icon'),
              id: 'date-icon-button',
              classes: {
                root: classes.iconButton,
              },
            }}
            leftArrowButtonProps={{
              'aria-label': langAsString('date_picker.aria_label_left_arrow'),
              id: 'date-left-icon-button',
            }}
            rightArrowButtonProps={{
              'aria-label': langAsString('date_picker.aria_label_right_arrow'),
              id: 'date-right-icon-button',
            }}
            keyboardIcon={
              <CalendarIcon
                id='date-icon'
                className={classes.icon}
                aria-label={langAsString('date_picker.aria_label_icon')}
              />
            }
            className={classes.datepicker}
            {...mobileOnlyProps}
          />*/}
      </Grid>
      {/* </MuiPickersUtilsProvider>*/}
    </ComponentStructureWrapper>
  );
}
