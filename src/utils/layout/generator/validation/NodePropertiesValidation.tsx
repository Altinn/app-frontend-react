import React, { useEffect, useMemo } from 'react';

import { useCurrentDataModelSchemaLookup } from 'src/features/datamodel/DataModelSchemaProvider';
import { formatLayoutSchemaValidationError } from 'src/features/devtools/utils/layoutSchemaValidation';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorStages } from 'src/utils/layout/generator/GeneratorStages';
import { GeneratorValidation } from 'src/utils/layout/generator/validation/GenerationValidationContext';
import { useIsJest } from 'src/utils/layout/generator/validation/useIsJest';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { duplicateStringFilter } from 'src/utils/stringHelper';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { CompExternalExact, CompIntermediate } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface NodeValidationProps {
  node: LayoutNode;
  item: CompIntermediate;
}

/**
 * Validates the properties of a node. Note that this is not the same as validating form data in the node.
 */
export function NodePropertiesValidation(props: NodeValidationProps) {
  return (
    <>
      <DataModelValidation {...props} />
      <SchemaValidation {...props} />
    </>
  );
}

function DataModelValidation({ node, item }: NodeValidationProps) {
  const addError = NodesInternal.useAddError();
  const schemaLookup = useCurrentDataModelSchemaLookup();
  const isJest = useIsJest();

  const errors = useMemo(() => {
    if (isJest) {
      return [];
    }

    if ('validateDataModelBindings' in node.def) {
      const ctx: LayoutValidationCtx<any> = {
        node: node as LayoutNode<any>,
        item: item as CompIntermediate<any>,
        lookupBinding: (binding: string) => schemaLookup.getSchemaForPath(binding),
      };
      return node.def.validateDataModelBindings(ctx as any);
    }

    return [];
  }, [item, node, schemaLookup, isJest]);

  // Must run after nodes have been added for the errors to actually be added
  GeneratorStages.MarkHidden.useEffect(() => {
    if (!errors.length) {
      return;
    }

    window.logErrorOnce(`Data model binding errors for component '/${node.getId()}':\n- ${errors.join('\n- ')}`);

    for (const error of errors) {
      addError(error, node);
    }
  }, [addError, errors, node]);

  return null;
}

function SchemaValidation({ node }: NodeValidationProps) {
  const validate = GeneratorValidation.useValidate();
  const layoutMap = GeneratorInternal.useLayoutMap();
  const addError = NodesInternal.useAddError();

  useEffect(() => {
    if (!validate) {
      return;
    }
    const item = layoutMap[node.getBaseId()];
    const errors = node.def.validateLayoutConfig(item as CompExternalExact<any>, validate);
    if (!errors) {
      return;
    }

    const errorMessages = errors
      .map(formatLayoutSchemaValidationError)
      .filter((m) => m != null)
      .filter(duplicateStringFilter) as string[];
    if (!errorMessages.length) {
      return;
    }

    window.logErrorOnce(
      `Layout configuration errors for component '/${node.getId()}':\n- ${errorMessages.join('\n- ')}`,
    );

    for (const error of errorMessages) {
      addError(error, node);
    }
  }, [node, layoutMap, validate, addError]);

  return null;
}
