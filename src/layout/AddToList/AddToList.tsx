import React, { useEffect, useState } from 'react';

import { Button } from '@digdir/designsystemet-react';
import { v4 as uuidv4 } from 'uuid';
import type { JSONSchema7 } from 'json-schema';

import { DynamicForm } from 'src/app-components/DynamicForm/DynamicForm';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { DynamicFormProps } from 'src/app-components/DynamicForm/DynamicForm';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
type AddToListProps = PropsFromGenericComponent<'AddToList'>;

function isJSONSchema7Definition(obj: unknown): obj is JSONSchema7 {
  if (typeof obj === 'boolean') {
    return true;
  }

  if (typeof obj === 'object' && obj !== null) {
    const schema = obj as Record<string, unknown>;
    if (
      Object.prototype.hasOwnProperty.call(schema, 'type') ||
      Object.prototype.hasOwnProperty.call(schema, 'properties')
    ) {
      return true;
    }
  }
  return false;
}

//IDataModelReference

interface ModalDynamicFormProps extends DynamicFormProps {
  dataModelReference: IDataModelReference;
}

function AddToListModal({ schema, onChange, initialData, dataModelReference }: ModalDynamicFormProps) {
  const appendToList = FD.useAppendToList();

  useEffect(() => {
    const uuid = uuidv4();
    appendToList({
      reference: dataModelReference,
      newValue: { [ALTINN_ROW_ID]: uuid },
    });
  }, [appendToList, dataModelReference]);

  return (
    <DynamicForm
      schema={schema}
      onChange={onChange}
    />
  );
}

export function AddToListComponent({ node }: AddToListProps) {
  const item = useNodeItem(node);

  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');

  console.log('item', item);
  console.log('formData', formData);
  const setLeafValue = FD.useSetLeafValue();

  const setMultiLeafValues = FD.useSetMultiLeafValues();

  const { allDataTypes, writableDataTypes, defaultDataType, initialData, schemaLookup, dataElementIds } =
    DataModels.useFullStateRef().current;

  const schema = schemaLookup[item.dataModelBindings.data.dataType].getSchemaForPath(
    item.dataModelBindings.data.field,
  )[0];

  const properties = schema?.items;
  const [showForm, setShowForm] = useState(false);

  if (!properties) {
    return null;
  }
  if (!isJSONSchema7Definition(properties)) {
    return null;
  }

  return (
    <div>
      <pre>{JSON.stringify(formData, null, 2)}</pre>

      {showForm && (
        <AddToListModal
          schema={properties}
          dataModelReference={item.dataModelBindings.data}
          onChange={(formProps) => {
            console.log('onChange HERE!');
            const changes = Object.entries(formProps).map((entry) => ({
              reference: {
                dataType: item.dataModelBindings.data.dataType,
                field: `${item.dataModelBindings.data.field}/${(formData.data as []).length - 1}/${entry[0]}`,
              },
              newValue: `${entry[1]}`,
              changes: [],
            }));
            console.log('SETTING!');
            console.log(JSON.stringify(changes, null, 2));
            setMultiLeafValues({ changes });
            setShowForm(false);
          }}
        />
      )}

      {!showForm && (
        <Button
          size='md'
          variant='primary'
          onClick={() => setShowForm(true)} // Call onChange when button is clicked
        >
          Legg til
        </Button>
      )}
    </div>
  );
}
