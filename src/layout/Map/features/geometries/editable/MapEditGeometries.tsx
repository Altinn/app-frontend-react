import React, { useEffect, useRef } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

// Import GeoJSON type
import L from 'leaflet';
import { v4 as uuidv4 } from 'uuid';
import type { Feature } from 'geojson';

import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { toRelativePath } from 'src/features/saveToGroup/useSaveToGroup';
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
  const isEditableBinding = useDataModelBindingsFor(baseComponentId, 'Map')?.geometryIsEditable;
  const geometryDataFieldName = geometryDataBinding?.field.split('.').pop();
  const isEditableFieldName = isEditableBinding?.field.split('.').pop();
  const initialGeometries = useMapParsedGeometries(baseComponentId)?.filter((g) => g.isEditable);

  const geometryDataPath = toRelativePath(geometryBinding, geometryDataBinding);

  const appendToList = FD.useAppendToList();
  const setLeafValue = FD.useSetLeafValue();
  const removeFromList = FD.useRemoveFromListCallback();

  const { toolbar } = useItemWhenType(baseComponentId, 'Map');

  useLeafletDrawSpritesheetFix();

  // Load initial data into the FeatureGroup on component mount
  useEffect(() => {
    console.log('Loading initial editable geometries into MapEditGeometries');
    const featureGroup = editRef.current;
    if (featureGroup && initialGeometries) {
      // Clear existing layers to prevent duplication if initialData changes
      featureGroup.clearLayers();

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

    if (!isEditableFieldName) {
      return;
    }

    const geo = e.layer.toGeoJSON();
    const geoString = JSON.stringify(geo);
    const uuid = uuidv4();

    appendToList({
      reference: geometryBinding,
      newValue: { [ALTINN_ROW_ID]: uuid, [geometryDataFieldName]: geoString, [isEditableFieldName]: true },
    });
  };

  const onEditedHandler = (e: L.DrawEvents.Edited) => {
    console.log('onEditedHandler called');
    if (!geometryBinding) {
      return;
    }

    if (!geometryDataFieldName) {
      return;
    }

    if (!geometryDataBinding) {
      return;
    }

    e.layers.eachLayer((layer) => {
      // @ts-expect-error test
      const editedGeo = layer.toGeoJSON();
      const altinnRowId = editedGeo.properties?.altinnRowId;
      const geoString = JSON.stringify(editedGeo);
      initialGeometries?.forEach((g, index) => {
        if (g.altinnRowId === altinnRowId) {
          const field = `${geometryBinding.field}[${index}].${geometryDataPath}`;
          setLeafValue({
            reference: { dataType: geometryDataBinding?.dataType, field },
            newValue: geoString,
          });
        }
      });
    });
  };

  const onDeletedHandler = (e: L.DrawEvents.Deleted) => {
    console.log('onDeletedHandler called');
    if (!geometryBinding) {
      return;
    }

    e.layers.eachLayer((layer) => {
      // @ts-expect-error test
      const deletedGeo = layer.toGeoJSON();
      removeFromList({
        reference: geometryBinding,
        callback: (item) => item[ALTINN_ROW_ID] === deletedGeo.properties?.altinnRowId,
      });
    });
  };

  return (
    <FeatureGroup ref={editRef}>
      <EditControl
        position='topright'
        onCreated={onCreatedHandler}
        onEdited={onEditedHandler}
        onDeleted={onDeletedHandler}
        draw={{
          polyline: !!toolbar?.polyline,
          polygon: !!toolbar?.polygon,
          rectangle: !!toolbar?.rectangle,
          circle: !!toolbar?.circle,
          marker: !!toolbar?.marker,
          circlemarker: false,
        }}
      />
    </FeatureGroup>
  );
}
