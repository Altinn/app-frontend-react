import React, { useState } from 'react';
import { AttributionControl, MapContainer, Polygon, TileLayer, Tooltip } from 'react-leaflet';

import dot from 'dot-object';
import WKT from 'terraformer-wkt-parser';
import type { Location, MapLayer } from '@altinn/altinn-design-system';
import type { Geometry } from 'geojson';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';

import { FD } from 'src/features/formData/FormDataWrite';
import classes from 'src/layout/GeometryMap/GeometryMapComponent.module.css';
import type { PropsFromGenericComponent } from 'src/layout';
import type { GeometryMapLocation } from 'src/layout/GeometryMap/config.generated';

export type IGeometryMapComponentProps = PropsFromGenericComponent<'GeometryMap'>;

export function GeometryMapComponent({ isValid, node }: IGeometryMapComponentProps) {
  const { readOnly, centerLocation, zoom, dataModelBindings } = node.item;

  const layers: MapLayer[] = [
    {
      url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=europa_forenklet&zoom={z}&x={x}&y={y}',
      attribution: 'Data © <a href="https://www.kartverket.no/">Kartverket</a>',
    },
    {
      url: 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norgeskart_bakgrunn2&zoom={z}&x={x}&y={y}',
      attribution: 'Data © <a href="https://www.kartverket.no/">Kartverket</a>',
    },
  ];

  const coordinates: any = [];
  const labels: any = [];

  const formData = FD.useFreshBindings(dataModelBindings, 'raw');
  if (Array.isArray(formData['array'])) {
    for (const obj of formData['array']) {
      const arrayBinding = dataModelBindings['array'];
      const textBinding = dataModelBindings.label.replace(`${arrayBinding}.`, '');
      const wktStringBinding = dataModelBindings.wkt.replace(`${arrayBinding}.`, '');
      coordinates.push(dot.pick(wktStringBinding, obj));
      labels.push(dot.pick(textBinding, obj));
    }
  } else {
    coordinates.push(formData['wkt']);
    labels.push(formData['label']);
  }

  const [inputCoords, geometryType] = findCoordinates(coordinates);

  const polyCenter = findPolygonCenter(inputCoords[0][0]);

  const DefaultCenterLocation: Location = {
    latitude: 64.888996,
    longitude: 12.8186054,
  };

  const center = polyCenter
    ? polyCenter
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
        zoom={polyCenter ? 4 : 16}
        dragging={!readOnly}
        attributionControl={false}
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

        {inputCoords.map(
          (coords, i) =>
            geometryType[i] === 'polygon' ?? (
              <Polygon
                key={i}
                positions={coords}
              >
                <Tooltip>{labels !== undefined ? <span>{JSON.stringify(labels[i])}</span> : <div></div>}</Tooltip>
              </Polygon>
            ),
        )}
      </MapContainer>
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

function findPolygonCenter(polygonCoords: LatLngExpression[]): [number, number] {
  let totalLat = 0;
  let totalLng = 0;

  polygonCoords.forEach((coord) => {
    totalLat += coord[1];
    totalLng += coord[0];
  });

  const avgLat = totalLat / polygonCoords.length;
  const avgLng = totalLng / polygonCoords.length;

  return [avgLng, avgLat];
}

function findCoordinates(inputString: string | string[]): [LatLngExpression[][][], string[]] {
  const coordinatesArray: LatLngExpression[][][] = [];
  const labelsArray: string[] = [];

  if (Array.isArray(inputString)) {
    inputString.forEach((input) => {
      const [coordinates, label] = handleGeoJson(parseWKTtoGeoJSON(input));
      coordinatesArray.push(coordinates);
      labelsArray.push(label);
    });
  } else {
    const [coordinates, label] = handleGeoJson(parseWKTtoGeoJSON(inputString));
    coordinatesArray.push(coordinates);
    labelsArray.push(label);
  }

  return [coordinatesArray, labelsArray];
}

function parseWKTtoGeoJSON(wktString): Geometry {
  return WKT.parse(wktString);
}

function handleGeoJson(geojson: Geometry): [LatLngExpression[][], string] {
  const coordinates: LatLngExpression[][] = [];
  switch (geojson.type) {
    case 'Polygon': {
      const polygonCoords: LatLngExpression[] = [];
      geojson.coordinates[0].forEach((pos) => {
        polygonCoords.push([pos[1], pos[0]]);
      });
      coordinates.push(polygonCoords);
      return [coordinates, 'polygon'];
    }
    case 'MultiPolygon': {
      geojson.coordinates.forEach((polygon) => {
        const polygonCoords: LatLngExpression[] = [];
        polygon.forEach((ring) => {
          ring.forEach((pos) => {
            polygonCoords.push([pos[1], pos[0]]);
          });
        });
        coordinates.push(polygonCoords);
      });
      return [coordinates, 'polygon'];
    }
    default:
      throw new Error(`Unsupported GeoJSON type: ${geojson.type}`);
  }
}
