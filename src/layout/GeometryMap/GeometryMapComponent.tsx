import React, { useState } from 'react';
import { AttributionControl, MapContainer, TileLayer } from 'react-leaflet';

import { Typography } from '@material-ui/core';
import type { Location } from '@altinn/altinn-design-system';
import type { Map as LeafletMap } from 'leaflet';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/GeometryMap/GeometryMapComponent.module.css';
import type { PropsFromGenericComponent } from 'src/layout';
import type { GeometryMapLocation } from 'src/layout/GeometryMap/config.generated';

export type IGeometryMapComponentProps = PropsFromGenericComponent<'GeometryMap'>;

export function GeometryMapComponent({ isValid, node }: IGeometryMapComponentProps) {
  const { readOnly, layers, centerLocation, zoom, dataModelBindings } = node.item;
  const { formData, setValue } = useDataModelBindings(dataModelBindings);
  const value = 'simpleBinding' in formData ? formData.simpleBinding : undefined;
  const location = parseLocation(value);

  const handleGeometryMapClicked = ({ latitude, longitude }: Location) => {
    const fractionDigits = 6;
    setValue('simpleBinding', `${latitude.toFixed(fractionDigits)},${longitude.toFixed(fractionDigits)}`);
  };

  const DefaultCenterLocation: Location = {
    latitude: 64.888996,
    longitude: 12.8186054,
  };

  const center = location
    ? locationToTuple(location)
    : centerLocation
      ? locationToTuple(centerLocation)
      : locationToTuple(DefaultCenterLocation);
  const [map, setMap] = useState<LeafletMap | null>(null);

  return (
    <div className={`geometry-map-component${isValid ? '' : ' validation-error'}`}>
      <MapContainer
        className={classes.map}
        center={center}
        ref={setMap}
        zoom={location ? 16 : zoom}
        dragging={!readOnly}
        attributionControl={false}
      >
        {layers?.map((layer, i) => (
          <TileLayer
            key={i}
            url={layer.url}
            attribution={layer.attribution}
            subdomains={layer.subdomains ? layer.subdomains : []}
            opacity={readOnly ? 0.5 : 1.0}
          />
        ))}
        <AttributionControl prefix={false} />
      </MapContainer>
      {/* <Map
        layers={layers}
        centerLocation={location || centerLocation}
        markerLocation={location}
        readOnly={readOnly}
        onClick={handleGeometryMapClicked}
        markerIcon={markerIcon}
      /> */}
      <Typography className={classes.contaier}>
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

function locationToTuple(location: Location | GeometryMapLocation): [number, number] {
  return [location.latitude, location.longitude];
}
