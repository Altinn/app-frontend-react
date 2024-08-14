import type { Expression } from 'src/features/expressions/types';

export class ExprRuntimeError extends Error {
  public constructor(
    public expression: Expression,
    public path: string[],
    message: string,
  ) {
    super(message);
  }
}

export class UnknownTargetType extends ExprRuntimeError {
  public constructor(expression: Expression, path: string[], type: string) {
    super(expression, path, `Cannot cast to unknown type '${type}'`);
  }
}

export class UnknownSourceType extends ExprRuntimeError {
  public constructor(expression: Expression, path: string[], type: string, supported: string) {
    super(expression, path, `Received unsupported type '${type}, only ${supported} are supported'`);
  }
}

export class UnexpectedType extends ExprRuntimeError {
  public constructor(expression: Expression, path: string[], expected: string, actual: any) {
    super(expression, path, `Expected ${expected}, got value ${JSON.stringify(actual)}`);
  }
}

export class NodeNotFound extends Error {
  public constructor(nodeId: string | undefined) {
    const id = JSON.stringify(nodeId);
    super(`Unable to evaluate expressions in context of the ${id} component (it could not be found)`);
  }
}

export class NodeNotFoundWithoutContext {
  public constructor(private nodeId: string | undefined) {}

  public getId() {
    return this.nodeId;
  }
}
