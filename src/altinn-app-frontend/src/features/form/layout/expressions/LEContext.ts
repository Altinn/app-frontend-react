import dot from 'dot-object';

import {
  LERuntimeError,
  NodeNotFound,
  NodeNotFoundWithoutContext,
} from 'src/features/form/layout/expressions/errors';
import {
  prettyErrors,
  prettyErrorsToConsole,
} from 'src/features/form/layout/expressions/prettyErrors';
import type { IFormData } from 'src/features/form/data';
import type { LayoutExpression } from 'src/features/form/layout/expressions/types';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

import type {
  IApplicationSettings,
  IInstanceContext,
} from 'altinn-shared/types';

export interface ContextDataSources {
  instanceContext: IInstanceContext;
  applicationSettings: IApplicationSettings;
  formData: IFormData;
}

export interface PrettyErrorsOptions {
  defaultValue?: any;
  introText?: string;
}

/**
 * The layout expression context object is passed around when executing/evaluating a layout expression, and is
 * a toolbox for layout expressions to resolve lookups in data sources, getting the current node, etc.
 */
export class LEContext {
  public path: string[] = [];

  private constructor(
    public expr: LayoutExpression,
    public node: LayoutNode<any> | NodeNotFoundWithoutContext,
    public dataSources: ContextDataSources,
  ) {}

  /**
   * Start a new context with a blank path (i.e. with a pointer at the top-level of an expression)
   */
  public static withBlankPath(
    expr: LayoutExpression,
    node: LayoutNode<any> | NodeNotFoundWithoutContext,
    dataSources: ContextDataSources,
  ): LEContext {
    return new LEContext(expr, node, dataSources);
  }

  /**
   * Reference a previous instance, but move our path pointer to a new path (meaning the context is working on an
   * inner part of the expression)
   */
  public static withPath(prevInstance: LEContext, newPath: string[]) {
    const newInstance = new LEContext(
      prevInstance.expr,
      prevInstance.node,
      prevInstance.dataSources,
    );
    newInstance.path = newPath;

    return newInstance;
  }

  /**
   * Utility function used to get the LayoutNode for this context, or fail if the node was not found
   */
  public failWithoutNode(): LayoutNode<any> {
    if (this.node instanceof NodeNotFoundWithoutContext) {
      throw new NodeNotFound(this, this.node);
    }
    return this.node;
  }

  /**
   * Get the expression for the current path
   */
  public getExpr(): LayoutExpression {
    if (this.path.length === 0) {
      return this.expr;
    }

    const stringPath = this.path.join('.');
    return dot.pick(stringPath, this.expr, false);
  }

  /**
   * Create a string representation of the full expression, using the path pointer to point out where the expression
   * failed (with a message).
   */
  public trace(err: Error, options?: PrettyErrorsOptions) {
    if (!(err instanceof LERuntimeError)) {
      console.error(err);
      return;
    }

    // eslint-disable-next-line no-console
    console.log(...this.prettyErrorConsole(err, options));
  }

  public prettyError(err: Error, options?: PrettyErrorsOptions): string {
    if (err instanceof LERuntimeError) {
      const prettyPrinted = prettyErrors({
        input: this.expr,
        errors: { [this.path.join('.')]: [err.message] },
        indentation: 1,
      });

      const introText =
        options && 'introText' in options
          ? options.introText
          : 'Evaluated expression';

      const extra =
        options && 'defaultValue' in options
          ? ['Using default value instead:', `  ${options.defaultValue}`]
          : [];

      return [`${introText}:`, prettyPrinted, ...extra].join('\n');
    }

    return err.message;
  }

  public prettyErrorConsole(
    err: Error,
    options?: PrettyErrorsOptions,
  ): string[] {
    if (err instanceof LERuntimeError) {
      const prettyPrinted = prettyErrorsToConsole({
        input: this.expr,
        errors: { [this.path.join('.')]: [err.message] },
        indentation: 1,
        defaultStyle: '',
      });

      const introText =
        options && 'introText' in options
          ? options.introText
          : 'Evaluated expression:';

      const extra =
        options && 'defaultValue' in options
          ? `\n%cUsing default value instead:\n  %c${options.defaultValue}%c`
          : '';
      const extraCss =
        options && 'defaultValue' in options ? ['', 'color: red;', ''] : [];

      return [
        `${introText}:\n${prettyPrinted.lines}${extra}`,
        ...prettyPrinted.css,
        ...extraCss,
      ];
    }

    return [err.message];
  }
}
