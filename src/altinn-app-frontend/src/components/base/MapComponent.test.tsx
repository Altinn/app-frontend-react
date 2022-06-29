import * as React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

import type { IComponentProps } from 'src/components';
import { MapComponent } from './MapComponent';
import type { IMapComponentProps } from './MapComponent';

import { setupServer, handlers } from '../../../testUtils';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const render = (props: Partial<IMapComponentProps> = {}) => {
  const createStore = configureStore();
  const mockLanguage = {
    ux_editor: {
      modal_configure_address_component_address: 'Adresse',
      modal_configure_address_component_title_text_binding:
        'Søk etter ledetekst for Adresse-komponenten',
      modal_configure_address_component_care_of:
        'C/O eller annen tilleggsadresse',
      modal_configure_address_component_house_number: 'Bolignummer',
      modal_configure_address_component_house_number_helper:
        'Om addressen er felles for flere boenhenter må du oppgi' +
        ' bolignummer. Den består av en bokstav og fire tall og skal være ført opp ved/på inngangsdøren din.',
      modal_configure_address_component_post_place: 'Poststed',
      modal_configure_address_component_simplified: 'Enkel',
      modal_configure_address_component_zip_code: 'Postnr',
    },
  };

  const allProps: IMapComponentProps = {
    id: 'id',
    formData: {
      simpleBinding: undefined,
    },
    handleDataChange: () => '',
    getTextResource: () => 'test',
    isValid: true,
    dataModelBindings: {},
    componentValidations: {},
    language: mockLanguage,
    readOnly: false,
    required: false,
    textResourceBindings: {},
    ...({} as IComponentProps),
    ...props,
  };

  const mockStore = createStore({ language: { language: mockLanguage } });

  rtlRender(
    <Provider store={mockStore}>
      <MapComponent {...allProps} />
    </Provider>,
  );
};

function getButton(name: string) {
  return screen.queryByRole('button', { name: name });
}

function getLink(name: string) {
  return screen.queryByRole('link', { name: name });
}

describe('components > advanced > MapComponent', () => {
  it('should display link in layer attribution', () => {
    render({
      layers: [
        {
          url: 'dummy',
          attribution:
            'Data © <a href="http://www.kartverket.no/">Kartverket</a>',
        },
      ],
    });

    expect(getLink('Kartverket')).toBeInTheDocument();
  });

  it('should show map with zoom buttons when readonly is false', () => {
    render({
      readOnly: false,
    });

    expect(getButton('Zoom in')).toBeInTheDocument();
    expect(getButton('Zoom out')).toBeInTheDocument();
  });

  it('should show map without zoom buttons when readonly is true', () => {
    render({
      readOnly: true,
    });

    expect(getButton('Zoom in')).not.toBeInTheDocument();
    expect(getButton('Zoom out')).not.toBeInTheDocument();
  });
});
