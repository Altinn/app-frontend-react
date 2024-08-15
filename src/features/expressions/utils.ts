import dot from 'dot-object';

import { ExprRuntimeError, NodeNotFound, NodeNotFoundWithoutContext } from 'src/features/expressions/errors';
import { prettyErrors } from 'src/features/expressions/prettyErrors';
import type { ExprConfig, Expression } from 'src/features/expressions/types';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';
import type { LayoutPage } from 'src/utils/layout/LayoutPage';

export interface PrettyErrorsOptions {
  config?: ExprConfig;
  introText?: string;
}

export function getExpressionValue(expression: Expression, path: string[]): Expression {
  if (path.length === 0) {
    return expression;
  }

  // For some reason dot.pick wants to use the format '0[1][2]' for arrays instead of '[0][1][2]', so we'll rewrite
  const [firstKey, ...restKeys] = path;
  const stringPath = firstKey.replace('[', '').replace(']', '') + restKeys.join('');

  return dot.pick(stringPath, expression, false);
}

export function ensureNode(
  node: LayoutNode | LayoutPage | BaseLayoutNode | NodeNotFoundWithoutContext,
): LayoutNode | BaseLayoutNode | LayoutPage {
  if (node instanceof NodeNotFoundWithoutContext) {
    throw new NodeNotFound(node.getId());
  }
  return node;
}

/**
 * Create a string representation of the full expression, using the path pointer to point out where the expression
 * failed (with a message).
 */
export function traceExpressionError(err: Error, expr: Expression, path: string[], options?: PrettyErrorsOptions) {
  if (!(err instanceof ExprRuntimeError)) {
    window.logError(err);
    return;
  }

  window.logError(prettyError(err, expr, path, options));
}

export function prettyError(err: Error, expr: Expression, path: string[], options?: PrettyErrorsOptions): string {
  if (err instanceof ExprRuntimeError) {
    const prettyPrinted = prettyErrors({
      input: expr,
      errors: { [path.join('')]: [err.message] },
      indentation: 1,
    });

    const introText = options && 'introText' in options ? options.introText : 'Evaluated expression';

    const extra = options && options.config ? ['Using default value instead:', `  ${options.config.defaultValue}`] : [];

    return [`${introText}:`, prettyPrinted, ...extra].join('\n');
  }

  return err.message;
}
