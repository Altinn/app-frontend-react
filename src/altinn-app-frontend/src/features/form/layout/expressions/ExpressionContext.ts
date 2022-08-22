import dot from 'dot-object';

import {
  ExpressionRuntimeError,
  LookupNotFound,
  NodeNotFound,
} from 'src/features/form/layout/expressions/index';
import {
  prettyErrors,
  prettyErrorsToConsole,
} from 'src/features/form/layout/expressions/prettyErrors';
import type { IFormData } from 'src/features/form/data';
import type {
  ILayoutExpression,
  ILayoutExpressionLookupFunctions,
} from 'src/features/form/layout/expressions/types';
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

const lookups: ILayoutExpressionLookupFunctions = {
  instanceContext: function (key) {
    return this.dataSources.instanceContext[key];
  },
  applicationSettings: function (key) {
    return this.dataSources.applicationSettings[key];
  },
  component: function (id) {
    const component = this.failWithoutNode().closest(
      (c) => c.id === id || c.baseComponentId === id,
    );
    if (
      component &&
      component.item.dataModelBindings &&
      component.item.dataModelBindings.simpleBinding
    ) {
      return this.dataSources.formData[
        component.item.dataModelBindings.simpleBinding
      ];
    }

    throw new LookupNotFound(
      this,
      'component',
      id,
      'or it does not have a simpleBinding',
    );
  },
  dataModel: function (path) {
    const newPath = this.failWithoutNode().transposeDataModel(path);
    return this.dataSources.formData[newPath] || null;
  },
};

export class ExpressionContext {
  public lookup = lookups;
  public path: string[] = [];

  private constructor(
    public expr: ILayoutExpression,
    public node: LayoutNode | string,
    public dataSources: ContextDataSources,
  ) {}

  /**
   * Start a new context with a blank path (i.e. with a pointer at the top-level of an expression)
   */
  public static withBlankPath(
    expr: ILayoutExpression,
    node: LayoutNode | string,
    dataSources: ContextDataSources,
  ): ExpressionContext {
    return new ExpressionContext(expr, node, dataSources);
  }

  /**
   * Reference a previous instance, but move our path pointer to a new path (meaning the context is working on an
   * inner part of the expression)
   */
  public static withPath(prevInstance: ExpressionContext, newPath: string[]) {
    const newInstance = new ExpressionContext(
      prevInstance.expr,
      prevInstance.node,
      prevInstance.dataSources,
    );
    newInstance.lookup = prevInstance.lookup;
    newInstance.path = newPath;

    return newInstance;
  }

  /**
   * Utility function used to get the LayoutNode for this context, or fail if the node was not found
   */
  public failWithoutNode(): LayoutNode {
    if (typeof this.node === 'string') {
      throw new NodeNotFound(this, this.node);
    }
    return this.node;
  }

  /**
   * Get the expression for the current path
   */
  public getExpr(): ILayoutExpression {
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
    if (!(err instanceof ExpressionRuntimeError)) {
      console.error(err);
      return;
    }

    // eslint-disable-next-line no-console
    console.log(...this.prettyErrorConsole(err, options));
  }

  public prettyError(err: Error, options?: PrettyErrorsOptions): string {
    if (err instanceof ExpressionRuntimeError) {
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
    if (err instanceof ExpressionRuntimeError) {
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
