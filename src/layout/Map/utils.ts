import { type GeoJSON } from 'geojson';
import { geoJson, LatLngBounds } from 'leaflet';
import WKT from 'terraformer-wkt-parser';

import type { IGeometryType, Location } from 'src/layout/Map/config.generated';
import type { Geometry, RawGeometry } from 'src/layout/Map/types';

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
  };
}

export function locationToTuple(location: Location): [number, number] {
  return [location.latitude, location.longitude];
}

export function isLocationValid(location: Location | undefined): location is Location {
  return typeof location?.latitude === 'number' && typeof location?.longitude === 'number';
}

export function parseGeometries(
  geometries: RawGeometry[] | undefined,
  geometryType?: IGeometryType,
): Geometry[] | undefined {
  if (!geometries) {
    return undefined;
  }

  const out: Geometry[] = [];

  for (const { data: rawData, label } of geometries) {
    if (geometryType === 'WKT') {
      const data = WKT.parse(rawData);
      out.push({
        data,
        label,
      });
    } else {
      const data = JSON.parse(rawData) as GeoJSON;
      out.push({
        data,
        label,
      });
    }
  }

  return out;
}

export function calculateBounds(geometries: Geometry[] | undefined): LatLngBounds | undefined {
  if (!geometries?.length) {
    return undefined;
  }

  const bounds: [[number, number], [number, number]] = geometries.reduce(
    (currentBounds, { data }) => {
      const bounds = geoJson(data).getBounds();
      currentBounds[0][0] = Math.min(bounds.getSouth(), currentBounds[0][0]);
      currentBounds[0][1] = Math.min(bounds.getWest(), currentBounds[0][1]);
      currentBounds[1][0] = Math.max(bounds.getNorth(), currentBounds[1][0]);
      currentBounds[1][1] = Math.max(bounds.getEast(), currentBounds[1][1]);
      return currentBounds;
    },
    [
      [90, 180],
      [-90, -180],
    ],
  );

  return new LatLngBounds(bounds);
}
