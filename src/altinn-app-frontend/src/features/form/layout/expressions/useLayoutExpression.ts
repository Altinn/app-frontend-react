import { useContext, useMemo } from 'react';

import { useAppSelector } from 'src/common/hooks';
import { FormComponentContext } from 'src/components';
import { NodeNotFoundWithoutContext } from 'src/features/form/layout/expressions/errors';
import {
  evalExprInObj,
  ExprDefaultsForComponent,
  ExprDefaultsForGroup,
} from 'src/features/form/layout/expressions/index';
import { useLayoutsAsNodes } from 'src/utils/layout/useLayoutsAsNodes';
import type { ILayoutComponentOrGroup } from 'src/features/form/layout';
import type { ContextDataSources } from 'src/features/form/layout/expressions/ExpressionContext';
import type { EvalExprInObjArgs } from 'src/features/form/layout/expressions/index';
import type {
  LayoutExpressionDefaultValues,
  ResolvedLayoutExpression,
} from 'src/features/form/layout/expressions/types';

import { buildInstanceContext } from 'altinn-shared/utils/instanceContext';

export interface UseLayoutExpressionOptions<T> {
  /**
   * The component ID for the current component context. Usually optional, as it will be fetched from
   * the FormComponentContext if not given.
   */
  forComponentId?: string;

  /**
   * Default values in case the expression evaluation fails. If this is not given, a failing expression will throw
   * an exception and fail hard. If you provide default values for your expressions, a failing expression will instead
   * print out a pretty error message to the console explaining what went wrong - and continue by using the default
   * value instead.
   */
  defaults?: LayoutExpressionDefaultValues<T>;
}

/**
 * React hook used to resolve layout expressions from a component layout definitions. This
 * should be used inside a form component context.
 *
 * @param input Any input, object, value from the layout definitions, possibly containing layout expressions somewhere.
 *  This hook will look through the input (and recurse through objects), looking for layout expressions and resolve
 *  them to provide you with the base out value for the current component context.
 * @param options Optional options (see their own docs)
 */
export function useLayoutExpression<T>(
  input: T,
  options?: UseLayoutExpressionOptions<T>,
): ResolvedLayoutExpression<T> {
  const component = useContext(FormComponentContext);
  const nodes = useLayoutsAsNodes();
  const formData = useAppSelector((state) => state.formData?.formData);
  const applicationSettings = useAppSelector(
    (state) => state.applicationSettings?.applicationSettings,
  );
  const instance = useAppSelector((state) => state.instanceData?.instance);
  const instanceContext = buildInstanceContext(instance);
  const id = (options && options.forComponentId) || component.id;

  const node = useMemo(() => {
    const foundNode = nodes.findComponentById(id);
    if (foundNode) {
      return foundNode;
    }

    return new NodeNotFoundWithoutContext(id);
  }, [nodes, id]);

  const dataSources = useMemo(
    (): ContextDataSources => ({
      instanceContext,
      applicationSettings,
      formData,
    }),
    [instanceContext, applicationSettings, formData],
  );

  return evalExprInObj({
    ...(options as Pick<UseLayoutExpressionOptions<T>, 'defaults'>),
    input,
    node,
    dataSources,
  } as EvalExprInObjArgs<T>) as ResolvedLayoutExpression<T>;
}

// TODO: Implement a simple test for this
export function useLayoutExpressionForComponent<
  T extends ILayoutComponentOrGroup,
>(
  input: T,
  options?: Omit<UseLayoutExpressionOptions<T>, 'defaults'>,
): ResolvedLayoutExpression<T> {
  return useLayoutExpression(input, {
    ...options,
    defaults: {
      ...ExprDefaultsForComponent,
      ...ExprDefaultsForGroup,
    } as any, // Casting to any to avoid expensive type-checking already done in the source types
  });
}
