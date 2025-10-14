import React, { useRef } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import { v4 as uuidv4 } from 'uuid';
import type * as L from 'leaflet';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { useLeafletDrawSpritesheetFix } from 'src/layout/Map/features/geometries/editable/useLeafletDrawSpritesheetFix';
import { useMapParsedGeometries } from 'src/layout/Map/features/geometries/fixed/hooks';
import { useDataModelBindingsFor } from 'src/utils/layout/hooks';

interface MapEditGeometriesProps {
  baseComponentId: string;
}

export function MapEditGeometries({ baseComponentId }: MapEditGeometriesProps) {
  const editRef = useRef<L.FeatureGroup>(null);
  const geometryBinding = useDataModelBindingsFor(baseComponentId, 'Map')?.geometries;
  const geometryDataBinding = useDataModelBindingsFor(baseComponentId, 'Map')?.geometryData;
  const geometries = useMapParsedGeometries(baseComponentId);

  const appendToList = FD.useAppendToList();

  useLeafletDrawSpritesheetFix();

  /* const onShapeDrawn = (e) => {
    e.layer.on('click', () => {
      //editRef.current.leafletElement._toolbars.edit._modes.edit.handler.enable();
    });
    e.layer.on('contextmenu', () => {
      //do some contextmenu action here
    });
    e.layer.bindTooltip('Text', {
      className: 'leaflet-draw-tooltip:before leaflet-draw-tooltip leaflet-draw-tooltip-visible',
      sticky: true,
      direction: 'right',
    });
  }; */

  /* React.useEffect(() => {
    if (editRef.current?.getLayers().length === 0 && geojson) {
      L.geoJSON(geojson).eachLayer((layer) => {
        if (
          layer instanceof L.Marker
        ) {
          if (layer?.feature?.properties.radius && ref.current) {
            new L.Circle(layer.feature.geometry.coordinates.slice().reverse(), {
              radius: layer.feature?.properties.radius,
            }).addTo(ref.current);
          } else {
            ref.current?.addLayer(layer);
          }
        }
      });
    }
  }, [geojson]);

 */

  // useEffect(() => {
  // geometries?.forEach((layer) => {
  //   if (
  //     layer.data instanceof L.Polyline ||
  //     layer.data instanceof L.Polygon ||
  //     layer.data instanceof L.Marker
  //   ) {
  //   editRef.current?.addLayer(layer.data);
  //   }
  // })}, [geometries]);

  const onShapeDrawn = () => {
    if (!geometryBinding) {
      return { result: 'stoppedByBinding', uuid: undefined, index: undefined };
    }

    if (!geometryDataBinding) {
      return { result: 'stoppedByBinding', uuid: undefined, index: undefined };
    }

    const geo = editRef.current?.toGeoJSON();
    const geoString = JSON.stringify(geo);
    const uuid = uuidv4();

    console.log('geoString', geoString);
    appendToList({ reference: geometryBinding, newValue: { [ALTINN_ROW_ID]: uuid, wkt: geoString } });
    // if (geo?.type === 'FeatureCollection') {
    // setGeojson(geo);
    // }
  };

  return (
    <FeatureGroup ref={editRef}>
      <EditControl
        position='topright'
        onCreated={onShapeDrawn}
        draw={{
          marker: true,
          polyline: true,
          rectangle: true,
          circlemarker: false,
          circle: true,
          polygon: true,
        }}
      />
    </FeatureGroup>
  );
}
