import React, { useState } from 'react';

import { Grid, makeStyles } from '@material-ui/core';
import { format as formatDate, formatISO, isValid as isValidDate, parse } from 'date-fns';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { DatePickerCalendar } from 'src/layout/Datepicker/DatePickerCalendar';
import { DatePickerInput } from 'src/layout/Datepicker/DatePickerInput';
import { getDateConstraint, getDateFormat } from 'src/utils/dateHelpers';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

import 'src/layout/Datepicker/DatepickerComponent.css';
import 'src/styles/shared.css';
import 'react-day-picker/style.css';

export type IDatepickerProps = PropsFromGenericComponent<'Datepicker'>;

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'white',
    boxSizing: 'border-box',
    height: '36px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    borderRadius: 'var(--interactive_components-border_radius-normal)',
    marginBottom: '0px',
    outline: '1px solid var(--component-input-color-border-default)',
    '&:hover': {
      outline: '2px solid var(--component-input-color-border-hover)',
    },
    '&:has(input:focus-visible)': {
      outline: 'var(--fds-focus-border-width) solid var(--fds-outer-focus-border-color)',
    },
  },
  input: {
    padding: '0px',
    marginLeft: '12px',
  },
  invalid: {
    outlineColor: `var(--component-input-error-color-border-default)`,
    '&:hover': {
      outlineColor: `var(--component-input-error-color-border-default)`,
    },
  },
  icon: {
    fontSize: '1.75rem',
    color: 'var(--semantic-text-neutral-default)',
  },
  iconButton: {
    padding: 3,
    '&:focus': {
      outline: 'none',
    },
    '&:focus-visible': {
      outline: 'var(--fds-focus-border-width) solid var(--fds-outer-focus-border-color)',
      outlineOffset: 'var(--fds-focus-border-width)',
      boxShadow: '0 0 0 var(--fds-focus-border-width) var(--fds-inner-focus-border-color)',
    },
  },
  formHelperText: {
    fontSize: '0.875rem',
  },
  datepicker: {
    width: 'auto',
    marginBottom: '0px',
    marginTop: '0px',
  },
  dialog: {
    '& *': {
      fontFamily: 'inherit',
    },
    '& .MuiTypography-h4': {
      fontSize: '1.5rem',
    },
    '& .MuiTypography-body1': {
      fontSize: '1.125rem',
    },
    '& .MuiTypography-body2': {
      fontSize: '1rem',
    },
    '& .MuiTypography-caption': {
      fontSize: '1rem',
    },
    '& .MuiTypography-subtitle1': {
      fontSize: '1rem',
    },
  },
}));

export function DatepickerComponent({ node, overrideDisplay }: IDatepickerProps) {
  const classes = useStyles();
  const isValid = useIsValid(node);
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

  const [month, setMonth] = useState(new Date());
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [input, setInput] = useState('');

  const calculatedMinDate = getDateConstraint(minDate, 'min');
  const calculatedMaxDate = getDateConstraint(maxDate, 'max');

  const calculatedFormat = getDateFormat(format, languageLocale);
  const isMobile = useIsMobile();

  const { setValue, debounce, formData } = useDataModelBindings(dataModelBindings);
  const value = formData.simpleBinding;
  const dateValue = formatISO(formData.simpleBinding);
  //const [date, input] = isValidDate(dateValue) ? [dateValue, undefined] : [null, value ?? ''];

  const handleDayPickerSelect = (date: Date) => {
    if (!date || !isValidDate(date)) {
      setInput('');
      setDate(undefined);
      //setValue('simpleBinding', inputValue ?? '');
    } else {
      //setValue('simpleBinding', getDateString(dateValue, timeStamp));
      setDate(date);
      setInput(formatDate(date, calculatedFormat));
    }
    setIsDialogOpen(false);
  };

  const mobileOnlyProps = isMobile
    ? {
        cancelLabel: langAsString('date_picker.cancel_label'),
        clearLabel: langAsString('date_picker.clear_label'),
        todayLabel: langAsString('date_picker.today_label'),
      }
    : {};

  const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value); // keep the input value in sync
    const parsedDate = parse(e.target.value, calculatedFormat, new Date());

    if (isValidDate(parsedDate)) {
      setDate(parsedDate);
      setMonth(parsedDate);
    } else {
      setDate(undefined);
    }
  };

  return (
    <ComponentStructureWrapper
      node={node}
      label={{ node, renderLabelAs: 'label' }}
    >
      <Grid
        container
        item
        xs={12}
      >
        <DatePickerInput
          id={id}
          value={input}
          isDialogOpen={true}
          formatString={calculatedFormat}
          onChange={handleInputChange}
          toggleDialog={toggleDialog}
        />
        <DatePickerCalendar
          id={id}
          selectedDate={date}
          month={month}
          setMonth={setMonth}
          isOpen={isDialogOpen}
          onSelect={handleDayPickerSelect}
          minDate={calculatedMinDate}
          maxDate={calculatedMaxDate}
        />
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
