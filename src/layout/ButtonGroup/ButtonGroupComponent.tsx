import React from 'react';

import { Grid } from '@material-ui/core';

import type { PropsFromGenericComponent } from '..';

import classes from 'src/layout/ButtonGroup/ButtonGroupComponent.module.css';
import { GenericComponentByRef } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

export function ButtonGroupComponent({ node }: PropsFromGenericComponent<'ButtonGroup'>) {
  const item = useNodeItem(node);
  const childNodeRefs = item.childComponents;
  return (
    <Grid
      item
      container
      alignItems='center'
      className={classes.container}
      data-componentid={node.getId()}
    >
      {childNodeRefs.map((nodeRef) => (
        <div
          key={nodeRef.nodeRef}
          data-componentid={nodeRef.nodeRef}
        >
          <GenericComponentByRef
            nodeRef={nodeRef}
            overrideDisplay={{ directRender: true }}
          />
        </div>
      ))}
    </Grid>
  );
}
