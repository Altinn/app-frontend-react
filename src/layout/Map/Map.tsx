import React, { useEffect, useState } from 'react';
import { AttributionControl, MapContainer, Marker, TileLayer, useMapEvent } from 'react-leaflet';

import cn from 'classnames';
import { icon, type Map as LeafletMap } from 'leaflet';
import Icon from 'leaflet/dist/images/marker-icon.png';
import RetinaIcon from 'leaflet/dist/images/marker-icon-2x.png';
import IconShadow from 'leaflet/dist/images/marker-shadow.png';

import classes from 'src/layout/Map/MapComponent.module.css';
import { isLocationValid, locationToTuple } from 'src/layout/Map/utils';
import type { Location, MapLayer } from 'src/layout/Map/config.generated';
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
    const location = event.latlng.wrap();
    onClick({
      latitude: location.lat,
      longitude: location.lng,
    });
  });

  return null;
}

type MapProps = {
  mapNode: LayoutNode<'Map'>;
  markerLocation?: Location;
  setMarkerLocation?: (location: Location) => void;
  isSummary?: boolean;
  className?: string;
};

export function Map({ mapNode, isSummary, markerLocation, setMarkerLocation, className }: MapProps) {
  const [map, setMap] = useState<LeafletMap | null>(null);

  const { readOnly, layers: customLayers, centerLocation: customCenterLocation, zoom: customZoom } = mapNode.item;
  const isInteractive = !readOnly && !isSummary;
  const layers = customLayers ?? DefaultMapLayers;
  const centerLocation = customCenterLocation ?? DefaultCenterLocation;
  const zoom = customZoom ?? DefaultZoom;
  const markerLocationIsValid = isLocationValid(markerLocation);

  useEffect(() => {
    if (!isSummary && markerLocationIsValid && map) {
      map.flyTo({ lat: markerLocation.latitude, lng: markerLocation.longitude }, DefaultFlyToZoomLevel);
    }
  }, [isSummary, markerLocationIsValid, map, markerLocation]);

  return (
    <MapContainer
      className={cn(classes.map, { [classes.mapSummary]: isSummary }, className)}
      center={locationToTuple(markerLocationIsValid ? markerLocation : centerLocation)}
      zoom={markerLocationIsValid ? 16 : zoom}
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
          opacity={isInteractive ? 1.0 : 0.5}
        />
      ))}
      <AttributionControl prefix={false} />
      {markerLocationIsValid ? (
        <Marker
          position={locationToTuple(markerLocation)}
          icon={markerIcon}
        />
      ) : null}
    </MapContainer>
  );
}
