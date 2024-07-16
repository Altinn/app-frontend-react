import React from 'react';

import { Grid } from '@material-ui/core';

import type { PropsFromGenericComponent } from '..';

import { ComponentWithLabel } from 'src/features/label/ComponentWithLabel/ComponentWithLabel';
import classes from 'src/layout/ButtonGroup/ButtonGroupComponent.module.css';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { ComponentWithLabelProps } from 'src/features/label/ComponentWithLabel/ComponentWithLabel';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function ButtonGroupComponent({ node }: PropsFromGenericComponent<'ButtonGroup'>) {
  const childNodes = node.item.childComponents;

  const labelProps = {
    id: node.item.id,
    label: node.item.textResourceBindings?.title,
    description: node.item.textResourceBindings?.description,
    helpText: node.item.textResourceBindings?.help,
    labelSettings: node.item.labelSettings,
    renderLabelAs: 'legend',
  } satisfies ComponentWithLabelProps;

  return (
    <ComponentWithLabel {...labelProps}>
      <Grid
        item
        container
        alignItems='center'
        className={classes.container}
      >
        {childNodes.map((n: LayoutNode) => (
          <div
            key={n.item.id}
            data-componentid={n.item.id}
            data-componentbaseid={n.item.baseComponentId ?? n.item.id}
          >
            <GenericComponent
              node={n}
              overrideDisplay={{ directRender: true }}
            />
          </div>
        ))}
      </Grid>
    </ComponentWithLabel>
  );
}
