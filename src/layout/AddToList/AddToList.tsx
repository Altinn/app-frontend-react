import React, { useEffect, useRef, useState } from 'react';
import type { MonthCaption } from 'react-day-picker';

import { Button, Modal } from '@digdir/designsystemet-react';
import { v4 as uuidv4 } from 'uuid';
import type { JSONSchema7 } from 'json-schema';

import { DynamicForm } from 'src/app-components/DynamicForm/DynamicForm';
import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { FD } from 'src/features/formData/FormDataWrite';
import { ALTINN_ROW_ID } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { DropdownCaption } from 'src/layout/Datepicker/DropdownCaption';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { FormDataObject } from 'src/app-components/DynamicForm/DynamicForm';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelReference } from 'src/layout/common.generated';
type AddToListProps = PropsFromGenericComponent<'AddToList'>;

export function isJSONSchema7Definition(obj: unknown): obj is JSONSchema7 {
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
  backdropClose?: boolean;
  onClose?: () => void;
  modalRef?: React.RefObject<HTMLDialogElement>;
  DropdownCaption: typeof MonthCaption;
}

export function AddToListModal({
  onChange,
  initialData,
  dataModelReference,
  backdropClose,
  onClose,
  modalRef,
  DropdownCaption,
}: ModalDynamicFormProps) {
  const appendToList = FD.useAppendToList();
  let addToListModalRef = useRef<HTMLDialogElement>(null);
  addToListModalRef = modalRef ?? addToListModalRef;

  const { schemaLookup } = DataModels.useFullStateRef().current;

  const schema = schemaLookup[dataModelReference.dataType].getSchemaForPath(dataModelReference.field)[0];

  const [tempFormData, setTempFormData] = useState<FormDataObject | undefined>(initialData);

  const { langAsString } = useLanguage();

  useEffect(() => {
    if (!initialData) {
      const uuid = uuidv4();
      appendToList({
        reference: dataModelReference,
        newValue: { [ALTINN_ROW_ID]: uuid },
      });
    }
  }, [appendToList, dataModelReference, initialData]);

  const onFormDataUpdate = (updatedData: FormDataObject) => {
    setTempFormData(updatedData);
  };

  if (!schema?.items) {
    return null;
  }
  if (!isJSONSchema7Definition(schema?.items)) {
    return null;
  }
  return (
    <Modal
      ref={addToListModalRef}
      style={{ padding: 'var(--ds-size-3)' }}
      backdropClose={backdropClose}
      onClose={onClose}
    >
      <Modal.Block>
        <DynamicForm
          schema={schema?.items}
          onChange={onFormDataUpdate}
          initialData={tempFormData}
          DropdownCaption={DropdownCaption}
          buttonAriaLabel={langAsString('date_picker.aria_label_icon')}
          calendarIconTitle={langAsString('date_picker.aria_label_icon')}
        />
      </Modal.Block>
      <Modal.Block>
        <Button
          data-size='md'
          variant='primary'
          onClick={() => {
            if (tempFormData) {
              onChange(tempFormData);
            }
          }}
        >
          Lagre
        </Button>
      </Modal.Block>
    </Modal>
  );
}

export function AddToListComponent({ node }: AddToListProps) {
  const item = useNodeItem(node);

  const { formData } = useDataModelBindings(item.dataModelBindings, 1, 'raw');
  const setMultiLeafValues = FD.useSetMultiLeafValues();

  const modalRef = useRef<HTMLDialogElement>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      {showForm && (
        <AddToListModal
          dataModelReference={item.dataModelBindings.data}
          modalRef={modalRef}
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
          backdropClose={true}
          DropdownCaption={DropdownCaption}
        />
      )}

      <Button
        data-size='md'
        variant='primary'
        onClick={() => modalRef.current?.showModal()} // Call onChange when button is clicked
      >
        Legg til
      </Button>
    </div>
  );
}
