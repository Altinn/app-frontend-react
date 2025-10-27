import React, { useEffect, useRef } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

// Import GeoJSON type
import L from 'leaflet';
import { v4 as uuidv4 } from 'uuid';
import type { Feature } from 'geojson';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { useLeafletDrawSpritesheetFix } from 'src/layout/Map/features/geometries/editable/useLeafletDrawSpritesheetFix';
import { useMapParsedGeometries } from 'src/layout/Map/features/geometries/fixed/hooks';
import { useDataModelBindingsFor } from 'src/utils/layout/hooks';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';

interface FeatureWithId extends Feature {
  properties: {
    altinnRowId?: string;
  };
}
interface MapEditGeometriesProps {
  baseComponentId: string;
}

export function MapEditGeometries({ baseComponentId }: MapEditGeometriesProps) {
  const { geometryType } = useItemWhenType(baseComponentId, 'Map');
  const editRef = useRef<L.FeatureGroup>(null);
  const geometryBinding = useDataModelBindingsFor(baseComponentId, 'Map')?.geometries;
  const geometryDataBinding = useDataModelBindingsFor(baseComponentId, 'Map')?.geometryData;
  const geometryDataFieldName = geometryDataBinding?.field.split('.').pop();
  const initialGeometries = useMapParsedGeometries(baseComponentId)?.filter((g) => g.isEditable);

  const appendToList = FD.useAppendToList();

  useLeafletDrawSpritesheetFix();

  // Load initial data into the FeatureGroup on component mount
  useEffect(() => {
    const featureGroup = editRef.current;
    if (featureGroup && initialGeometries) {
      // Clear existing layers to prevent duplication if initialData changes
      featureGroup.clearLayers();
      console.log('initialGeometries', initialGeometries);

      // 1. Iterate through the array of data items
      initialGeometries.forEach((item) => {
        // if (geometryType == 'WKT') {

        // }
        if (item.data && item.data.type === 'FeatureCollection') {
          // 2. Iterate through the features within each item's FeatureCollection
          item.data.features.forEach((feature: Feature) => {
            // 3. IMPORTANT: Attach the unique ID to the feature's properties
            const newFeature: FeatureWithId = {
              ...feature, // Copy type, geometry, etc.
              properties: {
                ...feature.properties, // Copy any existing properties
                altinnRowId: item.altinnRowId, // Add our ID
              },
            };

            // 4. Create a GeoJSON layer for the single feature and add it to the group
            const leafletLayer = L.geoJSON(newFeature);
            leafletLayer.eachLayer((layer) => {
              featureGroup.addLayer(layer);
            });
          });
        }

        if (item.data && item.data.type === 'Feature') {
          const feature = item.data as Feature;
          const newFeature: FeatureWithId = {
            ...feature,
            properties: {
              ...feature.properties,
              altinnRowId: item.altinnRowId,
            },
          };

          const leafletLayer = L.geoJSON(newFeature);
          leafletLayer.eachLayer((layer) => {
            featureGroup.addLayer(layer);
          });
        }
      });
    }
  }, [initialGeometries]); // Dependency array ensures this runs if initialData changes

  const onCreatedHandler = (e: L.DrawEvents.Created) => {
    if (!geometryBinding) {
      return;
    }

    if (!geometryDataFieldName) {
      return;
    }

    const geo = e.layer.toGeoJSON();
    const geoString = JSON.stringify(geo);
    const uuid = uuidv4();
    console.log('geometryDataFieldName', JSON.stringify(geometryDataFieldName));

    console.log('geoString', JSON.stringify(geoString));
    appendToList({
      reference: geometryBinding,
      newValue: { [ALTINN_ROW_ID]: uuid, [geometryDataFieldName]: geoString, isEditable: true },
    });
  };

  const onEditedHandler = () => {};

  return (
    <FeatureGroup ref={editRef}>
      <EditControl
        position='topright'
        onCreated={onCreatedHandler}
        onEdited={onEditedHandler}
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
