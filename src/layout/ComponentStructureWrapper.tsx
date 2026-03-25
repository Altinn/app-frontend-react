import React from 'react';
import type { PropsWithChildren } from 'react';

import cn from 'classnames';

import { Flex } from 'src/app-components/Flex/Flex';
import { Label } from 'src/components/label/Label';
import { AllComponentValidations } from 'src/features/validation/ComponentValidations';
import classes from 'src/layout/ComponentStructureWrapper.module.css';
import { useFormComponentCtx } from 'src/layout/FormComponentContext';
import { getComponentDef } from 'src/layout/index';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useExternalItem } from 'src/utils/layout/hooks';
import type { LabelProps } from 'src/components/label/Label';
import type { IGridSize, IGridStyling } from 'src/layout/common.generated';

const GRID_BREAKPOINT_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const EXACT_WIDTH_CLASS_BY_BREAKPOINT: Partial<Record<(typeof GRID_BREAKPOINT_KEYS)[number], string>> = {
  xs: classes.useXs,
  sm: classes.useSm,
  md: classes.useMd,
  lg: classes.useLg,
};

function mergeMaxGridSizePair(
  innerSize: IGridSize | undefined,
  validationSize: IGridSize | undefined,
): IGridSize | undefined {
  if (typeof innerSize === 'number' && typeof validationSize === 'number') {
    return Math.max(innerSize, validationSize) as IGridSize;
  }
  if (typeof innerSize === 'number') {
    return innerSize;
  }
  if (typeof validationSize === 'number') {
    return validationSize;
  }
  if (innerSize !== undefined) {
    return innerSize;
  }
  return validationSize;
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

function inputGridSizeAndExactWidth(
  inner: IGridStyling | undefined,
  outer: IGridStyling,
): { size: IGridStyling; exactPercentWidthStyle: React.CSSProperties; exactClassName: string | undefined } {
  const base: IGridStyling = { xs: 12, ...inner };
  const result: IGridStyling = { ...base };
  const cssVars: Record<string, string> = {};

  for (const bp of GRID_BREAKPOINT_KEYS) {
    const innerVal = inner?.[bp];
    const outerVal = outer[bp];
    if (typeof innerVal === 'number' && typeof outerVal === 'number') {
      if (innerVal === outerVal) {
        result[bp] = 12 as IGridStyling[typeof bp];
      } else if (innerVal < outerVal) {
        if (bp === 'xl') {
          const scaled = Math.min(12, Math.max(1, Math.round((12 * innerVal) / outerVal)));
          result[bp] = scaled as IGridStyling[typeof bp];
        } else {
          delete result[bp];
          cssVars[`--input-pct-${bp}`] = `${(innerVal / outerVal) * 100}%`;
        }
      }
    }
  }

  const hasExact = Object.keys(cssVars).length > 0;
  const exactClassName = hasExact
    ? cn(
        classes.inputFlexExact,
        ...GRID_BREAKPOINT_KEYS.map((bp) =>
          cssVars[`--input-pct-${bp}`] ? EXACT_WIDTH_CLASS_BY_BREAKPOINT[bp] : null,
        ),
      )
    : undefined;

  return {
    size: result,
    exactPercentWidthStyle: cssVars as React.CSSProperties,
    exactClassName,
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

  const innerGrid = grid?.innerGrid;
  const validationGrid = grid?.validationGrid ?? innerGrid;
  const contentGridSize: IGridStyling = mergeMaxGridStyling(innerGrid, validationGrid);
  const {
    size: inputGridSize,
    exactPercentWidthStyle,
    exactClassName,
  } = inputGridSizeAndExactWidth(innerGrid, contentGridSize);
  const {
    size: validationGridSize,
    exactPercentWidthStyle: validationExactPercentWidthStyle,
    exactClassName: validationExactClassName,
  } = inputGridSizeAndExactWidth(validationGrid, contentGridSize);

  const componentWithValidations = (
    <Flex
      id={`form-content-${indexedId}`}
      className={className}
      size={contentGridSize}
      style={style}
      item
      container
      direction='column'
      flexWrap='nowrap'
    >
      <Flex
        item
        className={exactClassName}
        size={inputGridSize}
        style={exactPercentWidthStyle}
      >
        {children}
      </Flex>
      {showValidationMessages && (
        <Flex
          item
          className={validationExactClassName}
          size={validationGridSize}
          style={validationExactPercentWidthStyle}
        >
          <AllComponentValidations baseComponentId={baseComponentId} />
        </Flex>
      )}
    </Flex>
  );

  return label ? <Label {...label}>{componentWithValidations}</Label> : componentWithValidations;
}
