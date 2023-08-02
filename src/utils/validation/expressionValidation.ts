import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { buildValidationObject } from 'src/utils/validation/validationHelpers';
import type { ExprConfig, Expression } from 'src/features/expressions/types';
import type { IFormData } from 'src/features/formData';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type {
  IExpressionValidationConfig,
  IExpressionValidationDefinition,
  IExpressionValidationObject,
  IExpressionValidationResolved,
  IExpressionValidationUnresolved,
  IValidationObject,
} from 'src/utils/validation/types';

/**
 * Resolves a reusable expression validation definition.
 */
function resolveExpressionValidationDefinition(
  name: string,
  definition: IExpressionValidationUnresolved,
  config: { [name: string]: IExpressionValidationResolved },
): IExpressionValidationResolved | null {
  let resolvedDefinition = definition;

  if ('ref' in definition) {
    const reference = config[definition.ref];
    if (!reference) {
      window.logWarn(
        `Custom validation:\nTried to reference ${definition.ref} in ${name} but it does not exist. Make sure it is defined before it is referenced.`,
      );
      return null;
    }

    const { ref: _, ...definitionWithoutRef } = definition;
    resolvedDefinition = { ...reference, ...definitionWithoutRef };
  }

  if (!('message' in resolvedDefinition)) {
    window.logWarn(`Custom validation:\nDefinition for ${name} is missing a message.`);
    return null;
  }

  if (!('condition' in resolvedDefinition)) {
    window.logWarn(`Custom validation:\nDefinition for ${name} is missing a condition.`);
    return null;
  }

  return resolvedDefinition as IExpressionValidationResolved;
}

function resolveValidationCondition(condition: Expression, field: string): Expression {
  const FIELD_REGEX = /\$\{field\}/;

  function recurse(expression: Expression): void {
    for (let i = 0; i < expression.length; i++) {
      const value = expression[i];
      if (typeof value === 'string') {
        expression[i] = value.replace(FIELD_REGEX, field);
      } else if (Array.isArray(value)) {
        recurse(value as Expression);
      }
    }
  }

  const conditionCopy = structuredClone(condition);
  recurse(conditionCopy);
  return conditionCopy;
}

/**
 * Resolves a single expression validation definition.
 */
function resolveExpressionValidation(
  definition: IExpressionValidationUnresolved | string,
  field: string,
  resolvedDefinitions: { [name: string]: IExpressionValidationResolved },
): IExpressionValidationObject | null {
  let expressionValidation: IExpressionValidationObject | null = null;
  if (typeof definition === 'string') {
    const reference = resolvedDefinitions[definition];
    if (!reference) {
      window.logWarn(
        `Custom validation:\nTried to reference ${definition} in validations.${field} but it does not exist.`,
      );
      return null;
    }

    expressionValidation = {
      severity: 'errors',
      ...reference,
    };
  } else {
    let reference: IExpressionValidationResolved | undefined = undefined;
    let resolvedDefinition = definition;

    if ('ref' in definition) {
      reference = resolvedDefinitions[definition.ref];
      if (!reference) {
        window.logWarn(
          `Custom validation:\nTried to reference ${definition.ref} in validations.${field} but it does not exist.`,
        );
      }
      const { ref: _, ...definitionWithoutRef } = definition;
      resolvedDefinition = { ...reference, ...definitionWithoutRef };
    }

    expressionValidation = {
      severity: 'errors',
      ...resolvedDefinition,
    } as IExpressionValidationObject;
  }

  if (!('message' in expressionValidation)) {
    window.logWarn(`Custom validation:\nValidation for ${field} is missing a message.`);
    return null;
  }

  if (!('condition' in expressionValidation)) {
    window.logWarn(`Custom validation:\nValidation for ${field} is missing a condition.`);
    return null;
  }

  return expressionValidation;
}

/**
 * Takes an expression validation config and returnes an object with the field validation definitions resolved.
 */
export function resolveExpressionValidationConfig(
  config: IExpressionValidationConfig,
): IExpressionValidationDefinition {
  const resolvedDefinitions: { [name: string]: IExpressionValidationResolved } = {};
  for (const [name, definition] of Object.entries(config.definitions)) {
    const resolvedDefinition = resolveExpressionValidationDefinition(name, definition, resolvedDefinitions);
    if (!resolvedDefinition) {
      continue;
    }
    resolvedDefinitions[name] = resolvedDefinition;
  }
  const resolvedExpressionValidationDefinitions: IExpressionValidationDefinition = {};
  for (const [field, definitions] of Object.entries(config.validations)) {
    for (const definition of definitions) {
      if (!resolvedExpressionValidationDefinitions[field]?.length) {
        resolvedExpressionValidationDefinitions[field] = [];
      }
      const resolvedDefinition = resolveExpressionValidation(definition, field, resolvedDefinitions);
      if (!resolvedDefinition) {
        continue;
      }
      resolvedExpressionValidationDefinitions[field].push(resolvedDefinition);
    }
  }
  return resolvedExpressionValidationDefinitions;
}

export function runExpressionValidationsOnNode(
  node: LayoutNode,
  expressionValidations: IExpressionValidationDefinition,
  overrideFormData?: IFormData,
): IValidationObject[] {
  if (!node.item.dataModelBindings || !node.item.baseDataModelBindings) {
    return [];
  }

  const dataSources = node.getDataSources();
  const newDataSources = {
    ...dataSources,
    formData: {
      ...dataSources.formData,
      ...overrideFormData,
    },
  };
  const config: ExprConfig<ExprVal.Any> = {
    returnType: ExprVal.Any,
    defaultValue: null,
    resolvePerRow: false,
    errorAsException: true,
  };

  const validationObjects: IValidationObject[] = [];

  for (const [bindingKey, field] of Object.entries(node.item.baseDataModelBindings)) {
    const validationDefs = expressionValidations[field];
    if (!validationDefs) {
      continue;
    }
    for (const validationDef of validationDefs) {
      try {
        const resolvedField = node.item.dataModelBindings[bindingKey];
        const resolvedCondition = resolveValidationCondition(validationDef.condition, resolvedField);
        const isInvalid = evalExpr(resolvedCondition, node, newDataSources, { config });
        if (isInvalid) {
          validationObjects.push(
            buildValidationObject(node, validationDef.severity, validationDef.message, bindingKey),
          );
        }
      } catch (e) {
        window.logError(`Custom validation:\nValidation for ${field} failed to evaluate:\n`, e);
      }
    }
  }
  return validationObjects;
}
