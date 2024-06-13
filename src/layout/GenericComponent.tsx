import React, { useMemo } from 'react';

import { Grid } from '@material-ui/core';
import classNames from 'classnames';

import { NavigationResult, useFinishNodeNavigation } from 'src/features/form/layout/NavigateToNode';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { useIsDev } from 'src/hooks/useIsDev';
import { FormComponentContextProvider } from 'src/layout/FormComponentContext';
import classes from 'src/layout/GenericComponent.module.css';
import { GenericComponentDescription, GenericComponentLabel } from 'src/layout/GenericComponentUtils';
import { shouldRenderLabelInGenericComponent } from 'src/layout/index';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { gridBreakpoints, pageBreakStyles } from 'src/utils/formComponentUtils';
import { ComponentErrorBoundary } from 'src/utils/layout/ComponentErrorBoundary';
import { Hidden, NodesInternal, useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IGridStyling } from 'src/layout/common.generated';
import type { GenericComponentOverrideDisplay, IFormComponentContext } from 'src/layout/FormComponentContext';
import type { NodeRef, PropsFromGenericComponent } from 'src/layout/index';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { LayoutComponent } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface OverrideProps<Type extends CompTypes> {
  overrideItemProps?: Partial<Omit<CompInternal<Type>, 'id'>>;
  overrideDisplay?: GenericComponentOverrideDisplay;
}

export interface IGenericComponentProps<Type extends CompTypes> extends OverrideProps<Type> {
  node: LayoutNode<Type>;
}

export interface IGenericComponentByIdProps<Type extends CompTypes> extends OverrideProps<Type> {
  id: string;
}

export interface IGenericComponentByRefProps<Type extends CompTypes> extends OverrideProps<Type> {
  nodeRef: NodeRef;
}

/**
 * Lazily renders a component referenced by a component ID. This is useful when you want to optimize rendering
 * (for example in Form.tsx) where it's important that a component does not re-render when other nodes in the
 * node hierarchy have been re-created.
 */
export function GenericComponentById<Type extends CompTypes = CompTypes>(props: IGenericComponentByIdProps<Type>) {
  const node = useNode(props.id);
  if (!node) {
    throw new Error(`Node with id '${props.id}' not found`);
  }

  return (
    <GenericComponent
      node={node}
      overrideItemProps={props.overrideItemProps}
      overrideDisplay={props.overrideDisplay}
    />
  );
}

export function GenericComponentByRef<Type extends CompTypes = CompTypes>(props: IGenericComponentByRefProps<Type>) {
  const node = useNode(props.nodeRef);
  if (!node) {
    throw new Error(`Node with ref '${props.nodeRef.nodeRef}' not found`);
  }

  return (
    <GenericComponent
      node={node}
      overrideItemProps={props.overrideItemProps}
      overrideDisplay={props.overrideDisplay}
    />
  );
}

function _GenericComponent<Type extends CompTypes = CompTypes>({
  node,
  overrideItemProps,
  overrideDisplay,
}: IGenericComponentProps<Type>) {
  const generatorErrors = NodesInternal.useNodeData(node, (node) => node.errors);
  if (generatorErrors && Object.keys(generatorErrors).length > 0) {
    return (
      <ErrorList
        node={node}
        errors={Object.keys(generatorErrors)}
      />
    );
  }

  return (
    <ComponentErrorBoundary node={node}>
      <ActualGenericComponent<Type>
        node={node}
        overrideItemProps={overrideItemProps}
        overrideDisplay={overrideDisplay}
      />
    </ComponentErrorBoundary>
  );
}

export const GenericComponent = React.memo(_GenericComponent);
GenericComponent.displayName = 'GenericComponent';

