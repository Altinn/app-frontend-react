import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import addAdditionalFormats from 'ajv-formats-draft2019';
import JsonPointer from 'jsonpointer';
import type { Options } from 'ajv';
import type * as AjvCore from 'ajv/dist/core';

import type { IAttachment } from 'src/features/attachments';
import type { ExprUnresolved } from 'src/features/expressions/types';
import type { IUseLanguage } from 'src/hooks/useLanguage';
import type { ILayoutGroup } from 'src/layout/Group/types';
import type { ILayout, ILayoutComponent, ILayouts } from 'src/layout/layout';
import type {
  IComponentValidations,
  ILayoutValidations,
  IRepeatingGroups,
  ISchemaValidator,
  IValidationResult,
  IValidations,
} from 'src/types';

export interface ISchemaValidators {
  [id: string]: ISchemaValidator;
}

const validators: ISchemaValidators = {};

export function getValidator(currentDataTaskTypeId, schemas) {
  if (!validators[currentDataTaskTypeId]) {
    validators[currentDataTaskTypeId] = createValidator(schemas[currentDataTaskTypeId]);
  }
  return validators[currentDataTaskTypeId];
}

export function createValidator(schema: any): ISchemaValidator {
  const ajvOptions: Options = {
    allErrors: true,
    coerceTypes: true,

    /**
     * This option is deprecated in AJV, but continues to work for now. We have unit tests that will fail if the
     * functionality is removed from AJV. The jsPropertySyntax (ex. 'Path.To.Array[0].Item') was replaced with JSON
     * pointers in v7 (ex. '/Path/To/Array/0/Item'). If the option to keep the old syntax is removed at some point,
     * we'll have to implement a translator ourselves, as we'll need this format to equal our data model bindings.
     *
     * @see https://github.com/ajv-validator/ajv/issues/1577#issuecomment-832216719
     */
    jsPropertySyntax: true,

    strict: false,
    strictTypes: false,
    strictTuples: false,
    unicodeRegExp: false,
    code: { es5: true },
  };
  let ajv: AjvCore.default;
  const rootElementPath = getRootElementPath(schema);
  if (schema.$schema?.includes('2020-12')) {
    // we have to use a different ajv-instance for 2020-12 draft
    // here we actually validate against the root json-schema object
    ajv = new Ajv2020(ajvOptions);
  } else {
    // leave existing schemas untouched. Here we actually validate against a sub schema with the name of the model
    // for instance "skjema"
    ajv = new Ajv(ajvOptions);
  }
  addFormats(ajv);
  addAdditionalFormats(ajv);
  ajv.addFormat('year', /^\d{4}$/);
  ajv.addFormat('year-month', /^\d{4}-(0[1-9]|1[0-2])$/);
  ajv.addSchema(schema, 'schema');
  return {
    validator: ajv,
    schema,
    rootElementPath,
  };
}

export const getRootElementPath = (schema: any) => {
  if (![null, undefined].includes(schema.info?.rootNode)) {
    // If rootNode is defined in the schema
    return schema.info.rootNode;
  } else if (schema.info?.meldingsnavn && schema.properties) {
    // SERES workaround
    return schema.properties[schema.info.meldingsnavn]?.$ref || '';
  } else if (schema.properties) {
    // Expect first property to contain $ref to schema
    const rootKey: string = Object.keys(schema.properties)[0];
    return schema.properties[rootKey].$ref;
  }
  return '';
};

