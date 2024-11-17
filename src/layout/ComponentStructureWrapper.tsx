import React from 'react';
import type { PropsWithChildren } from 'react';

import { Flex } from 'src/components/Flex';
import { Label } from 'src/components/label/Label';
import { AllComponentValidations } from 'src/features/validation/ComponentValidations';
import { useFormComponentCtx } from 'src/layout/FormComponentContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LabelProps } from 'src/components/label/Label';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutComponent } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ComponentStructureWrapperProps<Type extends CompTypes> = {
  node: LayoutNode<Type>;
  label?: LabelProps;
  style?: React.CSSProperties;
};

export function ComponentStructureWrapper<Type extends CompTypes = CompTypes>({
  node,
  children,
  label,
  style,
}: PropsWithChildren<ComponentStructureWrapperProps<Type>>) {
  const overrideItemProps = useFormComponentCtx()?.overrideItemProps;
  const _grid = useNodeItem(node, (i) => i.grid);
  const grid = overrideItemProps?.grid ?? _grid;
  const layoutComponent = node.def as unknown as LayoutComponent<Type>;
  const showValidationMessages = layoutComponent.renderDefaultValidations();

  const componentWithValidations = (
    <Flex
      container
      id={`form-content-${node.id}`}
      size={grid?.innerGrid}
      style={style}
    >
      {children}
      {showValidationMessages && <AllComponentValidations node={node} />}
    </Flex>
  );

  return label ? <Label {...label}>{componentWithValidations}</Label> : componentWithValidations;
}
