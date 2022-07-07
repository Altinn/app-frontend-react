import * as React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import type { IComponentProps } from 'src/components';
import { MapComponent } from './MapComponent';
import type { IMapComponentProps } from './MapComponent';

const render = (props: Partial<IMapComponentProps> = {}) => {
  const mockLanguage = {
    map_component: {
      selectedLocation: 'Selected location: {0},{1}',
      noSelectedLocation: 'No selected location',
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

  rtlRender(<MapComponent {...allProps} />);
};

function getButton(name: string) {
  return screen.queryByRole('button', { name: name });
}

function getLink(name: string) {
  return screen.queryByRole('link', { name: name });
}

function getFooterText() {
  screen.getAllByRole('hepp');
  return screen.queryByRole('link');
}

describe('MapComponent', () => {
  it('should display attribution link', () => {
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

  it('should show correct footer text when no location is selected', () => {
    render();

    expect(getFooterText()).toBe('No selected location');
  });

  // TODO: Fix this test when problems with jest and react-leaflet are solved
  xit('should show correct footer text when location is selected', () => {
    render();

    expect(getFooterText()).toBe('Selected location x y');
  });
});
