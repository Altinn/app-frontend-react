// import React, { useEffect, useRef, useState } from 'react';
//
// import { Button, Heading, Modal } from '@digdir/designsystemet-react';
// import { v4 as uuidv4 } from 'uuid';
// import type { JSONSchema7 } from 'json-schema';
//
// import { DynamicForm } from 'src/app-components/DynamicForm/DynamicForm';
// import { DataModels } from 'src/features/datamodel/DataModelsProvider';
// import { FD } from 'src/features/formData/FormDataWrite';
// import { ALTINN_ROW_ID } from 'src/features/formData/types';
// import { useNodeItem } from 'src/utils/layout/useNodeItem';
// import type { FormDataObject } from 'src/app-components/DynamicForm/DynamicForm';
// import type { PropsFromGenericComponent } from 'src/layout';
// import type { IDataModelReference } from 'src/layout/common.generated';
// type AddToListProps = PropsFromGenericComponent<'AddToList'>;
//
// function isJSONSchema7Definition(obj: unknown): obj is JSONSchema7 {
//   if (typeof obj === 'boolean') {
//     return true;
//   }
//
//   if (typeof obj === 'object' && obj !== null) {
//     const schema = obj as Record<string, unknown>;
//     if (
//       Object.prototype.hasOwnProperty.call(schema, 'type') ||
//       Object.prototype.hasOwnProperty.call(schema, 'properties')
//     ) {
//       return true;
//     }
//   }
//   return false;
// }
//
// export interface ModalDynamicFormProps {
//   dataModelReference: IDataModelReference;
//   onChange: (data: FormDataObject) => void;
//   initialData?: FormDataObject; // Added to receive existing item
//   locale?: string;
//   editItemIndex?: number;
// }
//
// export function AddToListModal({ onChange, initialData, dataModelReference, editItemIndex }: ModalDynamicFormProps) {
//   const appendToList = FD.useAppendToList();
//   const modalRef = useRef<HTMLDialogElement>(null);
//
//   const { schemaLookup } = DataModels.useFullStateRef().current;
//
//   const schema = schemaLookup[dataModelReference.dataType].getSchemaForPath(dataModelReference.field)[0]?.items;
//   const setMultiLeafValues = FD.useSetMultiLeafValues();
//   useEffect(() => {
//     modalRef.current?.showModal();
//     if (!editItemIndex) {
//       const uuid = uuidv4();
//       appendToList({
//         reference: dataModelReference,
//         newValue: { [ALTINN_ROW_ID]: uuid },
//       });
//     }
//   }, [appendToList, dataModelReference, editItemIndex]);
//
//   if (!schema) {
//     return null;
//   }
//
//   if (!isJSONSchema7Definition(schema)) {
//     return null;
//   }
//
//   return (
//     <Modal ref={modalRef}>
//       {/*<pre>{JSON.stringify(formData, null, 2)}</pre>*/}
//       <Heading
//         size='xs'
//         style={{
//           marginBottom: 'var(--ds-spacing-2)',
//         }}
//       >
//         Modal header
//       </Heading>
//       <DynamicForm
//         schema={schema}
//         onChange={(formData) => {
//           console.log(JSON.stringify(formData, null, 2));
//
//           const index = editItemIndex ? editItemIndex : (formData.simpleBinding as []).length - 1;
//
//           const changes = Object.entries(formData).map((entry) => ({
//             reference: {
//               dataType: dataModelReference.dataType,
//               field: `${dataModelReference.field}[${index}].${entry[0]}`,
//             },
//             newValue: `${entry[1]}`,
//           }));
//           setMultiLeafValues({ changes });
//           onChange(formData);
//         }}
//         initialData={initialData}
//       />
//     </Modal>
//   );
// }
//
// export function AddToListComponent({ node }: AddToListProps) {
//   const item = useNodeItem(node);
//
//   const [showForm, setShowForm] = useState(false);
//
//   return (
//     <div>
//       {showForm && (
//         <AddToListModal
//           dataModelReference={item.dataModelBindings.data}
//           onChange={(formProps) => {
//             setShowForm(false);
//           }}
//         />
//       )}
//
//       <Button
//         size='md'
//         variant='primary'
//         onClick={() => setShowForm(true)} // Call onChange when button is clicked
//       >
//         Legg til
//       </Button>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from 'react';

import { Button, Heading, Modal } from '@digdir/designsystemet-react';
import { v4 as uuidv4 } from 'uuid';
import type { JSONSchema7 } from 'json-schema';

import { DynamicForm } from 'src/app-components/DynamicForm/DynamicForm';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { FormDataObject } from 'src/app-components/DynamicForm/DynamicForm';
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

interface ModalDynamicFormProps {
  dataModelReference: IDataModelReference;
  onChange: (data: FormDataObject) => void;
  initialData?: FormDataObject; // Added to receive existing item
  locale?: string;
}

export function AddToListModal({ onChange, initialData, dataModelReference }: ModalDynamicFormProps) {
  const appendToList = FD.useAppendToList();
  const modalRef = useRef<HTMLDialogElement>(null);

  const { schemaLookup } = DataModels.useFullStateRef().current;

  const schema = schemaLookup[dataModelReference.dataType].getSchemaForPath(dataModelReference.field)[0];

  useEffect(() => {
    modalRef.current?.showModal();
    if (!initialData) {
      const uuid = uuidv4();
      appendToList({
        reference: dataModelReference,
        newValue: { [ALTINN_ROW_ID]: uuid },
      });
    }
  }, [appendToList, dataModelReference, initialData]);

  if (!schema?.items) {
    return null;
  }
  if (!isJSONSchema7Definition(schema?.items)) {
    return null;
  }
  return (
    <Modal ref={modalRef}>
      <Heading
        size='xs'
        style={{
          marginBottom: 'var(--ds-spacing-2)',
        }}
      >
        Modal header
      </Heading>
      <DynamicForm
        schema={schema?.items}
        onChange={onChange}
        initialData={initialData}
      />
    </Modal>
  );
}

export function AddToListComponent({ node }: AddToListProps) {
  const item = useNodeItem(node);

  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
  const setMultiLeafValues = FD.useSetMultiLeafValues();

  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      {showForm && (
        <AddToListModal
          dataModelReference={item.dataModelBindings.data}
          onChange={(formProps) => {
            const changes = Object.entries(formProps).map((entry) => ({
              reference: {
                dataType: item.dataModelBindings.data.dataType,
                field: `${item.dataModelBindings.data.field}[${(formData.data as []).length - 1}].${entry[0]}`,
              },
              newValue: `${entry[1]}`,
            }));
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
