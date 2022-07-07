import * as React from 'react';

import type { IComponentProps } from '..';
import type { Location, MapLayer } from '@altinn/altinn-design-system';
import { Map } from '@altinn/altinn-design-system';

import '../../styles/shared.css';
import {
  getLanguageFromKey,
  getParsedLanguageFromKey,
} from 'altinn-shared/utils';
import { makeStyles, Typography } from '@material-ui/core';

export interface IMapComponentProps extends IComponentProps {
  layers?: MapLayer[];
  centerLocation?: Location;
  zoom?: number;
}

export const useStyles = makeStyles((theme) => ({
  footer: {
    paddingTop: '12px',
    color: theme.altinnPalette.primary.blueDark,
  },
}));

export function MapComponent({
  formData,
  handleDataChange,
  language,
  readOnly,
  layers,
  centerLocation,
  zoom,
}: IMapComponentProps) {
  const classes = useStyles();
  const location = formData.simpleBinding
    ? parseLocation(formData.simpleBinding)
    : undefined;

  const footerText = location
    ? getParsedLanguageFromKey('map_component.selectedLocation', language, [
        location.latitude,
        location.longitude,
      ])
    : getLanguageFromKey('map_component.noSelectedLocation', language);

  const handleMapClicked = (location: Location) => {
    handleDataChange(`${location.latitude},${location.longitude}`);
  };

  return (
    <>
      <Map
        layers={layers}
        centerLocation={location || centerLocation}
        zoom={location ? 16 : zoom}
        markerLocation={location}
        readOnly={readOnly}
        onClick={handleMapClicked}
      />
      <Typography className={classes.footer}>{footerText}</Typography>
    </>
  );
}

export function parseLocation(locationString: string): Location {
  const latLonArray = locationString.split(',');
  if (latLonArray.length != 2) {
    console.error(`Invalid location string: ${locationString}`);
    return undefined;
  }
  const latString = latLonArray[0];
  const lonString = latLonArray[1];
  const lat = parseFloat(latString);
  const lon = parseFloat(lonString);
  if (isNaN(lat) || isNaN(lon)) {
    console.error(`Invalid location string: ${locationString}`);
    return undefined;
  }
  return {
    latitude: lat,
    longitude: lon,
  } as Location;
}
