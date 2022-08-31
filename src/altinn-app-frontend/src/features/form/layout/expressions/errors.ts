import type { ExpressionContext } from 'src/features/form/layout/expressions/ExpressionContext';
import type { ILayoutExpressionLookupFunctions } from 'src/features/form/layout/expressions/types';

export class ExpressionRuntimeError extends Error {
  public constructor(public context: ExpressionContext, message: string) {
    super(message);
  }
}

export class LookupNotFound extends ExpressionRuntimeError {
  public constructor(
    context: ExpressionContext,
    lookup: keyof ILayoutExpressionLookupFunctions,
    key: string,
    extra?: string,
  ) {
    super(
      context,
      `Unable to find ${lookup} with identifier ${key}${
        extra ? ` ${extra}` : ''
      }`,
    );
  }
}

export class UnknownTargetType extends ExpressionRuntimeError {
  public constructor(context: ExpressionContext, type: string) {
    super(context, `Cannot cast to unknown type '${type}'`);
  }
}

export class UnknownSourceType extends ExpressionRuntimeError {
  public constructor(
    context: ExpressionContext,
    type: string,
    supported: string,
  ) {
    super(
      context,
      `Received unsupported type '${type}, only ${supported} are supported'`,
    );
  }
}

export class UnexpectedType extends ExpressionRuntimeError {
  public constructor(
    context: ExpressionContext,
    expected: string,
    actual: any,
  ) {
    super(context, `Expected ${expected}, got value ${JSON.stringify(actual)}`);
  }
}

export class NodeNotFound extends ExpressionRuntimeError {
  public constructor(
    context: ExpressionContext,
    original: NodeNotFoundWithoutContext,
  ) {
    super(
      context,
      `Unable to evaluate layout expressions in context of the ${JSON.stringify(
        original.nodeId,
      )} component (it could not be found)`,
    );
  }
}

export class NodeNotFoundWithoutContext {
  public constructor(public nodeId: string) {}
}
