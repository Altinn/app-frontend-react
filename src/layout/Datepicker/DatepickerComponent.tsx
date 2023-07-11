import React from 'react';

import { Grid, Icon, makeStyles } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import set from 'date-fns/set';
import type { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import {
  convertToDatepickerFormat,
  getDateConstraint,
  getDateFormat,
  getDateUtils,
  getLocale,
  getSaveFormattedDateString,
  isValidDate,
  parseISOString,
} from 'src/utils/dateHelpers';
import type { PropsFromGenericComponent } from 'src/layout';

import 'src/layout/Datepicker/DatepickerComponent.css';
import 'src/styles/shared.css';

export type IDatepickerProps = PropsFromGenericComponent<'Datepicker'>;

const iconSize = '30px';

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
    fontSize: iconSize,
    lineHeight: iconSize,
    color: 'var(--colors-blue-900)',
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

// We dont use the built-in validation for the 3rd party component, so it is always empty string
const emptyString = '';

export function DatepickerComponent({ node, formData, handleDataChange, isValid, overrideDisplay }: IDatepickerProps) {
  const classes = useStyles();
  const { langAsString } = useLanguage();
  const { selectedLanguage } = useLanguage();
  const { minDate, maxDate, format, timeStamp = true, readOnly, required, id, textResourceBindings } = node.item;

  const calculatedMinDate = getDateConstraint(minDate, 'min');
  const calculatedMaxDate = getDateConstraint(maxDate, 'max');
  const resolvedFormat = getDateFormat(format, selectedLanguage);
  const calculatedFormat = convertToDatepickerFormat(resolvedFormat);
  const DateUtilsProvider = getDateUtils(resolvedFormat, calculatedFormat);
  const isMobile = useIsMobile();

  const { value, setValue, saveValue, onPaste } = useDelayedSavedState(handleDataChange, formData?.simpleBinding ?? '');

  const { date, input } = parseISOString(value);

  const handleDateValueChange = (
    dateValue: MaterialUiPickersDate,
    inputValue: string | undefined,
    saveImmediately = false,
  ) => {
    if (isValidDate(dateValue)) {
      dateValue = set(dateValue as Date, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
      setValue(getSaveFormattedDateString(dateValue, timeStamp), saveImmediately);
    } else {
      const skipValidation = Boolean(inputValue && inputValue.length < calculatedFormat.length);
      setValue(inputValue ?? '', saveImmediately, skipValidation);
    }
  };

  const mobileOnlyProps = isMobile
    ? {
        cancelLabel: langAsString('date_picker.cancel_label'),
        clearLabel: langAsString('date_picker.clear_label'),
        todayLabel: langAsString('date_picker.today_label'),
      }
    : {};
  return (
    <>
      <MuiPickersUtilsProvider
        utils={DateUtilsProvider}
        locale={getLocale(selectedLanguage)}
      >
        <Grid
          container
          item
          xs={12}
        >
          <KeyboardDatePicker
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
            onBlur={saveValue}
            onAccept={(dateValue) => handleDateValueChange(dateValue, undefined, true)}
            onPaste={onPaste}
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
              <Icon
                id='date-icon'
                className={`${classes.icon} ai ai-date`}
              />
            }
            className={classes.datepicker}
            {...mobileOnlyProps}
          />
        </Grid>
      </MuiPickersUtilsProvider>
    </>
  );
}
