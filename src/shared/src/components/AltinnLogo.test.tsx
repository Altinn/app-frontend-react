import 'jest';
import * as React from 'react';
import { render } from '@testing-library/react';
import AltinnLogo from './AltinnLogo';
import altinnTheme from '../../src/theme/altinnAppTheme';

describe('AltinnLogo', () => {
  let mockColor: string;

  beforeEach(() => {
    mockColor = altinnTheme.altinnPalette.primary.blueDarker;
  });

  it('+++ Should match snapshot', () => {
    const { container } = render(<AltinnLogo color={mockColor} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('+++ Should have correct color - blueDark', () => {
    const { container } = render(<AltinnLogo color={mockColor} />);
    expect(container.querySelector('#logo').getAttribute('src')).toEqual(
      'https://altinncdn.no/img/Altinn-logo-black.svg',
    );
    expect(container.querySelector('#logo').getAttribute('class')).toEqual(
      'logo logo-filter-022F51',
    );
  });

  it('+++ Should have correct color - white', () => {
    const { container } = render(<AltinnLogo color='white' />);
    expect(container.querySelector('#logo').getAttribute('src')).toEqual(
      'https://altinncdn.no/img/Altinn-logo-white.svg',
    );
    expect(container.querySelector('#logo').getAttribute('class')).toEqual(
      'logo',
    );
  });
});
