import React, { useEffect, useMemo, useState } from 'react';
import { AttributionControl, GeoJSON, MapContainer, Marker, TileLayer, Tooltip, useMapEvent } from 'react-leaflet';

import cn from 'classnames';
import { icon, type Map as LeafletMap } from 'leaflet';
import Icon from 'leaflet/dist/images/marker-icon.png';
import RetinaIcon from 'leaflet/dist/images/marker-icon-2x.png';
import IconShadow from 'leaflet/dist/images/marker-shadow.png';

import classes from 'src/layout/Map/MapComponent.module.css';
import { calculateBounds, isLocationValid, locationToTuple, parseGeometries } from 'src/layout/Map/utils';
import type { Location, MapLayer } from 'src/layout/Map/config.generated';
import type { RawGeometry } from 'src/layout/Map/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

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
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  },
  {
    url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
    attribution: '&copy; <a href="http://www.kartverket.no/">Kartverket</a>',
  },
];

export const markerIcon = icon({
  iconUrl: Icon,
  iconRetinaUrl: RetinaIcon,
  shadowUrl: IconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onClick }: { map: LeafletMap; onClick: (location: Location) => void }) {
  useMapEvent('click', (event) => {
    if (!event.originalEvent.defaultPrevented) {
      const location = event.latlng.wrap();
      onClick({
        latitude: location.lat,
        longitude: location.lng,
      });
    }
  });

  return null;
}

type MapProps = {
  mapNode: LayoutNode<'Map'>;
  markerLocation?: Location;
  setMarkerLocation?: (location: Location) => void;
  geometries?: RawGeometry[];
  isSummary?: boolean;
  className?: string;
};

export function Map({
  mapNode,
  isSummary,
  markerLocation,
  setMarkerLocation,
  geometries: rawGeometries,
  className,
}: MapProps) {
  const [map, setMap] = useState<LeafletMap | null>(null);

  const {
    readOnly,
    layers: customLayers,
    centerLocation: customCenterLocation,
    zoom: customZoom,
    geometryType,
  } = mapNode.item;
  const isInteractive = !readOnly && !isSummary;
  const layers = customLayers ?? DefaultMapLayers;
  const markerLocationIsValid = isLocationValid(markerLocation);
  const geometries = useMemo(() => parseGeometries(rawGeometries, geometryType), [geometryType, rawGeometries]);
  const geometryBounds = useMemo(() => calculateBounds(geometries), [geometries]);

  useEffect(() => {
    if (markerLocationIsValid && map) {
      map.flyTo({ lat: markerLocation.latitude, lng: markerLocation.longitude }, DefaultFlyToZoomLevel, {
        animate: !isSummary,
      });
    }
  }, [isSummary, markerLocationIsValid, map, markerLocation]);

  // center & zoom / bounds controls the starting view of the map
  // 1. If a marker is set, center on that with high zoom
  // 2. If custom center and/or zoom is set, use that
  // 3. If neither, but there are geometries present, use bounds to center on those
  // 4. Use default center and zoom
  const center = markerLocationIsValid
    ? locationToTuple(markerLocation)
    : customCenterLocation
      ? locationToTuple(customCenterLocation)
      : geometryBounds
        ? undefined
        : locationToTuple(DefaultCenterLocation);
  const zoom = markerLocationIsValid ? 16 : customZoom ? customZoom : geometryBounds ? undefined : DefaultZoom;
  const bounds = markerLocationIsValid || customCenterLocation || customZoom ? undefined : geometryBounds;

  return (
    <MapContainer
      className={cn(classes.map, { [classes.mapReadOnly]: !isInteractive }, className)}
      center={center}
      zoom={zoom}
      bounds={bounds}
      minZoom={3}
      maxBounds={[
        [-90, -200],
        [90, 200],
      ]}
      fadeAnimation={isInteractive}
      zoomControl={isInteractive}
      dragging={isInteractive}
      touchZoom={isInteractive}
      doubleClickZoom={isInteractive}
      scrollWheelZoom={isInteractive}
      attributionControl={false}
      ref={setMap}
    >
      {map && setMarkerLocation && isInteractive && (
        <MapClickHandler
          map={map}
          onClick={setMarkerLocation}
        />
      )}
      {layers.map((layer, i) => (
        <TileLayer
          key={i}
          url={layer.url}
          attribution={layer.attribution}
          subdomains={layer.subdomains ? layer.subdomains : []}
        />
      ))}
      {geometries?.map(({ data, label }, i) => (
        <GeoJSON
          key={`${i}-${label}`}
          data={data}
          interactive={false}
        >
          {label && (
            <Tooltip
              permanent={true}
              interactive={true}
              direction='top'
              eventHandlers={{
                click: (e) => e.originalEvent.preventDefault(),
              }}
            >
              {label}
            </Tooltip>
          )}
        </GeoJSON>
      ))}
      {markerLocationIsValid ? (
        <Marker
          position={locationToTuple(markerLocation)}
          icon={markerIcon}
          eventHandlers={
            isInteractive && setMarkerLocation
              ? {
                  click: () => {},
                  dragend: (e) => {
                    const { lat, lng } = e.target._latlng;
                    setMarkerLocation({ latitude: lat, longitude: lng });
                  },
                }
              : undefined
          }
          interactive={isInteractive}
          draggable={isInteractive}
          keyboard={isInteractive}
        />
      ) : null}
      <AttributionControl prefix={false} />
    </MapContainer>
  );
}
