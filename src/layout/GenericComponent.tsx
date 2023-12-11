import React, { useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import { Grid, makeStyles } from '@material-ui/core';
import classNames from 'classnames';

import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useNavigationParams } from 'src/hooks/useNavigatePage';
import { FormComponentContextProvider } from 'src/layout/FormComponentContext';
import { GenericComponentDescription, GenericComponentLabel } from 'src/layout/GenericComponentUtils';
import { shouldComponentRenderLabel } from 'src/layout/index';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { gridBreakpoints, pageBreakStyles } from 'src/utils/formComponentUtils';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { IGridStyling } from 'src/layout/common.generated';
import type { GenericComponentOverrideDisplay, IFormComponentContext } from 'src/layout/FormComponentContext';
import type { PropsFromGenericComponent } from 'src/layout/index';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { LayoutComponent } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IGenericComponentProps<Type extends CompTypes> {
  node: LayoutNode<Type>;
  overrideItemProps?: Partial<Omit<CompInternal<Type>, 'id'>>;
  overrideDisplay?: GenericComponentOverrideDisplay;
}

const useStyles = makeStyles((theme) => ({
  container: {
    '@media print': {
      display: 'flex !important',
    },
  },
  xs: {
    'border-bottom': '1px dashed #949494',
    '& > div:nth-child(2)': {
      paddingLeft: theme.spacing(3 / 2), // Half the spacing of <Grid in <Form
    },
  },
  sm: {
    [theme.breakpoints.up('sm')]: {
      'border-bottom': '1px dashed #949494',
      '& > div:nth-child(2)': {
        paddingLeft: theme.spacing(3 / 2),
      },
    },
  },
  md: {
    [theme.breakpoints.up('md')]: {
      'border-bottom': '1px dashed #949494',
      '& > div:nth-child(2)': {
        paddingLeft: theme.spacing(3 / 2),
      },
    },
  },
  lg: {
    [theme.breakpoints.up('lg')]: {
      'border-bottom': '1px dashed #949494',
      '& > div:nth-child(2)': {
        paddingLeft: theme.spacing(3 / 2),
      },
    },
  },
  xl: {
    [theme.breakpoints.up('xl')]: {
      'border-bottom': '1px dashed #949494',
      '& > div:nth-child(2)': {
        paddingLeft: theme.spacing(3 / 2),
      },
    },
  },
}));

export function GenericComponent<Type extends CompTypes = CompTypes>({
  node,
  overrideItemProps,
  overrideDisplay,
}: IGenericComponentProps<Type>) {
  let item = node.item;
  const id = item.id;

  if (overrideItemProps) {
    item = {
      ...item,
      ...overrideItemProps,
    };
  }

  const dispatch = useAppDispatch();
  const classes = useStyles();
  const gridRef = React.useRef<HTMLDivElement>(null);
  const hasValidationMessages = node.hasValidationMessages('any');
  const hidden = node.isHidden();
  const { langAsNonProcessedString } = useLanguage(node);
  const { focusId, setFocusId } = usePageNavigationContext();

  const { pageKey } = useNavigationParams();
  const currentView = pageKey ?? '';
  const isValid = !node.hasValidationMessages('errors');

  const shouldFocus = id === focusId;
  const componentValidations = useAppSelector(
    (state) => state.formValidations.validations[currentView]?.[id],
    shallowEqual,
  );

  const filterValidationErrors = () => {
    const maxLength = 'maxLength' in node.item && node.item.maxLength;

    if (!maxLength) {
      return componentValidations?.simpleBinding;
    }

    // If maxLength is set in both schema and component, don't display the schema error message
    const errorMessageMaxLength = langAsNonProcessedString('validation_errors.maxLength', [maxLength]) as string;
    const componentErrors = componentValidations?.simpleBinding?.errors || [];
    const updatedErrors = componentErrors.filter((error: string) => error !== errorMessageMaxLength);

    return {
      ...componentValidations?.simpleBinding,
      errors: updatedErrors,
    };
  };

  const formComponentContext = useMemo<IFormComponentContext>(
    () => ({
      grid: item.grid,
      id,
      baseComponentId: item.baseComponentId,
      node,
    }),
    [item.baseComponentId, item.grid, id, node],
  );

  React.useLayoutEffect(() => {
    if (!hidden && shouldFocus && gridRef.current) {
      gridRef.current.scrollIntoView();

      const maybeInput = gridRef.current.querySelector('input,textarea,select') as
        | HTMLSelectElement
        | HTMLInputElement
        | HTMLTextAreaElement;
      if (maybeInput) {
        maybeInput.focus();
      }
      setFocusId(undefined);
    }
  }, [shouldFocus, hidden, dispatch, setFocusId]);

  if (hidden) {
    return null;
  }

  const layoutComponent = node.def as unknown as LayoutComponent<Type>;
  const RenderComponent = layoutComponent.render;

  const componentProps: PropsFromGenericComponent<Type> = {
    isValid,
    shouldFocus,
    componentValidations,
    node: node as unknown as LayoutNode<Type>,
    overrideItemProps,
    overrideDisplay,
  };

  const showValidationMessages = hasValidationMessages && layoutComponent.renderDefaultValidations();

  if ('renderAsSummary' in node.item && node.item.renderAsSummary) {
    const RenderSummary = 'renderSummary' in node.def ? node.def.renderSummary.bind(node.def) : null;

    if (!RenderSummary) {
      return null;
    }

    return (
      <SummaryComponent
        summaryNode={node as LayoutNode<'Summary'>}
        overrides={{ display: { hideChangeButton: true } }}
      />
    );
  }

  if (layoutComponent.directRender(componentProps) || overrideDisplay?.directRender) {
    return (
      <FormComponentContextProvider value={formComponentContext}>
        <RenderComponent {...componentProps} />
      </FormComponentContextProvider>
    );
  }

  return (
    <FormComponentContextProvider value={formComponentContext}>
      <Grid
        data-componentbaseid={item.baseComponentId || item.id}
        data-componentid={item.id}
        data-componenttype={item.type}
        ref={gridRef}
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
        {shouldComponentRenderLabel(node.item.type) && overrideDisplay?.renderLabel !== false && (
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
          {showValidationMessages && renderValidationMessagesForComponent(filterValidationErrors(), id)}
        </Grid>
      </Grid>
    </FormComponentContextProvider>
  );
}

const gridToClasses = (labelGrid: IGridStyling | undefined, classes: ReturnType<typeof useStyles>) => {
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