function ActualGenericComponent<Type extends CompTypes = CompTypes>({
  node,
  overrideItemProps,
  overrideDisplay,
}: IGenericComponentProps<Type>) {
  let item = useNodeItem(node);
  const id = node.getId();

  if (overrideItemProps) {
    item = {
      ...item,
      ...overrideItemProps,
    };
  }

  const containerDivRef = React.useRef<HTMLDivElement | null>(null);
  const validations = useUnifiedValidationsForNode(node);
  const isValid = !hasValidationErrors(validations);
  const isHidden = Hidden.useIsHidden(node);

  // If maxLength is set in both schema and component, don't display the schema error message
  const maxLength = 'maxLength' in item && item.maxLength;
  const filteredValidationErrors = maxLength
    ? validations.filter(
        (validation) =>
          !(validation.message.key === 'validation_errors.maxLength' && validation.message.params?.at(0) === maxLength),
      )
    : validations;

  const formComponentContext = useMemo<IFormComponentContext>(
    () => ({
      grid: item.grid,
      id,
      baseComponentId: item.baseComponentId,
      node,
    }),
    [item.baseComponentId, item.grid, id, node],
  );

  useFinishNodeNavigation(async (targetNode, shouldFocus, onHit) => {
    if (targetNode.getId() !== id) {
      return undefined;
    }
    onHit();
    let retryCount = 0;
    while (!containerDivRef.current && retryCount < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retryCount++;
    }
    if (!containerDivRef.current) {
      return NavigationResult.SuccessfulFailedToRender;
    }
    requestAnimationFrame(() => containerDivRef.current?.scrollIntoView());

    if (!shouldFocus) {
      // Hooray, we've arrived at the component, but we don't need to focus it.
      return NavigationResult.SuccessfulNoFocus;
    }

    const maybeInput = containerDivRef.current?.querySelector('input,textarea,select,p') as
      | HTMLSelectElement
      | HTMLInputElement
      | HTMLTextAreaElement;

    if (maybeInput) {
      maybeInput.focus();
    }

    return NavigationResult.SuccessfulWithFocus;
  });

  if (isHidden) {
    return null;
  }

  const layoutComponent = node.def as unknown as LayoutComponent<Type>;
  const RenderComponent = layoutComponent.render;

  const componentProps: PropsFromGenericComponent<Type> = {
    containerDivRef,
    isValid,
    node: node as unknown as LayoutNode<Type>,
    overrideItemProps,
    overrideDisplay,
  };

  const showValidationMessages = layoutComponent.renderDefaultValidations();

  if ('renderAsSummary' in item && item.renderAsSummary) {
    const RenderSummary = 'renderSummary' in node.def ? node.def.renderSummary.bind(node.def) : null;

    if (!RenderSummary) {
      return null;
    }

    return (
      <SummaryComponent
        summaryNode={node as LayoutNode<'Summary'>}
        overrides={{ display: { hideChangeButton: true, hideValidationMessages: true } }}
      />
    );
  }

  if (layoutComponent.directRender(componentProps) || overrideDisplay?.directRender) {
    return (
      <FormComponentContextProvider value={formComponentContext}>
        <RenderComponent
          {...componentProps}
          ref={containerDivRef}
        />
      </FormComponentContextProvider>
    );
  }

  return (
    <FormComponentContextProvider value={formComponentContext}>
      <Grid
        data-componentbaseid={node.getBaseId()}
        data-componentid={node.getId()}
        data-componenttype={node.getType()}
        ref={containerDivRef}
        item={true}
        container={true}
        {...gridBreakpoints(item.grid)}
        key={`grid-${id}`}
        className={classNames(
          classes.container,
          gridToClasses(item.grid?.labelGrid, classes),
          pageBreakStyles(item.pageBreak),
        )}
        alignItems='baseline'
      >
        {shouldRenderLabelInGenericComponent(node.getType()) && overrideDisplay?.renderLabel !== false && (
          <Grid
            item={true}
            {...gridBreakpoints(item.grid?.labelGrid)}
          >
            <GenericComponentLabel />
            <GenericComponentDescription />
          </Grid>
        )}
        <Grid
          key={`form-content-${id}`}
          item={true}
          id={`form-content-${id}`}
          {...gridBreakpoints(item.grid?.innerGrid)}
        >
          <RenderComponent {...componentProps} />
          {showValidationMessages && <ComponentValidations validations={filteredValidationErrors} />}
        </Grid>
      </Grid>
    </FormComponentContextProvider>
  );
}

const gridToClasses = (labelGrid: IGridStyling | undefined, classes: { [key: string]: string }) => {
  if (!labelGrid) {
    return {};
  }

  return {
    [classes.xs]: labelGrid.xs !== undefined && labelGrid.xs !== 'auto' && labelGrid.xs > 0 && labelGrid.xs < 12,
    [classes.sm]: labelGrid.sm !== undefined && labelGrid.sm !== 'auto' && labelGrid.sm > 0 && labelGrid.sm < 12,
    [classes.md]: labelGrid.md !== undefined && labelGrid.md !== 'auto' && labelGrid.md > 0 && labelGrid.md < 12,
    [classes.lg]: labelGrid.lg !== undefined && labelGrid.lg !== 'auto' && labelGrid.lg > 0 && labelGrid.lg < 12,
    [classes.xl]: labelGrid.xl !== undefined && labelGrid.xl !== 'auto' && labelGrid.xl > 0 && labelGrid.xl < 12,
  };
};

const ErrorList = ({ node, errors }: { node: LayoutNode; errors: string[] }) => {
  const id = node.getId();
  const isDev = useIsDev();
  if (!isDev) {
    return null;
  }

  return (
    <div className={classes.errorFallback}>
      <h3>
        <Lang
          id={'config_error.component_has_errors'}
          params={[id]}
        />
      </h3>
      <ul>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
      <p>
        <Lang id={'config_error.component_has_errors_after'} />
      </p>
    </div>
  );
};
