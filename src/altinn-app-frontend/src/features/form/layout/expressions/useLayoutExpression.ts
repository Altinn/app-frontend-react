import { useContext, useMemo } from 'react';

import { useAppSelector } from 'src/common/hooks';
import { FormComponentContext } from 'src/components';
import { evalExpr } from 'src/features/form/layout/expressions/index';
import { asLayoutExpression } from 'src/features/form/layout/expressions/validation';
import { useLayoutsAsNodes } from 'src/utils/layout/useLayoutsAsNodes';
import type { ContextDataSources } from 'src/features/form/layout/expressions/ExpressionContext';
import type { ILayoutExpression } from 'src/features/form/layout/expressions/types';

import { buildInstanceContext } from 'altinn-shared/utils/instanceContext';

type ResolveDistributive<T> = T extends any
  ? T extends ILayoutExpression
    ? never
    : T extends object
    ? ResolvedLayoutExpression<T>
    : T
  : never;

/**
 * This magic type removes all layout expressions from the input type
 * @see https://stackoverflow.com/a/54487392
 */
export type ResolvedLayoutExpression<T> = Exclude<
  { [P in keyof T]: ResolveDistributive<T[P]> },
  ILayoutExpression
>;

/**
 * React hook used to resolve layout expressions from a component layout definitions. This
 * should be used inside a form component context.
 *
 * @param input Any input, object, value from the layout definitions, possibly containing layout expressions somewhere.
 *  This hook will look through the input (and recurse through objects), looking for layout expressions and resolve
 *  them to provide you with the base out value for the current component context.
 * @param componentId The component ID for the current component context. Usually optional, as it will be fetched from
 *  the FormComponentContext if not given.
 */
export function useLayoutExpression<T>(
  input: T,
  componentId?: string,
): ResolvedLayoutExpression<T> {
  const component = useContext(FormComponentContext);
  const nodes = useLayoutsAsNodes();
  const formData = useAppSelector((state) => state.formData?.formData);
  const applicationSettings = useAppSelector(
    (state) => state.applicationSettings?.applicationSettings,
  );
  const instance = useAppSelector((state) => state.instanceData?.instance);
  const instanceContext = buildInstanceContext(instance);
  const id = componentId || component.id;

  return useMemo(() => {
    if (!input) {
      return input;
    }

    const node = nodes.findComponentById(id);
    if (!node) {
      console.error(
        'Unable to resolve layout expressions in context of the',
        id,
        'component (it could not be found)',
      );
      return input;
    }

    const dataSources: ContextDataSources = {
      instanceContext,
      applicationSettings,
      formData,
    };

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
        // TODO: Get a possible default value based on the current path
        return evalExpr(expression, node, dataSources);
      }

      const out = {};
      for (const key of Object.keys(obj)) {
        out[key] = recurse(obj[key], [...path, key]);
      }

      return out;
    };

    return recurse(input, []);
  }, [
    input,
    nodes,
    id,
    instanceContext,
    applicationSettings,
    formData,
  ]) as ResolvedLayoutExpression<T>;
}
