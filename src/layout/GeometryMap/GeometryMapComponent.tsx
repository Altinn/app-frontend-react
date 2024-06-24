import React from 'react';

import { Map } from '@altinn/altinn-design-system';
// import { Map } from 'leaflet';
import { makeStyles, Typography } from '@material-ui/core';
import type { Location } from '@altinn/altinn-design-system';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { markerIcon } from 'src/layout/GeometryMap/GeometryMapIcons';
import type { PropsFromGenericComponent } from 'src/layout';

export type IGeometryMapComponentProps = PropsFromGenericComponent<'GeometryMap'>;

export const useStyles = makeStyles(() => ({
  footer: {
    paddingTop: '12px',
  },
}));

export function GeometryMapComponent({ isValid, node }: IGeometryMapComponentProps) {
  const { readOnly, layers, centerLocation, zoom, dataModelBindings } = node.item;
  const classes = useStyles();
  const { formData, setValue } = useDataModelBindings(dataModelBindings);
  const value = 'simpleBinding' in formData ? formData.simpleBinding : undefined;
  const location = parseLocation(value);

  const handleGeometryMapClicked = ({ latitude, longitude }: Location) => {
    const fractionDigits = 6;
    setValue('simpleBinding', `${latitude.toFixed(fractionDigits)},${longitude.toFixed(fractionDigits)}`);
  };

  return (
    <div className={`geometry-map-component${isValid ? '' : ' validation-error'}`}>
      <Map
        layers={layers}
        centerLocation={location || centerLocation}
        zoom={location ? 16 : zoom}
        markerLocation={location}
        readOnly={readOnly}
        onClick={handleGeometryMapClicked}
        markerIcon={markerIcon}
      />
      <Typography className={classes.footer}>
        {location ? (
          <Lang
            id={'geometry_map_component.selectedLocation'}
            params={[location.latitude, location.longitude]}
          />
        ) : (
          <Lang id={'geometry_map_component.noSelectedLocation'} />
        )}
      </Typography>
    </div>
  );
}

export function parseLocation(locationString: string | undefined): Location | undefined {
  if (!locationString) {
    return undefined;
  }
  const latLonArray = locationString.split(',');
  if (latLonArray.length != 2) {
    window.logErrorOnce(`Invalid location string: ${locationString}`);
    return undefined;
  }
  const latString = latLonArray[0];
  const lonString = latLonArray[1];
  const lat = parseFloat(latString);
  const lon = parseFloat(lonString);
  if (isNaN(lat) || isNaN(lon)) {
    window.logErrorOnce(`Invalid location string: ${locationString}`);
    return undefined;
  }
  return {
    latitude: lat,
    longitude: lon,
  } as Location;
}
