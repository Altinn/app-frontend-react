import { makeStyles } from '@material-ui/core/styles';
import cn from 'classnames';
import * as React from 'react';
import { AltinnAppTheme } from '../theme';
import '../../../altinn-app-frontend/src/styles/shared.css';

const useStyles = makeStyles({
  select: {
    fontSize: '1.6rem',
    '&:focus': {
      outline: `2px solid ${AltinnAppTheme.altinnPalette.primary.blueDark}`,
    },
  },
});

const optionStyle = {
  display: 'none',
};
interface IAltinnDropdownProps {
  id: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  value: string;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const AltinnDropdown = ({
  id,
  onChange,
  onBlur,
  options,
  value,
  disabled = false,
  error = false,
  fullWidth = false,
  className,
}: IAltinnDropdownProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <select
        id={id}
        value={value}
        disabled={disabled}
        className={cn(
          classes.select,
          'custom-select a-custom-select',
          {
            'validation-error': error,
            'disabled !important': disabled,
          },
          className,
        )}
        style={{ width: fullWidth ? '100%' : 'unset' }}
        onChange={onChange}
        onBlur={onBlur}
      >
        <option style={optionStyle} />
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </React.Fragment>
  );
};

export default AltinnDropdown;
