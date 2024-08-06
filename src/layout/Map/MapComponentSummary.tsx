import React from 'react';

import { Typography } from '@material-ui/core';

import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { Map } from 'src/layout/Map/Map';
import classes from 'src/layout/Map/MapComponent.module.css';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IMapComponentSummary {
  targetNode: LayoutNode<'Map'>;
}

export function MapComponentSummary({ targetNode }: IMapComponentSummary) {
  const formDataSelector = FD.useDebouncedSelector();
  const markerLocation = targetNode.def.getMarkerLocation(targetNode, formDataSelector);

  if (markerLocation) {
    return (
      <>
        <Map
          mapNode={targetNode}
          markerLocation={markerLocation}
          isSummary={true}
        />
        <Typography className={classes.footer}>
          {markerLocation && (
            <Lang
              id={'map_component.selectedLocation'}
              params={[markerLocation.latitude, markerLocation.longitude]}
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
