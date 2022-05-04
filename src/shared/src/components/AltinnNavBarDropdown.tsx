import { createTheme, createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import altinnTheme from '../theme/altinnStudioTheme';

export interface IAltinnNavBarDropdownComponentProvidedProps {
  id: string;
  classes: any;
  handleChange: any;
  dropdownItems: string[];
  selectedValue: string;
}

const theme = createTheme(altinnTheme);

const styles = createStyles({
  inputHeader: {
    fontSize: '24px',
    fontWeight: 400,
  },
  marginTop_10: {
    marginTop: '10px',
  },
  descriptionInput: {
    fontSize: '16px',
  },
  inputField: {
    border: '1px solid ' + theme.altinnPalette.primary.blueDark,
    background: 'none',
    width: '386px',
  },
  inputField_disabled: {
    background: theme.altinnPalette.primary.greyLight,
    border: '1px solid ' + theme.altinnPalette.primary.grey,
  },
  inputFieldText: {
    fontSize: '16px',
    color: theme.altinnPalette.primary.black + '!Important',
    padding: '6px',
  },
});

export class AltinnNavBarDropdown extends React.Component<IAltinnNavBarDropdownComponentProvidedProps> {
  public render() {
    return (
      <div>
        <a
          className='nav-link dropdown-toggle a-languageSwitcher'
          aria-expanded='true'
          data-toggle='dropdown'
          data-target='someid'
          aria-haspopup='true'
          href='#'
        >
          Språk
        </a>
        <div id='someid' className='dropdown show'>
          <div
            className='dropdown-menu a-dropdown-languages a-dropdownTriangle'
            x-placement='bottom-start'
          >
            {this.props.dropdownItems.map((option: string) => (
              <a aria-hidden='true' className='dropdown-item' href='#'>
                <p>
                  <span className='a-h3'>{option}</span>
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AltinnNavBarDropdown);
