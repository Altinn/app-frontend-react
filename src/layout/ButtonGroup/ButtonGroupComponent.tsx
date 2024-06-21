import React from 'react';

import { Grid } from '@material-ui/core';

import type { PropsFromGenericComponent } from '..';

import classes from 'src/layout/ButtonGroup/ButtonGroupComponent.module.css';
import { GenericComponent } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

export function ButtonGroupComponent({ node }: PropsFromGenericComponent<'ButtonGroup'>) {
  const childComponents = useNodeItem(node, (i) => i.childComponents);
  return (
    <Grid
      item
      container
      alignItems='center'
      className={classes.container}
    >
      {childComponents.map((node) => (
        <div
          key={node.getId()}
          data-componentid={node.getId()}
          data-componentbaseid={node.getBaseId()}
        >
          <GenericComponent
            node={node}
            overrideDisplay={{ directRender: true }}
          />
        </div>
      ))}
    </Grid>
  );
}
