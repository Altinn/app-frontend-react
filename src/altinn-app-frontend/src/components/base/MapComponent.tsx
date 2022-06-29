import * as React from 'react';

import type { IComponentProps } from '..';
import { Map } from '@altinn/altinn-design-system';

import './MapComponent.css';
import '../../styles/shared.css';
import {
  getLanguageFromKey,
  getParsedLanguageFromKey,
} from 'altinn-shared/utils';

export interface IMapComponentProps extends IComponentProps {
  layers?: {
    url: string;
    attribution: string;
  }[];
  center?: [number, number];
  zoom?: number;
}

export function MapComponent({
  formData,
  handleDataChange,
  language,
  readOnly,
  layers,
  center,
  zoom,
}: IMapComponentProps) {
  const location = formData.simpleBinding
    ? parseLocation(formData.simpleBinding)
    : undefined;
  center = location ? location : center;
  zoom = location ? 16 : zoom;
  readOnly = readOnly ? readOnly : false;
  const footerText = location
    ? getParsedLanguageFromKey(
        'map_component.selectedLocation',
        language,
        location,
      )
    : getLanguageFromKey('map_component.noSelectedLocation', language);

  return (
    <>
      <Map
        layers={layers}
        center={center}
        zoom={zoom}
        marker={location}
        readOnly={readOnly}
        footerText={footerText}
        mapClicked={function (lat: number, lon: number) {
          handleDataChange(`${lat},${lon}`);
        }}
      />
    </>
  );
}

export function parseLocation(locationString: string): [number, number] {
  const latLonArray = locationString.split(',');
  if (latLonArray.length != 2) {
    throw Error(`Invalid location string: ${locationString}`);
  }
  const latString = latLonArray[0];
  const lonString = latLonArray[1];
  const lat = parseFloat(latString);
  const lon = parseFloat(lonString);
  if (isNaN(lat) || isNaN(lon)) {
    throw Error(`Invalid location string: ${locationString}`);
  }
  return [lat, lon];
}
