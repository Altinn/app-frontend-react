import React from 'react';

import { FormDataActions } from 'src/features/formData/formDataSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { createStrictContext } from 'src/utils/createContext';
import type { IComponentProps } from 'src/layout';
import type { IDataModelBindingsForList } from 'src/layout/List/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface Props {
  node: LayoutNode<'FileUpload' | 'FileUploadWithTag'>;
  handleDataChange: IComponentProps<'FileUpload' | 'FileUploadWithTag'>['handleDataChange'];
  formData: IComponentProps<'FileUpload' | 'FileUploadWithTag'>['formData'];
}

interface MappingTools {
  addAttachment: (uuid: string) => void;
  removeAttachment: (uuid: string) => void;
}

const Noop: MappingTools = {
  addAttachment: () => {},
  removeAttachment: () => {},
};

/**
 * This hook is used to provide functionality for the FileUpload and FileUploadWithTag components, where uploading
 * attachments into components in repeating groups need to map the attachment IDs to the form data.
 *
 * This is because repeating groups will create repeating structures (object[]) in the form data, but attachments
 * are not part of the form data, so it would be unclear which row in a repeating group the attachment belongs to.
 * Adding the attachment ID to the form data in that repeating group makes that clear, and this hook provides the
 * functionality to call after uploading/removing attachments to update the form data.
 */
export function useAttachmentsMappedToFormData(props: Props): MappingTools {
  const forList = useMappingToolsForList(props);
  const forSimple = useMappingToolsForSimple(props);
  const bindings = props.node.item.dataModelBindings;
  if (!bindings) {
    return Noop;
  }

  if ('list' in bindings) {
    return forList;
  }

  return forSimple;
}

function useMappingToolsForList({ formData, node }: Props): MappingTools {
  const dispatch = useAppDispatch();
  const field = ((node.item.dataModelBindings || {}) as IDataModelBindingsForList).list;
  return {
    addAttachment: (uuid: string) => {
      dispatch(
        FormDataActions.update({
          field,
          data: [...(formData[field] || []), uuid],
          componentId: node.item.id,
        }),
      );
    },
    removeAttachment: (uuid: string) => {
      dispatch(
        FormDataActions.update({
          field,
          data: formData[field]?.filter((id: string) => id !== uuid),
          componentId: node.item.id,
        }),
      );
    },
  };
}

function useMappingToolsForSimple({ handleDataChange }: Props): MappingTools {
  return {
    addAttachment: (uuid: string) => {
      handleDataChange(uuid);
    },
    removeAttachment: () => {
      handleDataChange(undefined);
    },
  };
}

type ContextData = { mappingTools: MappingTools };

const { Provider, useCtx } = createStrictContext<ContextData>();

/**
 * If you need to provide the functionality of the useAttachmentsMappedToFormData hook deep in the component tree,
 * you can use this context provider to do so.
 */
export function AttachmentsMappedToFormDataProvider({ children, mappingTools }: React.PropsWithChildren<ContextData>) {
  return <Provider value={{ mappingTools }}>{children}</Provider>;
}

export const useAttachmentsMappedToFormDataProvider = () => useCtx().mappingTools;
