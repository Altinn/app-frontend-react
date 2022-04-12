import * as React from 'react';
import { render } from '@testing-library/react';
import { AltinnAppTheme } from 'altinn-shared/theme';

import MessageBanner from './MessageBanner';

describe('form/components/MessageBanner.tsx', () => {
  let mockLanguage: any;
  let mockMessageKey: string;

  beforeEach(() => {
    mockMessageKey = 'form_filler.required_description';
    mockLanguage = {
      'form_filler': {
        'required_description': 'Obligatoriske felter er merket med *',
      }
    }
  });

  test('form/components/MessageBanner -- should match snapshot', () => {
    const { asFragment } = render(
      <MessageBanner
        language={mockLanguage}
        messageKey={mockMessageKey}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('form/components/MessageBanner -- should have red background when error==true', () => {
    const { getByTestId } = render(
      <MessageBanner
        language={mockLanguage}
        messageKey={mockMessageKey}
        error={true}
      />
    );

    const messageBanner: HTMLElement = getByTestId('MessageBanner-container');
    expect(messageBanner).toBeInTheDocument();
    expect(messageBanner.className).toContain('error');
    const backgroundColor = window.getComputedStyle(messageBanner).backgroundColor;
    expect(backgroundColor).toEqual(convertToRgb(AltinnAppTheme.altinnPalette.primary.redLight));
  })
});

const convertToRgb = (hexValue: string): string => {
  const aRgbHex = hexValue.replace('#', '').match(/.{1,2}/g);
  const aRgb = [
      parseInt(aRgbHex[0], 16),
      parseInt(aRgbHex[1], 16),
      parseInt(aRgbHex[2], 16)
  ];
  return `rgb(${aRgb[0]}, ${aRgb[1]}, ${aRgb[2]})`;
}
