import { evalExpr } from 'src/features/expressions';
import { ExprVal, refAsSuffix } from 'src/features/expressions/types';
import type { ExprResolved, LayoutReference } from 'src/features/expressions/types';
import type { IQueryParameters } from 'src/layout/common.generated';
import type { ExprResolver } from 'src/layout/LayoutComponent';
import type { ExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';

export function evalQueryParameters(props: ExprResolver<'List'>) {
  if (!props.item.queryParameters) {
    return undefined;
  }

  const { evalStr } = props;
  const out = { ...props.item.queryParameters } as ExprResolved<IQueryParameters>;
  for (const [key, value] of Object.entries(out)) {
    out[key] = evalStr(value, '');
  }
  return out;
}

export function resolveQueryParameters(
  queryParameters: IQueryParameters | undefined,
  reference: LayoutReference,
  dataSources: ExpressionDataSources,
): Record<string, string> | undefined {
  return queryParameters
    ? Object.entries(queryParameters).reduce((obj, [key, expr]) => {
        obj[key] = evalExpr(expr, reference, dataSources, {
          config: {
            returnType: ExprVal.String,
            defaultValue: '',
          },
          errorIntroText: `Invalid expression${refAsSuffix(reference)}`,
        });
        return obj;
      }, {})
    : undefined;
}
