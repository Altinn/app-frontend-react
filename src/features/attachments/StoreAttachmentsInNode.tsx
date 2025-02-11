import React, { useEffect } from 'react';

import deepEqual from 'fast-deep-equal';

import { useTaskStore } from 'src/core/contexts/taskStoreContext';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { isAttachmentUploaded } from 'src/features/attachments/index';
import { DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLaxInstanceDataElements } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import { NodesStateQueue } from 'src/utils/layout/generator/CommitQueue';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorCondition, StageEvaluateExpressions } from 'src/utils/layout/generator/GeneratorStages';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeFormData } from 'src/utils/layout/useNodeItem';
import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';
import type { IAttachment } from 'src/features/attachments/index';
import type { IDataModelBindingsList, IDataModelBindingsSimple } from 'src/layout/common.generated';
import type { CompWithBehavior } from 'src/layout/layout';
import type { IData } from 'src/types/shared';
import type { IComponentFormData } from 'src/utils/formComponentUtils';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type AttachmentRecord = Record<string, IAttachment>;

export function StoreAttachmentsInNode() {
  return (
    <GeneratorCondition
      stage={StageEvaluateExpressions}
      mustBeAdded='parent'
    >
      <StoreAttachmentsInNodeWorker />
    </GeneratorCondition>
  );
}

function StoreAttachmentsInNodeWorker() {
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveAttachments'>>;
  const item = GeneratorInternal.useIntermediateItem();
  const attachments = useNodeAttachments();
  const errors = NodesInternal.useNodeErrors(node);
  const hasErrors = errors && Object.values(errors).length > 0;

  const hasBeenSet = NodesInternal.useNodeData(node, (data) => deepEqual(data.attachments, attachments));
  NodesStateQueue.useSetNodeProp({ node, prop: 'attachments', value: attachments }, !hasBeenSet);

  if (hasErrors) {
    // If there are errors, we don't want to run the effects. It could be the case that multiple FileUpload components
    // have been bound to the same path in the data model, which could cause infinite loops in the components below
    // when they try to manage the same binding.
    return null;
  }

  // When the backend deletes an attachment, we might need to update the data model and remove the attachment ID from
  // there (if the backend didn't do so already). This is done by these `Maintain*DataModelBinding` components.
  const dataModelBindings = item?.dataModelBindings as IDataModelBindingsSimple | IDataModelBindingsList | undefined;
  return dataModelBindings && 'list' in dataModelBindings && dataModelBindings.list ? (
    <MaintainListDataModelBinding
      bindings={dataModelBindings}
      attachments={attachments}
    />
  ) : dataModelBindings && 'simpleBinding' in dataModelBindings && dataModelBindings.simpleBinding ? (
    <MaintainSimpleDataModelBinding
      bindings={dataModelBindings}
      attachments={attachments}
    />
  ) : null;
}

function useNodeAttachments(): AttachmentRecord {
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveAttachments'>>;
  const nodeData = useNodeFormData(node);

  const overriddenTaskId = useTaskStore((state) => state.overriddenTaskId);

  const application = useApplicationMetadata();
  const currentTask = useLaxProcessData()?.currentTask?.elementId;
  const data = useLaxInstanceDataElements(node.baseId);

  const mappedAttachments = useMemoDeepEqual(() => {
    const taskId = overriddenTaskId ? overriddenTaskId : currentTask;

    return mapAttachments(node, data, application, taskId, nodeData);
  }, [node, data, application, currentTask, nodeData, overriddenTaskId]);

  const prev = NodesInternal.useNodeData(node, (data) => data.attachments);

  return useMemoDeepEqual(() => {
    const result: Record<string, IAttachment> = {};

    for (const attachment of mappedAttachments) {
      const prevStored = prev?.[attachment.id];
      result[attachment.id] = {
        uploaded: true,
        updating: prevStored?.updating || false,
        deleting: prevStored?.deleting || false,
        data: {
          ...attachment,
          tags: prevStored?.data.tags ?? attachment.tags,
        },
      };
    }

    // Find any not-yet uploaded attachments and add them back to the result
    for (const [id, attachment] of Object.entries(prev ?? {})) {
      if (!result[id] && !isAttachmentUploaded(attachment)) {
        result[id] = attachment;
      }
    }

    return result;
  }, [mappedAttachments, prev]);
}

