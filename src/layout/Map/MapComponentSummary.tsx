import React from 'react';

import { Typography } from '@material-ui/core';

import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { Map } from 'src/layout/Map/Map';
import classes from 'src/layout/Map/MapComponent.module.css';
import { isLocationValid, parseLocation } from 'src/layout/Map/utils';
import type { RawGeometry } from 'src/layout/Map/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IMapComponentSummary {
  targetNode: LayoutNode<'Map'>;
}

export function MapComponentSummary({ targetNode }: IMapComponentSummary) {
  const { simpleBinding: markerBinding } = targetNode.item.dataModelBindings;
  const formDataSelector = FD.useDebouncedSelector();
  const formData = targetNode.getFormData(formDataSelector);
  const markerLocation = parseLocation(formData.simpleBinding);
  const markerLocationIsValid = isLocationValid(markerLocation);
  const geometries = formData.geometries as RawGeometry[] | undefined;

  if (markerBinding && !markerLocationIsValid) {
    return (
      <Typography
        variant='body1'
        className={classes.emptyField}
      >
        <Lang id={'general.empty_summary'} />
      </Typography>
    );
  }

  return (
    <>
      <Map
        mapNode={targetNode}
        markerLocation={markerLocation}
        geometries={geometries}
        isSummary={true}
      />
      {markerLocation && (
        <Typography className={classes.footer}>
          <Lang
            id={'map_component.selectedLocation'}
            params={[markerLocation.latitude, markerLocation.longitude]}
          />
        </Typography>
      )}
    </>
  );
}
