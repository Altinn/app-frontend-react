import { layoutExpressionAliases } from 'src/features/form/layout/expressions/functions';
import type {
  ILayoutExpression,
  ILayoutExpressionArg,
  LayoutExpressionFunction,
} from 'src/features/form/layout/expressions/types';

interface RegexObj {
  func: RegExp;
  argExpr: RegExp;
  argConst: {
    boolean: RegExp;
    number: RegExp;
  };
}

let regexes: RegexObj;
let funcLookupTable: { [funcName: string]: LayoutExpressionFunction };

function getRegexes(): RegexObj {
  if (!regexes) {
    const funcNames = Object.keys(layoutExpressionAliases);
    for (const aliases of Object.values(layoutExpressionAliases)) {
      for (const aliasMap of aliases) {
        for (const alias of Object.values(aliasMap)) {
          funcNames.push(alias.source);
        }
      }
    }
    const func = new RegExp(`\\s+(${funcNames.join('|')})\\s+`);

    regexes = {
      func,
      argExpr:
        /^(dataModel|component|applicationSettings|instanceContext)(\([^)]+\))$/,
      argConst: {
        boolean: /^(true|false)$/,
        number: /^(\d+)$/,
      },
    };
  }

  return regexes;
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

function parseArg(arg: string, regexes: RegexObj): ILayoutExpressionArg {
  if (arg.match(regexes.argConst.boolean)) {
    return arg === 'true';
  }
  if (arg.match(regexes.argConst.number)) {
    return parseInt(arg, 10);
  }
  const exprMatch = arg.match(regexes.argExpr);
  if (exprMatch) {
    const [, argType, argExpr] = exprMatch;
    return {
      [argType]: trimParens(argExpr),
    } as unknown as ILayoutExpressionArg;
  }

  // Assumed to be string constant
  return arg;
}

/**
 * Parses our DSL (domain-specific language) into an ILayoutExpression
 */
export function parseDsl(expression: string, debug = true): ILayoutExpression {
  if (typeof expression !== 'string') {
    return undefined;
  }

  const regexes = getRegexes();
  const split = expression.split(regexes.func);
  if (split && split.filter((i) => i.trim()).length === 3) {
    const [arg1, func, arg2] = split;
    const lookupTable = getFuncLookupTable();
    return {
      function: lookupTable[func],
      args: [parseArg(arg1, regexes), parseArg(arg2, regexes)],
    };
  }

  if (debug) {
    console.error('Failed to parse layout expression DSL:', expression);
  }

  return undefined;
}
