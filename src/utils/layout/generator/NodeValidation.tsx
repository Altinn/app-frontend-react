import React, { useMemo } from 'react';

import { useCurrentDataModelSchema } from 'src/features/datamodel/DataModelSchemaProvider';
import { dotNotationToPointer } from 'src/features/datamodel/notations';
import { lookupBindingInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import { useCurrentDataModelType } from 'src/features/datamodel/useBindingSchema';
import { GeneratorStages } from 'src/utils/layout/generator/GeneratorStages';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { getRootElementPath } from 'src/utils/schemaUtils';
import type { LayoutValidationCtx } from 'src/features/devtools/layoutValidation/types';
import type { CompIntermediate } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface NodeValidationProps {
  node: LayoutNode;
  item: CompIntermediate;
}

export function NodeValidation(props: NodeValidationProps) {
  return (
    <>
      <DataModelValidation {...props} />
    </>
  );
}

function DataModelValidation({ node, item }: NodeValidationProps) {
  const addError = NodesInternal.useAddError();
  const schema = useCurrentDataModelSchema();
  const dataType = useCurrentDataModelType();

  const errors = useMemo(() => {
    if ('validateDataModelBindings' in node.def && schema) {
      const rootElementPath = getRootElementPath(schema, dataType);
      // TODO: Verify that caching in lookupBindingInSchema still works after this
      // functionality have been spread out to each node generator
      const lookupBinding = (binding: string) =>
        lookupBindingInSchema({
          schema,
          rootElementPath,
          targetPointer: dotNotationToPointer(binding),
        });

      const ctx: LayoutValidationCtx<any> = {
        node: node as LayoutNode<any>,
        item: item as CompIntermediate<any>,
        lookupBinding,
      };
      return node.def.validateDataModelBindings(ctx as any);
    }

    return [];
  }, [dataType, item, node, schema]);

  // Must run after nodes have been added for the errors to actually be added
  GeneratorStages.MarkHidden.useEffect(() => {
    if (!errors.length) {
      return;
    }

    window.logErrorOnce(`Data model binding errors for component '/${node.path.join('/')}':\n- ${errors.join('\n- ')}`);

    for (const error of errors) {
      addError(error, node);
    }
  }, [addError, errors, node]);

  return null;
}
