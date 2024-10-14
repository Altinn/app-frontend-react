import React from 'react';

import type { JSONSchema7 } from 'json-schema';

import { DynamicForm } from 'src/app-components/DynamicForm/DynamicForm';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

type AddToListProps = PropsFromGenericComponent<'AddToList'>;

function isJSONSchema7Definition(obj: unknown): obj is JSONSchema7 {
  if (typeof obj === 'boolean') {
    return true;
  }

  if (typeof obj === 'object' && obj !== null) {
    const schema = obj as Record<string, unknown>;
    // Use Object.prototype.hasOwnProperty.call instead of direct access
    if (
      Object.prototype.hasOwnProperty.call(schema, 'type') ||
      Object.prototype.hasOwnProperty.call(schema, 'properties')
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Generic DataTable component to display tabular data.
 *
 * @param data - Array of data objects.
 * @param columns - Configuration for table columns.
 */
export function AddToListComponent({ node }: AddToListProps) {
  const item = useNodeItem(node);

  console.log('item', item);

  console.log(item.dataModelBindings.data.dataType);

  const { formData, setValue } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
  const { allDataTypes, writableDataTypes, defaultDataType, initialData, schemaLookup, dataElementIds } =
    DataModels.useFullStateRef().current;

  console.log({ allDataTypes, writableDataTypes, defaultDataType, initialData, schemaLookup, dataElementIds });

  // const schema = useDataModelSchema();
  console.log(schemaLookup[item.dataModelBindings.data.dataType].getSchemaForPath('repeatingGroup'));

  const schema = schemaLookup[item.dataModelBindings.data.dataType].getSchemaForPath(
    item.dataModelBindings.data.field,
  )[0];

  const properties = schema?.items;

  // console.log('schema', (schema?.items as JSONSchema7).properties);

  // const dataType = useDataModelType(dataTypeId);
  if (!properties) {
    return null;
  }
  return (
    <div>
      {isJSONSchema7Definition(properties) && (
        <DynamicForm
          schema={properties}
          onChange={(formProps) => {
            console.log(formProps);
          }}
        />
      )}

      <pre>{JSON.stringify(properties, null, 2)}</pre>
    </div>
  );
}
