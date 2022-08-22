import { useCallback, useContext, useMemo } from 'react';

import dot from 'dot-object';

import { useAppSelector } from 'src/common/hooks';
import { FormComponentContext } from 'src/components';
import { evalExpr } from 'src/features/form/layout/expressions/index';
import { asLayoutExpression } from 'src/features/form/layout/expressions/validation';
import { useLayoutsAsNodes } from 'src/utils/layout/useLayoutsAsNodes';
import type { ContextDataSources } from 'src/features/form/layout/expressions/ExpressionContext';
import type { EvalExprOptions } from 'src/features/form/layout/expressions/index';
import type {
  ILayoutExpression,
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
  defaults?: LayoutExpressionDefaultValues<T, 1>; // <-- Recursion depth limited by the second generic param
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

  const node = useMemo(() => nodes.findComponentById(id) || id, [nodes, id]);
  const dataSources = useMemo(
    (): ContextDataSources => ({
      instanceContext,
      applicationSettings,
      formData,
    }),
    [instanceContext, applicationSettings, formData],
  );

  const doEvalExpression = useCallback(
    (
      expression: ILayoutExpression,
      path: string[],
    ): Parameters<typeof evalExpr> => {
      const pathString = path.join('.');
      const exprOptions: EvalExprOptions = {
        errorIntroText: `Evaluated expression for '${pathString}' in component '${id}'`,
      };
      if (options && options.defaults) {
        const defaultValue = dot.pick(pathString, options.defaults);
        if (typeof defaultValue !== 'undefined') {
          exprOptions.defaultValue = defaultValue;
        }
      }

      return evalExpr(expression, node, dataSources, exprOptions);
    },
    [options, id, node, dataSources],
  );

  return useMemo(() => {
    if (!input) {
      return input;
    }

    /**
     * Recurse through an input, finds layout expressions and evaluates them
     */
    const recurse = (obj: any, path: string[]) => {
      if (typeof obj !== 'object') {
        return obj;
      }
      if (Array.isArray(obj)) {
        const newPath = [...path];
        const lastLeg = newPath.pop() || '';
        return obj.map((item, idx) =>
          recurse(item, [...newPath, `${lastLeg}[${idx}]`]),
        );
      }

      const expression = asLayoutExpression(obj);
      if (expression) {
        return doEvalExpression(expression, path);
      }

      const out = {};
      for (const key of Object.keys(obj)) {
        out[key] = recurse(obj[key], [...path, key]);
      }

      return out;
    };

    return recurse(input, []);
  }, [input, doEvalExpression]) as ResolvedLayoutExpression<T>;
}
