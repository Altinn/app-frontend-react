import React from 'react';

import { Grid } from '@material-ui/core';

import type { PropsFromGenericComponent } from '..';

import { GenericComponent } from 'src/layout/GenericComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function ButtonGroupComponent(props: PropsFromGenericComponent<'ButtonGroup'>) {
  const childNodes = props.node.item.childComponents;
  return (
    <Grid
      item
      container
    >
      {childNodes.map((n: LayoutNode) => (
        <GenericComponent
          key={n.item.id}
          node={n}
          overrideDisplay={{ directRender: true }}
        />
      ))}
    </Grid>
  );
}
