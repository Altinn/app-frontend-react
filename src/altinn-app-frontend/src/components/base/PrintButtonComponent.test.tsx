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
  it('should should display the default text if no textResource binding key is found', async () => {
    render();
    expect(screen.getByText('general.print_button')).toBeInTheDocument();
  });
  it('should display the resource binding key if the text resource is not defined', async () => {
    render({ textResourceBindings: { text: 'root.printButton.text' } });
    expect(screen.getByText('root.printButton.text')).toBeInTheDocument();
  });
  it('should display the resource if the resource is defined', async () => {
    render(
      { textResourceBindings: { text: 'root.printButton.text' } },
      {
        textResources: {
          resources: [{ id: 'root.printButton.text', value: 'Skriv ut' }],
        },
      },
    );
    expect(screen.getByText('Skriv ut')).toBeInTheDocument();
  });
});