export const errorMessageKeys = {
  minimum: {
    textKey: 'min',
    paramKey: 'limit',
  },
  exclusiveMinimum: {
    textKey: 'min',
    paramKey: 'limit',
  },
  maximum: {
    textKey: 'max',
    paramKey: 'limit',
  },
  exclusiveMaximum: {
    textKey: 'max',
    paramKey: 'limit',
  },
  minLength: {
    textKey: 'minLength',
    paramKey: 'limit',
  },
  maxLength: {
    textKey: 'maxLength',
    paramKey: 'limit',
  },
  pattern: {
    textKey: 'pattern',
    paramKey: 'pattern',
  },
  format: {
    textKey: 'pattern',
    paramKey: 'format',
  },
  type: {
    textKey: 'pattern',
    paramKey: 'type',
  },
  required: {
    textKey: 'required',
    paramKey: 'limit',
  },
  enum: {
    textKey: 'enum',
    paramKey: 'allowedValues',
  },
  const: {
    textKey: 'enum',
    paramKey: 'allowedValues',
  },
  multipleOf: {
    textKey: 'multipleOf',
    paramKey: 'multipleOf',
  },
  oneOf: {
    textKey: 'oneOf',
    paramKey: 'passingSchemas',
  },
  anyOf: {
    textKey: 'anyOf',
    paramKey: 'passingSchemas',
  },
  allOf: {
    textKey: 'allOf',
    paramKey: 'passingSchemas',
  },
  not: {
    textKey: 'not',
    paramKey: 'passingSchemas',
  },
  formatMaximum: {
    textKey: 'formatMaximum',
    paramKey: 'limit',
  },
  formatMinimum: {
    textKey: 'formatMinimum',
    paramKey: 'limit',
  },
  formatExclusiveMaximum: {
    textKey: 'formatMaximum',
    paramKey: 'limit',
  },
  formatExclusiveMinimum: {
    textKey: 'formatMinimum',
    paramKey: 'limit',
  },
  minItems: {
    textKey: 'minItems',
    paramKey: 'limit',
  },
  maxItems: {
    textKey: 'maxItems',
    paramKey: 'limit',
  },
};

/**
 * @deprecated
 * @see useExprContext
 * @see useResolvedNode
 * @see ResolvedNodesSelector
 */
export function getParentGroup(groupId: string, layout: ILayout): ILayoutGroup | null {
  if (!groupId || !layout) {
    return null;
  }
  return layout.find((element) => {
    if (element.id !== groupId && element.type === 'Group') {
      const childrenWithoutMultiPage = element.children?.map((childId) =>
        element.edit?.multiPage ? childId.split(':')[1] : childId,
      );
      if (childrenWithoutMultiPage?.indexOf(groupId) > -1) {
        return true;
      }
    }
    return false;
  }) as ILayoutGroup;
}

/**
 * @deprecated
 * @see useExprContext
 * @see useResolvedNode
 * @see ResolvedNodesSelector
 */
export function getGroupChildren(groupId: string, layout: ILayout): ExprUnresolved<ILayoutGroup | ILayoutComponent>[] {
  const layoutGroup = layout.find((element) => element.id === groupId) as ILayoutGroup;
  return layout.filter((element) =>
    layoutGroup?.children?.map((id) => (layoutGroup.edit?.multiPage ? id.split(':')[1] : id)).includes(element.id),
  );
}

export function attachmentsValid(attachments: any, component: any): boolean {
  return (
    component.minNumberOfAttachments === 0 ||
    (attachments && attachments[component.id] && attachments[component.id].length >= component.minNumberOfAttachments)
  );
}

export function attachmentIsMissingTag(attachment: IAttachment): boolean {
  return attachment.tags === undefined || attachment.tags.length === 0;
}

/**
 * Check if AVJ validation error is a oneOf error ("must match exactly one schema in oneOf").
 * We don't currently support oneOf validation.
 * These can be ignored, as there will be other, specific validation errors that actually
 * from the specified sub-schemas that will trigger validation errors where relevant.
 * @param error the AJV validation error object
 * @returns a value indicating if the provided error is a "oneOf" error.
 */
export const isOneOfError = (error: AjvCore.ErrorObject): boolean =>
  error.keyword === 'oneOf' || error.params?.type === 'null';

/**
 * Wrapper method around getSchemaPart for schemas made with our old generator tool
 * @param schemaPath the path, format #/properties/model/properties/person/properties/name/maxLength
 * @param mainSchema the main schema to get part from
 * @param rootElementPath the subschema to get part from
 * @returns the part, or null if not found
 */
export function getSchemaPartOldGenerator(schemaPath: string, mainSchema: object, rootElementPath: string): any {
  // for old generators we can have a ref to a definition that is placed outside of the subSchema we validate against.
  // if we are looking for #/definitons/x we search in main schema

  if (/^#\/(definitions|\$defs)\//.test(schemaPath)) {
    return getSchemaPart(schemaPath, mainSchema);
  }
  // all other in sub schema
  return getSchemaPart(schemaPath, getSchemaPart(`${rootElementPath}/#`, mainSchema));
}

/**
 * Gets a json schema part by a schema patch
 * @param schemaPath the path, format #/properties/model/properties/person/properties/name/maxLength
 * @param jsonSchema the json schema to get part from
 * @returns the part, or null if not found
 */
