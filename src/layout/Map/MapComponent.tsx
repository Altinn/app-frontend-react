import React, { useEffect, useMemo, useState } from 'react';
import { AttributionControl, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

import { icon, type Map as LeafletMap } from 'leaflet';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Map/MapComponent.module.css';
import { markerIcon } from 'src/layout/Map/MapIcons';
import type { PropsFromGenericComponent } from 'src/layout';

export type IMapComponentProps = PropsFromGenericComponent<'Map'>;

// Default is center of Norway
const DefaultCenterLocation: Location = {
  latitude: 64.888996,
  longitude: 12.8186054,
};
const DefaultZoom = 4;

// Default zoom level that should be used when when flying to new markerLocation
const DefaultFlyToZoomLevel = 16;

// Default map layers from Kartverket
const DefaultMapLayers: MapLayer[] = [
  {
    url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=europa_forenklet&zoom={z}&x={x}&y={y}',
    attribution: 'Data © <a href="https://www.kartverket.no/">Kartverket</a>',
  },
  {
    url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norgeskart_bakgrunn2&zoom={z}&x={x}&y={y}',
    attribution: 'Data © <a href="https://www.kartverket.no/">Kartverket</a>',
  },
];

export interface Location {
  latitude: number;
  longitude: number;
}

export interface MapLayer {
  url: string;
  attribution?: string;
  subdomains?: string[];
}

export function MapComponent({ isValid, node }: IMapComponentProps) {
  const { readOnly, layers: customLayers, centerLocation, zoom: customZoom, dataModelBindings } = node.item;
  const { formData, setValue } = useDataModelBindings(dataModelBindings);
  const value = 'simpleBinding' in formData ? formData.simpleBinding : undefined;
  const location = parseLocation(value);

  const layers = customLayers ?? DefaultMapLayers;
  const zoom = customZoom ?? DefaultZoom;

  const handleMapClicked = ({ latitude, longitude }: Location) => {
    const fractionDigits = 6;
    setValue('simpleBinding', `${latitude.toFixed(fractionDigits)},${longitude.toFixed(fractionDigits)}`);
  };

  const [map, setMap] = useState<LeafletMap | null>(null);

  const validMarkerLocation = useMemo(() => {
    if (!location?.latitude || !location?.longitude) {
      return undefined;
    }
    return location;
  }, [location]);

  useEffect(() => {
    if (map && validMarkerLocation) {
      map.flyTo(
        {
          lat: validMarkerLocation.latitude,
          lng: validMarkerLocation.longitude,
        },
        DefaultFlyToZoomLevel,
      );
    }
  }, [map, validMarkerLocation]);

  return (
    <div className={`map-component${isValid ? '' : ' validation-error'}`}>
      <MapContainer
        className={classes.map}
        center={locationToTuple(location ?? centerLocation ?? DefaultCenterLocation)}
        zoom={location ? 16 : zoom}
        zoomControl={!readOnly}
        dragging={!readOnly}
        touchZoom={!readOnly}
        doubleClickZoom={!readOnly}
        scrollWheelZoom={!readOnly}
        attributionControl={false}
        ref={setMap}
      >
        {layers.map((layer, i) => (
          <TileLayer
            key={i}
            url={layer.url}
            attribution={layer.attribution}
            subdomains={layer.subdomains ? layer.subdomains : []}
            opacity={readOnly ? 0.5 : 1.0}
          />
        ))}
        <AttributionControl prefix={false} />
        {validMarkerLocation ? (
          <Marker
            position={locationToTuple(validMarkerLocation)}
            icon={icon(markerIcon)}
          />
        ) : null}
        <MapClickHandler
          readOnly={!!readOnly}
          onClick={handleMapClicked}
        />
      </MapContainer>
      <p className={classes.footer}>
        {location ? (
          <Lang
            id={'map_component.selectedLocation'}
            params={[location.latitude, location.longitude]}
          />
        ) : (
          <Lang id={'map_component.noSelectedLocation'} />
        )}
      </p>
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

function locationToTuple(location: Location): [number, number] {
  return [location.latitude, location.longitude];
}

type MapClickHandlerProps = { readOnly: boolean; onClick: (location: Location) => void };
const MapClickHandler = ({ onClick, readOnly }: MapClickHandlerProps) => {
  useMapEvents({
    click: (map) => {
      if (onClick && !readOnly) {
        const wrappedLatLng = map.latlng.wrap();
        onClick({
          latitude: wrappedLatLng.lat,
          longitude: wrappedLatLng.lng,
        });
      }
    },
  });

  return null;
};
