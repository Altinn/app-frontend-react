import * as React from 'react';
import { Map } from '@altinn/altinn-design-system';
import type { IMapComponentProps } from 'src/components/base/MapComponent';
import { parseLocation } from 'src/components/base/MapComponent';
import {
  getLanguageFromKey,
  getParsedLanguageFromKey,
} from 'altinn-shared/utils';
import { useAppSelector } from 'src/common/hooks';
import { Typography } from '@material-ui/core';

export interface IMapComponentSummary {
  component: IMapComponentProps;
  formData: any;
}

function MapComponentSummary({ component, formData }: IMapComponentSummary) {
  const layers = component.layers;
  const location = formData ? parseLocation(formData) : undefined;
  const language = useAppSelector((state) => state.language.language);
  const footerText = location
    ? getParsedLanguageFromKey('map_component.selectedLocation', language, [
        location.latitude,
        location.longitude,
      ])
    : getLanguageFromKey('map_component.noSelectedLocation', language);

  return (
    <>
      {location && (
        <Map
          readOnly={true}
          layers={layers}
          centerLocation={location}
          zoom={16}
          markerLocation={location}
        />
      )}
      <Typography>{footerText}</Typography>
    </>
  );
}

export default MapComponentSummary;