export function getSchemaPart(schemaPath: string, jsonSchema: object): any {
  try {
    // want to transform path example format to to /properties/model/properties/person/properties/name
    const pointer = schemaPath.substr(1).split('/').slice(0, -1).join('/');
    return JsonPointer.compile(pointer).get(jsonSchema);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function processInstancePath(path: string): string {
  let result = path.startsWith('.') ? path.slice(1) : path;
  result = result
    .replace(/"]\["|']\['/g, '.')
    .replace(/\["|\['/g, '')
    .replace(/"]|']/g, '');
  return result;
}

/**
 * Checks if form can be saved. If it contains anything other than valid error messages it returns false
 */
export function canFormBeSaved(validationResult: IValidationResult | null): boolean {
  if (validationResult && validationResult.invalidDataTypes) {
    return false;
  }

  const validations = validationResult?.validations;
  if (!validations) {
    return true;
  }
  return Object.keys(validations).every((layoutId: string) =>
    Object.keys(validations[layoutId])?.every((componentId: string) => {
      const componentValidations: IComponentValidations = validations[layoutId][componentId];
      if (componentValidations === null) {
        return true;
      }
      return Object.keys(componentValidations).every((bindingKey: string) => {
        const componentErrors = componentValidations[bindingKey]?.errors;
        return !componentErrors || componentErrors.length === 0;
      });
    }),
  );
}

/**
 * gets unmapped errors from validations as string array
 * @param validations the validations
 */
export function getUnmappedErrors(validations: IValidations): string[] {
  const messages: string[] = [];
  if (!validations) {
    return messages;
  }
  Object.keys(validations).forEach((layout: string) => {
    Object.keys(validations[layout]?.unmapped || {}).forEach((key: string) => {
      validations[layout].unmapped[key]?.errors?.forEach((message) => {
        messages.push(message);
      });
    });
  });
  return messages;
}

export interface FlatError {
  layout: string;
  componentId: string;
  message: string;
}

/**
 * Gets all mapped errors as flat array
 */
export const getMappedErrors = (validations: IValidations): FlatError[] => {
  const errors: FlatError[] = [];

  for (const layout in validations) {
    for (const componentId in validations[layout]) {
      if (componentId === 'unmapped') {
        continue;
      }

      const validationObject = validations[layout][componentId];
      for (const fieldKey in validationObject) {
        for (const message of validationObject[fieldKey]?.errors || []) {
          errors.push({
            layout,
            componentId,
            message,
          });
        }
      }
    }
  }

  return errors;
};

/**
 * Returns true if there are errors in the form at all (faster than getting all mapped/unmapped errors)
 * When this returns true, ErrorReport.tsx should be displayed
 */
export const getFormHasErrors = (validations: IValidations): boolean => {
  for (const layout in validations) {
    for (const key in validations[layout]) {
      const validationObject = validations[layout][key];
      for (const fieldKey in validationObject) {
        const fieldValidationErrors = validationObject[fieldKey]?.errors;
        if (fieldValidationErrors && fieldValidationErrors.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

/*
 * Removes the validations for a given group index and shifts higher indexes if necessary.
 * @param id the group id
 * @param index the index to remove
 * @param currentLayout the current layout
 * @param layout the layout state
 * @param repeatingGroups the repeating groups
 * @param validations the current validations
 * @returns a new validation object with the validations for the given group index removed
 */
export function removeGroupValidationsByIndex(
  id: string,
  index: number,
  currentLayout: string,
  layout: ILayouts,
  repeatingGroups: IRepeatingGroups,
  validations: IValidations,
  shift = true,
): IValidations {
  if (!validations[currentLayout]) {
    return validations;
  }
  let result = JSON.parse(JSON.stringify(validations));
  const indexedId = `${id}-${index}`;
  const repeatingGroup = repeatingGroups[id];
  delete result[currentLayout][indexedId];
  const children = getGroupChildren(repeatingGroup.baseGroupId || id, layout[currentLayout] || []);
  const parentGroup = getParentGroup(repeatingGroup.baseGroupId || id, layout[currentLayout] || []);

  // Remove validations for child elements on given index
  children?.forEach((element) => {
    let childKey;
    if (parentGroup) {
      const splitId = id.split('-');
      const parentIndex = splitId[splitId.length - 1];
      childKey = `${element.id}-${parentIndex}-${index}`;
    } else {
      childKey = `${element.id}-${index}`;
    }
    if (element.type !== 'Group') {
      // delete component directly
      delete result[currentLayout][childKey];
    } else {
      // recursively call delete if we have a child group
      const childGroupCount = repeatingGroups[`${element.id}-${index}`]?.index;
      for (let i = 0; i <= childGroupCount; i++) {
        result = removeGroupValidationsByIndex(
          `${element.id}-${index}`,
          i,
          currentLayout,
          layout,
          repeatingGroups,
          result,
          false,
        );
      }
    }
  });

  // Shift validations if necessary
  if (shift && index < repeatingGroup.index + 1) {
    for (let i = index + 1; i <= repeatingGroup.index + 1; i++) {
      const key = `${id}-${i}`;
      const newKey = `${id}-${i - 1}`;
      delete result[currentLayout][key];
      result[currentLayout][newKey] = validations[currentLayout][key];
      children?.forEach((element) => {
        let childKey;
        let shiftKey;
        if (parentGroup) {
          const splitId = id.split('-');
          const parentIndex = splitId[splitId.length - 1];
          childKey = `${element.id}-${parentIndex}-${i}`;
          shiftKey = `${element.id}-${parentIndex}-${i - 1}`;
        } else {
          childKey = `${element.id}-${i}`;
          shiftKey = `${element.id}-${i - 1}`;
        }
        if (element.type !== 'Group') {
          delete result[currentLayout][childKey];
          result[currentLayout][shiftKey] = validations[currentLayout][childKey];
        } else {
          result = shiftChildGroupValidation(
            element,
            i,
            result,
            repeatingGroups,
            layout[currentLayout] || [],
            currentLayout,
          );
        }
      });
    }
  }

  return result;
}

function shiftChildGroupValidation(
  group: ExprUnresolved<ILayoutGroup>,
  indexToShiftFrom: number,
  validations: IValidations,
  repeatingGroups: IRepeatingGroups,
  layout: ILayout,
  currentLayout: string,
) {
  const result = JSON.parse(JSON.stringify(validations));
  const highestIndexOfChildGroup = getHighestIndexOfChildGroup(group.id, repeatingGroups);
  const children = getGroupChildren(group.id, layout);

  for (let i = indexToShiftFrom; i <= highestIndexOfChildGroup + 1; i++) {
    const givenIndexCount = repeatingGroups[`${group.id}-${i}`]?.index ?? -1;
    for (let childIndex = 0; childIndex < givenIndexCount + 1; childIndex++) {
      const childGroupKey = `${group.id}-${i}-${childIndex}`;
      const shiftGroupKey = `${group.id}-${i - 1}-${childIndex}`;
      delete result[currentLayout][childGroupKey];
      result[currentLayout][shiftGroupKey] = validations[currentLayout][childGroupKey];
      children?.forEach((child) => {
        const childKey = `${child.id}-${i}-${childIndex}`;
        const shiftKey = `${child.id}-${i - 1}-${childIndex}`;
        delete result[currentLayout][childKey];
        result[currentLayout][shiftKey] = validations[currentLayout][childKey];
      });
    }
  }
  return result;
}

export function getHighestIndexOfChildGroup(group: string, repeatingGroups: IRepeatingGroups) {
  if (!group || !repeatingGroups) {
    return -1;
  }
  let index = 0;
  while (repeatingGroups[`${group}-${index}`]?.index !== undefined) {
    index += 1;
  }
  return index - 1;
}

export function missingFieldsInLayoutValidations(
  layoutValidations: ILayoutValidations,
  langTools: IUseLanguage,
): boolean {
  let result = false;
  let requiredMessage = langTools.langAsString('form_filler.error_required');
  // Strip away parametrized part of error message, as this will vary with each component.
  requiredMessage = requiredMessage.substring(0, requiredMessage.indexOf('{0}'));
  const lookForRequiredMsg = (e: any) => {
    if (typeof e === 'string') {
      return e.includes(requiredMessage);
    }
    if (Array.isArray(e)) {
      return e.findIndex(lookForRequiredMsg) > -1;
    }
    return (e?.props?.children as string).includes(requiredMessage);
  };

  Object.keys(layoutValidations).forEach((component: string) => {
    if (!layoutValidations[component] || result) {
      return;
    }
    Object.keys(layoutValidations[component]).forEach((binding: string) => {
      if (!layoutValidations[component][binding] || result) {
        return;
      }

      const errors = layoutValidations[component][binding]?.errors;
      result = !!(errors && errors.length > 0 && errors.findIndex(lookForRequiredMsg) > -1);
    });
  });

  return result;
}
