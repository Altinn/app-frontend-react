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
import type { IGridStyling } from 'src/layout/common.generated';

const MIN_INPUT_COLUMNS = 7;
const GRID_BREAKPOINT_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'];

function getInnerGridWithMinInputColumns(inner: IGridStyling | undefined): IGridStyling {
  if (!inner) {
    return { xs: 12 };
  }
  return {
    xs: 12,
    ...Object.fromEntries(
      GRID_BREAKPOINT_KEYS.map((key): [typeof key, number] | undefined => {
        const value = inner[key];
        if (typeof value === 'number') {
          return [key, Math.max(MIN_INPUT_COLUMNS, Math.min(12, value))];
        }
        return undefined;
      }).filter((entry): entry is [(typeof GRID_BREAKPOINT_KEYS)[number], number] => !!entry),
    ),
  };
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

  const labelGrid = grid?.labelGrid;
  const innerGrid = grid?.innerGrid;

  const usesSideBySideLabelAndInput =
    !!labelGrid &&
    !!innerGrid &&
    GRID_BREAKPOINT_KEYS.some((breakpointKey) => {
      const labelGridValue = labelGrid[breakpointKey];
      const innerGridValue = innerGrid[breakpointKey];
      return (
        typeof labelGridValue === 'number' &&
        typeof innerGridValue === 'number' &&
        labelGridValue + innerGridValue <= 12
      );
    });

  const isInputTooNarrow =
    !!innerGrid &&
    GRID_BREAKPOINT_KEYS.some((breakpointKey) => {
      const innerGridValue = innerGrid[breakpointKey];
      return typeof innerGridValue === 'number' && innerGridValue < MIN_INPUT_COLUMNS;
    });

  const contentGridSize: IGridStyling =
    (!usesSideBySideLabelAndInput || isInputTooNarrow) && innerGrid
      ? getInnerGridWithMinInputColumns(innerGrid)
      : { xs: 12, ...innerGrid };

  const componentWithValidations = (
    <Flex
      id={`form-content-${indexedId}`}
      className={className}
      size={contentGridSize}
      style={style}
      item
    >
      {children}
      {showValidationMessages && <AllComponentValidations baseComponentId={baseComponentId} />}
    </Flex>
  );

  return label ? <Label {...label}>{componentWithValidations}</Label> : componentWithValidations;
}
