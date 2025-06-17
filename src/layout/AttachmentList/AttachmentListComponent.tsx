import React from 'react';

import { AltinnAttachments } from 'src/components/atoms/AltinnAttachments';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { useLaxProcessData } from 'src/features/instance/ProcessContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import {
  DataTypeReference,
  filterOutDataModelRefDataAsPdfAndAppOwnedDataTypes,
  getRefAsPdfAttachments,
  toDisplayAttachments,
} from 'src/utils/attachmentsUtils';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataType } from 'src/types/shared';

export type IAttachmentListProps = PropsFromGenericComponent<'AttachmentList'>;

const emptyDataTypeArray: IDataType[] = [];

export function AttachmentListComponent({ node }: IAttachmentListProps) {
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const links = useNodeItem(node, (i) => i.links);
  const allowedAttachmentTypes = new Set(useNodeItem(node, (i) => i.dataTypeIds) ?? []);

  const instanceData = useLaxInstanceData((data) => data.data) ?? [];
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const appMetadataDataTypes = useApplicationMetadata().dataTypes ?? emptyDataTypeArray;
  const dataTypeIdsInCurrentTask = appMetadataDataTypes.filter((it) => it.taskId === currentTaskId).map((it) => it.id);

  const relevantAttachments = filterOutDataModelRefDataAsPdfAndAppOwnedDataTypes({
    data: instanceData,
    appMetadataDataTypes,
  });

  // This filter function takes all the instance data and filters down to only the attachments
  // we're interested in showing here.
  const filteredAttachments = relevantAttachments.filter((el) => {
    if (allowedAttachmentTypes.has(DataTypeReference.IncludeAll) || allowedAttachmentTypes.size === 0) {
      return true;
    }

    if (allowedAttachmentTypes.has(el.dataType)) {
      return true;
    }

    if (allowedAttachmentTypes.has(DataTypeReference.FromTask)) {
      // if only data types from current task are allowed, we check if the data type is in the task
      return dataTypeIdsInCurrentTask.includes(el.dataType);
    }

    return false;
  });

  const includePdf =
    allowedAttachmentTypes.has(DataTypeReference.RefDataAsPdf) ||
    allowedAttachmentTypes.has(DataTypeReference.IncludeAll);
  const pdfAttachments = includePdf ? getRefAsPdfAttachments(instanceData) : [];

  return (
    <ComponentStructureWrapper node={node}>
      <AltinnAttachments
        attachments={toDisplayAttachments([...pdfAttachments, ...filteredAttachments])}
        title={textResourceBindings?.title}
        links={links}
      />
    </ComponentStructureWrapper>
  );
}
