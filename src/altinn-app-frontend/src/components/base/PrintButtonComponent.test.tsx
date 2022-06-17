import React from 'react';
import { screen } from '@testing-library/react';
import { PrintButtonComponent } from 'src/components/base/PrintButtonComponent';
import { renderWithProviders } from '../../../testUtils';
import { IComponentProps } from 'src/components';
import { getLanguageFromCode } from 'altinn-shared/language';

const render = (
  props: Partial<IComponentProps> = {},
  preloaded = undefined,
  language = getLanguageFromCode('nb'),
) => {
  const preloadedState = {
    language,
    ...preloaded,
  };
  renderWithProviders(<PrintButtonComponent {...props} />, { preloadedState });
};

describe('PrintButton', () => {
  it('should display the resource binding key if the text resource is not defined', async () => {
    render();
    expect(screen.getByText('general.print_button_text')).toBeInTheDocument();
    // this points to the default texts and can be overridden
    // todo: write a test that actually displays the default text.
  });
  it('should display the resource if the resource is defined', async () => {
    render(
      {  } ,
      {
        textResources: {
          resources: [{ id: 'general.print_button_text', value: 'Skriv ut' }],
        },
      },
    );
    expect(screen.getByText('Skriv ut')).toBeInTheDocument();
  });
});
