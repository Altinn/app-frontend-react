import type { LEContext } from 'src/features/form/layout/expressions/LEContext';
import type { LEFunction } from 'src/features/form/layout/expressions/types';

export class LERuntimeError extends Error {
  public constructor(public context: LEContext, message: string) {
    super(message);
  }
}

export class LookupNotFound extends LERuntimeError {
  public constructor(
    context: LEContext,
    func: LEFunction,
    key: string,
    extra?: string,
  ) {
    super(
      context,
      `Unable to find ${func} with identifier ${key}${
        extra ? ` ${extra}` : ''
      }`,
    );
  }
}

export class UnknownTargetType extends LERuntimeError {
  public constructor(context: LEContext, type: string) {
    super(context, `Cannot cast to unknown type '${type}'`);
  }
}

export class UnknownSourceType extends LERuntimeError {
  public constructor(context: LEContext, type: string, supported: string) {
    super(
      context,
      `Received unsupported type '${type}, only ${supported} are supported'`,
    );
  }
}

export class UnexpectedType extends LERuntimeError {
  public constructor(context: LEContext, expected: string, actual: any) {
    super(context, `Expected ${expected}, got value ${JSON.stringify(actual)}`);
  }
}

export class NodeNotFound extends LERuntimeError {
  public constructor(context: LEContext, original: NodeNotFoundWithoutContext) {
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