function mapAttachments(
  node: LayoutNode,
  dataElements: IData[],
  application: ApplicationMetadata,
  currentTask: string | undefined,
  formData: IComponentFormData<CompWithBehavior<'canHaveAttachments'>>,
): IData[] {
  const attachments: IData[] = [];
  for (const data of dataElements) {
    if (data.dataType && node.baseId !== data.dataType) {
      // The attachment does not belong to this node
      continue;
    }

    const dataType = application.dataTypes.find((dt) => dt.id === data.dataType);
    if (!dataType) {
      continue;
    }

    if (dataType.taskId && dataType.taskId !== currentTask) {
      continue;
    }

    if (dataType.appLogic?.classRef) {
      // Data models are not attachments
      continue;
    }

    if (dataType.id === 'ref-data-as-pdf') {
      // Generated PDF receipts are not attachments
      continue;
    }

    const simpleValue = formData && 'simpleBinding' in formData ? formData.simpleBinding : undefined;
    const listValue = formData && 'list' in formData ? formData.list : undefined;

    if (simpleValue && simpleValue === data.id) {
      attachments.push(data);
      continue;
    }

    if (listValue && Array.isArray(listValue) && listValue.some((binding) => binding === data.id)) {
      attachments.push(data);
      continue;
    }

    const nodeIsInRepeatingGroup = node.id !== node.baseId;
    if (!simpleValue && !listValue && !nodeIsInRepeatingGroup) {
      // We can safely assume the attachment belongs to this node.
      attachments.push(data);
    }
  }

  return attachments;
}

interface MaintainBindingsProps {
  attachments: AttachmentRecord;
}

interface MaintainListDataModelBindingProps extends MaintainBindingsProps {
  bindings: IDataModelBindingsList;
}

interface MaintainSimpleDataModelBindingProps extends MaintainBindingsProps {
  bindings: IDataModelBindingsSimple;
}

/**
 * @see useSetAttachmentInDataModel
 */
function MaintainListDataModelBinding({ bindings, attachments }: MaintainListDataModelBindingProps) {
  const { formData, setValue } = useDataModelBindings(bindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');

  useEffect(() => {
    const newList = Object.values(attachments)
      .filter(isAttachmentUploaded)
      .map((attachment) => attachment.data.id);

    if (!deepEqual(formData.list, newList)) {
      setValue('list', newList);
    }
  }, [attachments, formData.list, setValue]);

  return null;
}

/**
 * @see useSetAttachmentInDataModel
 */
function MaintainSimpleDataModelBinding({ bindings, attachments }: MaintainSimpleDataModelBindingProps) {
  const node = GeneratorInternal.useParent() as LayoutNode<CompWithBehavior<'canHaveAttachments'>>;
  const { formData, setValue } = useDataModelBindings(bindings, DEFAULT_DEBOUNCE_TIMEOUT, 'raw');

  useEffect(() => {
    if (Object.keys(attachments).length > 1) {
      window.logErrorOnce(
        `Node ${node.id} has more than one attachment, but only one is supported with \`dataModelBindings.simpleBinding\``,
      );
      return;
    }

    const firstAttachment = Object.values(attachments)[0];
    if (!firstAttachment && formData.simpleBinding) {
      setValue('simpleBinding', undefined);
    } else if (
      firstAttachment &&
      isAttachmentUploaded(firstAttachment) &&
      formData.simpleBinding !== firstAttachment.data.id
    ) {
      setValue('simpleBinding', firstAttachment.data.id);
    }
  }, [attachments, formData.simpleBinding, node.id, setValue]);

  return null;
}
