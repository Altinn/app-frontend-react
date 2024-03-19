import React from 'react';

import classes from 'src/layout/CardGroup/CardGroup.module.css';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ICardGroupProps = PropsFromGenericComponent<'CardGroup'>;

export const CardGroup = ({ node }: ICardGroupProps) => (
  <div className={classes.container}>
    {node.item.childComponents.map((n: LayoutNode<'Card'>) => (
      <GenericComponent<'Card'>
        key={n.item.id}
        node={n}
      />
    ))}
  </div>
);
