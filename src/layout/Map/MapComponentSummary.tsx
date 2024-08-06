import React from 'react';
import { AttributionControl, MapContainer, Marker, TileLayer } from 'react-leaflet';

import { Typography } from '@material-ui/core';
import cn from 'classnames';
import { icon } from 'leaflet';

import { Lang } from 'src/features/language/Lang';
import { DefaultCenterLocation, locationToTuple, parseLocation } from 'src/layout/Map/MapComponent';
import classes from 'src/layout/Map/MapComponent.module.css';
import { markerIcon } from 'src/layout/Map/MapIcons';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IMapComponentSummary {
  targetNode: LayoutNode<'Map'>;
}

export function MapComponentSummary({ targetNode }: IMapComponentSummary) {
  const { layers, centerLocation } = targetNode.item;
  const formData = targetNode.def.useDisplayData(targetNode);
  const location = parseLocation(formData);

  if (location) {
    return (
      <>
        <MapContainer
          className={cn(classes.map, classes.mapSummary)}
          center={locationToTuple(location ?? centerLocation ?? DefaultCenterLocation)}
          zoom={16}
          zoomControl={false}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          attributionControl={false}
        >
          {layers?.map((layer, i) => (
            <TileLayer
              key={i}
              url={layer.url}
              attribution={layer.attribution}
              subdomains={layer.subdomains ? layer.subdomains : []}
              opacity={0.5}
            />
          ))}
          <AttributionControl prefix={false} />
          {location ? (
            <Marker
              position={locationToTuple(location)}
              icon={icon(markerIcon)}
            />
          ) : null}
        </MapContainer>
        <Typography className={classes.footer}>
          {location && (
            <Lang
              id={'map_component.selectedLocation'}
              params={[location.latitude, location.longitude]}
            />
          )}
        </Typography>
      </>
    );
  }

  return (
    <Typography
      variant='body1'
      className={classes.emptyField}
    >
      <Lang id={'general.empty_summary'} />
    </Typography>
  );
}
