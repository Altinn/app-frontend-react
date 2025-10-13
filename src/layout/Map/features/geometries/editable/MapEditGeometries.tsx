import React, { useRef } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import type L from 'leaflet';

import { useLeafletDrawSpritesheetFix } from 'src/layout/Map/features/geometries/editable/useLeafletDrawSpritesheetFix';

export function MapEditGeometries() {
  const editRef = useRef<L.FeatureGroup>(null);

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
  const onShapeDrawn = () => {
    const geo = editRef.current?.toGeoJSON();
    console.log(geo);
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
