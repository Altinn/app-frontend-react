import * as React from 'react';
import { Map } from '@altinn/altinn-design-system';
import type { IMapComponentProps } from 'src/components/base/MapComponent';
import { parseLocation } from 'src/components/base/MapComponent';
import {
  getLanguageFromKey,
  getParsedLanguageFromKey,
} from 'altinn-shared/utils';
import { useAppSelector } from 'src/common/hooks';

export interface IMapComponentSummary {
  component: IMapComponentProps;
  formData: any;
}

function MapComponentSummary({ component, formData }: IMapComponentSummary) {
  const layers = component.layers;
  const location = formData ? parseLocation(formData) : undefined;

  const zoom = location ? 16 : 4;
  const marker = location ? location : undefined;
  const language = useAppSelector((state) => state.language.language);

  const locationString = location
    ? getParsedLanguageFromKey(
        'map_component.selectedLocation',
        language,
        location,
      )
    : getLanguageFromKey('map_component.noSelectedLocation', language);

  return (
    <>
      {location && (
        <Map
          layers={layers}
          center={marker}
          zoom={zoom}
          marker={marker}
          readOnly={true}
          footerText={locationString}
        />
      )}
    </>
  );
}

export default MapComponentSummary;
