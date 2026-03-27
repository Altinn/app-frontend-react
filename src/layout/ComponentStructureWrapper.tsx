import React from 'react';
import type { PropsWithChildren } from 'react';

import { Flex } from 'src/app-components/Flex/Flex';
import { Label } from 'src/components/label/Label';
import { AllComponentValidations } from 'src/features/validation/ComponentValidations';
import { useFormComponentCtx } from 'src/layout/FormComponentContext';
import { getComponentDef } from 'src/layout/index';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useExternalItem } from 'src/utils/layout/hooks';
import type { LabelProps } from 'src/components/label/Label';
import type { IGridSize, IGridStyling } from 'src/layout/common.generated';

const GRID_BREAKPOINT_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

function mergeMaxGridSizePair(
  innerSize: IGridSize | undefined,
  validationSize: IGridSize | undefined,
): IGridSize | undefined {
  if (typeof innerSize === 'number' && typeof validationSize === 'number') {
    return Math.max(innerSize, validationSize) as IGridSize;
  }
  return innerSize ?? validationSize;
}

function mergeMaxGridStyling(
  innerGrid: IGridStyling | undefined,
  validationGrid: IGridStyling | undefined,
): IGridStyling {
  if (!innerGrid && !validationGrid) {
    return { xs: 12 };
  }
  const result: IGridStyling = { xs: 12 };
  for (const bp of GRID_BREAKPOINT_KEYS) {
    const merged = mergeMaxGridSizePair(innerGrid?.[bp], validationGrid?.[bp]);
    if (merged !== undefined) {
      result[bp] = merged;
    }
  }
  return result;
}

type ComponentStructureWrapperProps = {
  baseComponentId: string;
  label?: LabelProps;
  className?: string;
  style?: React.CSSProperties;
};

export function ComponentStructureWrapper({
  baseComponentId,
  children,
  label,
  className,
  style,
}: PropsWithChildren<ComponentStructureWrapperProps>) {
  const overrideItemProps = useFormComponentCtx()?.overrideItemProps;
  const component = useExternalItem(baseComponentId);
  const grid = overrideItemProps?.grid ?? component?.grid;
  const layoutComponent = getComponentDef(component.type);
  const showValidationMessages = layoutComponent.renderDefaultValidations();
  const indexedId = useIndexedId(baseComponentId);

  const innerGrid = grid?.innerGrid;
  const validationGrid = grid?.validationGrid ?? innerGrid;
  const contentGridSize: IGridStyling = mergeMaxGridStyling(innerGrid, validationGrid);

  const componentWithValidations = (
    <Flex
      id={`form-content-${indexedId}`}
      className={className}
      size={contentGridSize}
      style={style}
      item
    >
      <Flex
        item
        size={{ xs: 12, ...innerGrid }}
      >
        {children}
      </Flex>
      {showValidationMessages && (
        <Flex
          item
          size={{ xs: 12, ...validationGrid }}
        >
          <AllComponentValidations baseComponentId={baseComponentId} />
        </Flex>
      )}
    </Flex>
  );

  return label ? <Label {...label}>{componentWithValidations}</Label> : componentWithValidations;
}
