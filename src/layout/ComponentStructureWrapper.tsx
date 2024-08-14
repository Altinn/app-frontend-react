import React from 'react';
import type { PropsWithChildren } from 'react';

import { Grid } from '@material-ui/core';

import { Label } from 'src/components/label/Label';
import { AllComponentValidations } from 'src/features/validation/ComponentValidations';
import { gridBreakpoints } from 'src/utils/formComponentUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LabelProps } from 'src/components/label/Label';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutComponent } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ComponentStructureWrapperProps<Type extends CompTypes> = {
  node: LayoutNode<Type>;
  label?: LabelProps;
};

export function ComponentStructureWrapper<Type extends CompTypes = CompTypes>({
  node,
  children,
  label,
}: PropsWithChildren<ComponentStructureWrapperProps<Type>>) {
  const innerGrid = useNodeItem(node, (i) => i.grid?.innerGrid);
  const layoutComponent = node.def as unknown as LayoutComponent<Type>;

  const showValidationMessages = layoutComponent.renderDefaultValidations();

  const componentWithValidations = (
    <Grid
      item
      id={`form-content-${node.id}`}
      {...gridBreakpoints(innerGrid)}
    >
      {children}
      {showValidationMessages && <AllComponentValidations node={node} />}
    </Grid>
  );

  return label ? <Label {...label}>{componentWithValidations}</Label> : componentWithValidations;
}
