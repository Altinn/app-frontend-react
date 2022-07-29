import { layoutExpressionAliases } from 'src/features/form/layout/expressions/functions';
import type {
  ILayoutExpression,
  ILayoutExpressionArg,
  LayoutExpressionFunction,
} from 'src/features/form/layout/expressions/types';

let regex: RegExp;
let funcLookupTable: { [funcName: string]: LayoutExpressionFunction };

function getRegex(): RegExp {
  if (!regex) {
    const argType = /(dataModel|component|applicationSettings|instanceContext)/;
    const argExpr = /(\([^)]+\))/;
    const funcNames = Object.keys(layoutExpressionAliases);
    for (const aliases of Object.values(layoutExpressionAliases)) {
      for (const aliasMap of aliases) {
        for (const alias of Object.values(aliasMap)) {
          funcNames.push(alias.source);
        }
      }
    }
    const func = new RegExp(`(${funcNames.join('|')})`);

    regex = new RegExp(
      [/^/, argType, argExpr, /\s+/, func, /\s+/, argType, argExpr, /$/]
        .map((r) => r.source)
        .join(''),
    );
  }

  return regex;
}

function getFuncLookupTable(): {
  [funcName: string]: LayoutExpressionFunction;
} {
  if (!funcLookupTable) {
    funcLookupTable = {};
    const funcNames = Object.keys(
      layoutExpressionAliases,
    ) as LayoutExpressionFunction[];

    for (const funcName of funcNames) {
      funcLookupTable[funcName] = funcName;
      for (const alias of layoutExpressionAliases[funcName]) {
        for (const key of Object.keys(alias)) {
          funcLookupTable[key] = funcName;
        }
      }
    }
  }

  return funcLookupTable;
}

function trimParens(input: string): string {
  return input.replace(/^\(/, '').replace(/\)$/, '');
}

/**
 * Parses our DSL (domain-specific language) into an ILayoutExpression
 */
export function parseDsl(expression: string, debug = true): ILayoutExpression {
  if (typeof expression !== 'string') {
    return undefined;
  }

  const match = expression.match(getRegex());
  if (match) {
    const lookupTable = getFuncLookupTable();
    const [, argType1, argExpr1, func, argType2, argExpr2] = match;
    return {
      function: lookupTable[func],
      args: [
        { [argType1]: trimParens(argExpr1) } as unknown as ILayoutExpressionArg,
        { [argType2]: trimParens(argExpr2) } as unknown as ILayoutExpressionArg,
      ],
    };
  }

  if (debug) {
    console.error('Failed to parse layout expression DSL:', expression);
  }

  return undefined;
}
