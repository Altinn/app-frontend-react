import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { ContextNotProvided } from 'src/core/contexts/context';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { isAttachmentUploaded, isDataPostError } from 'src/features/attachments/index';
import { sortAttachmentsByName } from 'src/features/attachments/sortAttachments';
import { FD } from 'src/features/formData/FormDataWrite';
import { dataModelPairsToObject } from 'src/features/formData/types';
import {
  useLaxAppendDataElements,
  useLaxInstanceId,
  useLaxMutateDataElement,
  useLaxRemoveDataElement,
} from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { type BackendValidationIssue, backendValidationIssueGroupListToObject } from 'src/features/validation';
import { getValidationIssueMessage } from 'src/features/validation/backendValidation/backendValidationUtils';
import { useWaitForState } from 'src/hooks/useWaitForState';
import { isAxiosError } from 'src/utils/isAxiosError';
import { nodesProduce } from 'src/utils/layout/NodesContext';
import { NodeDataPlugin } from 'src/utils/layout/plugins/NodeDataPlugin';
import { isAtLeastVersion } from 'src/utils/versionCompare';
import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';
import type {
  DataPostResponse,
  FileUploaderNode,
  IAttachment,
  IAttachmentsMap,
  TemporaryAttachment,
  UploadedAttachment,
} from 'src/features/attachments/index';
import type { FDActionResult } from 'src/features/formData/FormDataWriteStateMachine';
import type { IDataModelBindingsList, IDataModelBindingsSimple } from 'src/layout/common.generated';
import type { CompWithBehavior } from 'src/layout/layout';
import type { IData } from 'src/types/shared';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { NodesContext, NodesStoreFull } from 'src/utils/layout/NodesContext';
import type { NodeDataPluginSetState } from 'src/utils/layout/plugins/NodeDataPlugin';
import type { NodeData } from 'src/utils/layout/types';

type AttachmentUploadResult = {
  temporaryId: string;
  newDataElementId?: string;
  newInstanceData?: IData;
  error?: string;
};

export interface AttachmentActionUpload {
  files: {
    temporaryId: string;
    file: File;
  }[];
  node: FileUploaderNode;
  dataModelBindings: IDataModelBindingsSimple | IDataModelBindingsList | undefined;
}

export interface AttachmentActionUpdate {
  tags: string[];
  node: FileUploaderNode;
  attachment: UploadedAttachment;
}

export interface AttachmentActionRemove {
  node: FileUploaderNode;
  attachment: UploadedAttachment;
  dataModelBindings: IDataModelBindingsSimple | IDataModelBindingsList | undefined;
}

export type AttachmentsSelector = (node: FileUploaderNode) => IAttachment[];

export interface AttachmentsStorePluginConfig {
  extraFunctions: {
    attachmentUpload: (action: AttachmentActionUpload) => void;
    attachmentUploadFinished: (action: AttachmentActionUpload, result: AttachmentUploadResult[]) => void;

    attachmentUpdate: (action: AttachmentActionUpdate) => void;
    attachmentUpdateFulfilled: (action: AttachmentActionUpdate) => void;
    attachmentUpdateRejected: (action: AttachmentActionUpdate, error: AxiosError) => void;

    attachmentRemove: (action: AttachmentActionRemove) => void;
    attachmentRemoveFulfilled: (action: AttachmentActionRemove) => void;
    attachmentRemoveRejected: (action: AttachmentActionRemove, error: AxiosError) => void;
  };
  extraHooks: {
    useAttachmentsUpload: () => (
      action: Omit<AttachmentActionUpload, 'files'> & {
        files: File[];
      },
    ) => Promise<void>;
    useAttachmentsUpdate: () => (action: AttachmentActionUpdate) => Promise<void>;
    useAttachmentsRemove: () => (action: AttachmentActionRemove) => Promise<boolean>;

    useAttachments: (node: FileUploaderNode) => IAttachment[];
    useAttachmentsSelector: () => AttachmentsSelector;
    useWaitUntilUploaded: () => (node: FileUploaderNode, attachment: TemporaryAttachment) => Promise<IData | false>;

    useHasPendingAttachments: () => boolean;
    useAllAttachments: () => IAttachmentsMap;
  };
}

const emptyArray: IAttachment[] = [];

type ProperData = NodeData<CompWithBehavior<'canHaveAttachments'>>;

export class AttachmentsStorePlugin extends NodeDataPlugin<AttachmentsStorePluginConfig> {
  extraFunctions(set: NodeDataPluginSetState): AttachmentsStorePluginConfig['extraFunctions'] {
    return {
      attachmentUpload: ({ files, node }) => {
        set(
          nodesProduce((draft) => {
            const data = draft.nodeData[node.id] as ProperData;
            for (const { file, temporaryId } of files) {
              data.attachments[temporaryId] = {
                uploaded: false,
                updating: false,
                deleting: false,
                data: {
                  temporaryId,
                  filename: file.name,
                  size: file.size,
                },
              } satisfies TemporaryAttachment;
            }
          }),
        );
      },
      attachmentUploadFinished: ({ node }, actualIds) => {
        set(
          nodesProduce((draft) => {
            const nodeData = draft.nodeData[node.id] as ProperData;
            for (const { temporaryId, newDataElementId, error } of actualIds) {
              if (newDataElementId) {
                nodeData.attachments[newDataElementId] = nodeData.attachments[temporaryId];
              } else if (error) {
                nodeData.attachmentsFailedToUpload[temporaryId] = error;
              }
              delete nodeData.attachments[temporaryId];
            }
          }),
        );
      },
      attachmentUpdate: ({ node, attachment, tags }) => {
        set(
          nodesProduce((draft) => {
            const nodeData = draft.nodeData[node.id] as ProperData;
            const attachmentData = nodeData.attachments[attachment.data.id];
            if (isAttachmentUploaded(attachmentData)) {
              attachmentData.updating = true;
              attachmentData.data.tags = tags;
            } else {
              throw new Error('Cannot update a temporary attachment');
            }
          }),
        );
      },
      attachmentUpdateFulfilled: ({ node, attachment }) => {
        set(
          nodesProduce((draft) => {
            const nodeData = draft.nodeData[node.id] as ProperData;
            const attachmentData = nodeData.attachments[attachment.data.id];
            if (isAttachmentUploaded(attachmentData)) {
              attachmentData.updating = false;
            } else {
              throw new Error('Cannot update a temporary attachment');
            }
          }),
        );
      },
      attachmentUpdateRejected: ({ node, attachment }, error) => {
        set(
          nodesProduce((draft) => {
            const nodeData = draft.nodeData[node.id] as ProperData;
            const attachmentData = nodeData.attachments[attachment.data.id];
            if (isAttachmentUploaded(attachmentData)) {
              attachmentData.updating = false;
              attachmentData.error = error;
            } else {
              throw new Error('Cannot update a temporary attachment');
            }
          }),
        );
      },
      attachmentRemove: ({ node, attachment }) => {
        set(
          nodesProduce((draft) => {
            const nodeData = draft.nodeData[node.id] as ProperData;
            const attachmentData = nodeData.attachments[attachment.data.id];
            if (isAttachmentUploaded(attachmentData)) {
              attachmentData.deleting = true;
            } else {
              throw new Error('Cannot remove a temporary attachment');
            }
          }),
        );
      },
      attachmentRemoveFulfilled: ({ node, attachment }) => {
        set(
          nodesProduce((draft) => {
            const nodeData = draft.nodeData[node.id] as ProperData;
            delete nodeData.attachments[attachment.data.id];
          }),
        );
      },
      attachmentRemoveRejected: ({ node, attachment }, error) => {
        set(
          nodesProduce((draft) => {
            const nodeData = draft.nodeData[node.id] as ProperData;
            const attachmentData = nodeData.attachments[attachment.data.id];
            if (isAttachmentUploaded(attachmentData)) {
              attachmentData.deleting = false;
              attachmentData.error = error;
            } else {
              throw new Error('Cannot remove a temporary attachment');
            }
          }),
        );
      },
    };
  }
  extraHooks(store: NodesStoreFull): AttachmentsStorePluginConfig['extraHooks'] {
    return {
      useAttachmentsUpload() {
        const { langAsString, lang } = useLanguage();
        const appendDataElements = useLaxAppendDataElements();
        const upload = store.useSelector((state) => state.attachmentUpload);
        const uploadFinished = store.useSelector((state) => state.attachmentUploadFinished);

        const { mutateAsync: uploadAttachmentOld } = useAttachmentsUploadMutationOld();
        const { mutateAsync: uploadAttachment } = useAttachmentsUploadMutation();

        const applicationMetadata = useApplicationMetadata();
        const supportsNewAttatchmentAPI = appSupportsNewAttatchmentAPI(applicationMetadata);
        const backendFeatures = applicationMetadata.features ?? {};

        const setAttachmentsInDataModel = useSetAttachmentInDataModel();
        const { lock, unlock } = FD.useLocking('__attachment__upload__');

        return useCallback(
          async (action) => {
            const fullAction: AttachmentActionUpload = {
              ...action,
              files: action.files.map((file) => ({ temporaryId: uuidv4(), file })),
            };
            upload(fullAction);

            if (supportsNewAttatchmentAPI) {
              await lock();
              const results: AttachmentUploadResult[] = [];

              const updatedData: FDActionResult = { updatedDataModels: {}, updatedValidationIssues: {} };

              for (const { file, temporaryId } of fullAction.files) {
                await uploadAttachment({
                  dataTypeId: action.node.baseId,
                  file,
                })
                  .then((reply) => {
                    results.push({ temporaryId, newDataElementId: reply.newDataElementId });

                    updatedData.instance = reply.instance;
                    updatedData.updatedDataModels = {
                      ...updatedData.updatedDataModels,
                      ...dataModelPairsToObject(reply.newDataModels),
                    };
                    updatedData.updatedValidationIssues = {
                      ...updatedData.updatedValidationIssues,
                      ...backendValidationIssueGroupListToObject(reply.validationIssues),
                    };
                  })
                  .catch((error) => {
                    results.push({ temporaryId, error });
                  });
              }
              setAttachmentsInDataModel(
                results
                  .filter(({ newDataElementId }) => !!newDataElementId)
                  .map(({ newDataElementId }) => newDataElementId!),
                action.dataModelBindings,
              );
              uploadFinished(fullAction, results);
              unlock(updatedData);

              for (const { error } of results.filter(({ error }) => !!error)) {
                // TODO: Gather and Improve error message
                const reply = isAxiosError(error) ? error.response?.data : null;
                if (isDataPostError(reply)) {
                  const message = reply.uploadValidationIssues
                    .map((issue) => getValidationIssueMessage(issue))
                    .map(({ key, params }) => `- ${langAsString(key, params)}`)
                    .join('\n');
                  toast(message, { type: 'error' });
                } else {
                  toast(lang('form_filler.file_uploader_validation_error_upload'), { type: 'error' });
                }
              }
            } else {
              const results: AttachmentUploadResult[] = await Promise.all(
                fullAction.files.map(({ file, temporaryId }) =>
                  uploadAttachmentOld({ dataTypeId: action.node.baseId, file })
                    .then((data) => {
                      if (!data || !data.blobStoragePath) {
                        return { temporaryId, error: 'Failed to upload attachment' };
                      }
                      return { temporaryId, newDataElementId: data.id, newInstanceData: data };
                    })
                    .catch((error) => ({ temporaryId, error })),
                ),
              );
              setAttachmentsInDataModel(
                results
                  .filter(({ newDataElementId }) => !!newDataElementId)
                  .map(({ newDataElementId }) => newDataElementId!),
                action.dataModelBindings,
              );
              uploadFinished(fullAction, results);
              appendDataElements?.(
                results
                  .filter(({ newInstanceData }) => !!newInstanceData)
                  .map(({ newInstanceData }) => newInstanceData!),
              );

              for (const { error } of results.filter(({ error }) => !!error)) {
                if (
                  backendFeatures.jsonObjectInDataResponse &&
                  isAxiosError(error) &&
                  Array.isArray(error.response?.data)
                ) {
                  const validationIssues: BackendValidationIssue[] = error.response.data;
                  const message = validationIssues
                    .map((issue) => getValidationIssueMessage(issue))
                    .map(({ key, params }) => `- ${langAsString(key, params)}`)
                    .join('\n');
                  toast(message, { type: 'error' });
                } else {
                  toast(lang('form_filler.file_uploader_validation_error_upload'), { type: 'error' });
                }
              }
            }
          },
          [
            upload,
            supportsNewAttatchmentAPI,
            lock,
            setAttachmentsInDataModel,
            uploadFinished,
            unlock,
            uploadAttachment,
            langAsString,
            lang,
            appendDataElements,
            uploadAttachmentOld,
            backendFeatures.jsonObjectInDataResponse,
          ],
        );
      },
      useAttachmentsUpdate() {
        const { mutateAsync: removeTag } = useAttachmentsRemoveTagMutation();
        const { mutateAsync: addTag } = useAttachmentsAddTagMutation();
        const mutateDataElement = useLaxMutateDataElement();
        const { lang } = useLanguage();
        const update = store.useSelector((state) => state.attachmentUpdate);
        const fulfill = store.useSelector((state) => state.attachmentUpdateFulfilled);
        const reject = store.useSelector((state) => state.attachmentUpdateRejected);

        return useCallback(
          async (action: AttachmentActionUpdate) => {
            const { tags, attachment } = action;
            const tagToAdd = tags.filter((t) => !attachment.data.tags?.includes(t));
            const tagToRemove = attachment.data.tags?.filter((t) => !tags.includes(t)) || [];
            const areEqual = tagToAdd.length && tagToRemove.length && tagToAdd[0] === tagToRemove[0];

            // If there are no tags to add or remove, or if the tags are the same, do nothing.
            if ((!tagToAdd.length && !tagToRemove.length) || areEqual) {
              return;
            }

            update(action);
            try {
              if (tagToAdd.length) {
                await Promise.all(tagToAdd.map((tag) => addTag({ dataGuid: attachment.data.id, tagToAdd: tag })));
              }
              if (tagToRemove.length) {
                await Promise.all(
                  tagToRemove.map((tag) => removeTag({ dataGuid: attachment.data.id, tagToRemove: tag })),
                );
              }
              fulfill(action);
              mutateDataElement?.(attachment.data.id, (dataElement) => ({ ...dataElement, tags }));
            } catch (error) {
              reject(action, error);
              toast(lang('form_filler.file_uploader_validation_error_update'), { type: 'error' });
            }
          },
          [addTag, mutateDataElement, fulfill, lang, reject, removeTag, update],
        );
      },
      useAttachmentsRemove() {
        const { mutateAsync: removeAttachment } = useAttachmentsRemoveMutation();
        const removeDataElement = useLaxRemoveDataElement();
        const { lang } = useLanguage();
        const remove = store.useSelector((state) => state.attachmentRemove);
        const fulfill = store.useSelector((state) => state.attachmentRemoveFulfilled);
        const reject = store.useSelector((state) => state.attachmentRemoveRejected);
        const setLeafValue = FD.useSetLeafValue();
        const removeValueFromList = FD.useRemoveValueFromList();

        return useCallback(
          async (action: AttachmentActionRemove) => {
            remove(action);
            try {
              await removeAttachment(action.attachment.data.id);
              if (action.dataModelBindings && 'list' in action.dataModelBindings) {
                removeValueFromList({
                  reference: action.dataModelBindings.list,
                  value: action.attachment.data.id,
                });
              } else if (action.dataModelBindings && 'simpleBinding' in action.dataModelBindings) {
                setLeafValue({
                  reference: action.dataModelBindings.simpleBinding,
                  newValue: undefined,
                });
              }

              fulfill(action);
              removeDataElement?.(action.attachment.data.id);

              return true;
            } catch (error) {
              reject(action, error);
              toast(lang('form_filler.file_uploader_validation_error_delete'), { type: 'error' });
              return false;
            }
          },
          [removeDataElement, fulfill, lang, reject, remove, removeAttachment, removeValueFromList, setLeafValue],
        );
      },
      useAttachments(node) {
        return store.useSelector((state) => {
          if (!node) {
            return emptyArray;
          }

          const nodeData = state.nodeData[node.id];
          if (nodeData && 'attachments' in nodeData) {
            return Object.values(nodeData.attachments).sort(sortAttachmentsByName);
          }

          return emptyArray;
        });
      },
      useAttachmentsSelector() {
        return store.useDelayedSelector({
          mode: 'simple',
          selector: (node: LayoutNode) => (state) => {
            const nodeData = state.nodeData[node.id];
            if (!nodeData) {
              return emptyArray;
            }
            if (nodeData && 'attachments' in nodeData) {
              return Object.values(nodeData.attachments).sort(sortAttachmentsByName);
            }
            return emptyArray;
          },
        }) satisfies AttachmentsSelector;
      },
      useWaitUntilUploaded() {
        const zustandStore = store.useStore();
        const waitFor = useWaitForState<IData | false, NodesContext>(zustandStore);

        return useCallback(
          (node, attachment) =>
            waitFor((state, setReturnValue) => {
              const nodeData = state.nodeData[node.id];
              if (!nodeData || !('attachments' in nodeData) || !('attachmentsFailedToUpload' in nodeData)) {
                setReturnValue(false);
                return true;
              }
              const stillUploading = nodeData.attachments[attachment.data.temporaryId];
              if (stillUploading) {
                return false;
              }
              const errorMessage = nodeData.attachmentsFailedToUpload[attachment.data.temporaryId];
              if (errorMessage !== undefined) {
                setReturnValue(false);
                return true;
              }

              const uploaded = Object.values(nodeData.attachments).find(
                (a) => isAttachmentUploaded(a) && a.temporaryId === attachment.data.temporaryId,
              ) as UploadedAttachment | undefined;
              if (uploaded) {
                setReturnValue(uploaded.data);
                return true;
              }

              throw new Error('Given attachment not found in node');
            }),
          [waitFor],
        );
      },
      useHasPendingAttachments() {
        const out = store.useLaxSelector((state) => {
          for (const id of Object.keys(state.nodeData)) {
            const nodeData = state.nodeData[id];
            if (!nodeData || !('attachments' in nodeData)) {
              continue;
            }

            const attachments = Object.values(nodeData.attachments);
            if (attachments.some((a) => !a.uploaded || a.updating || a.deleting)) {
              return true;
            }
          }
          return false;
        });

        return out === ContextNotProvided ? false : out;
      },
      useAllAttachments() {
        return store.useMemoSelector((state) => {
          const map: IAttachmentsMap = {};
          for (const id of Object.keys(state.nodeData)) {
            const nodeData = state.nodeData[id];
            if (!nodeData || !('attachments' in nodeData)) {
              continue;
            }

            map[id] = Object.values(nodeData.attachments);
          }

          return map;
        });
      },
    };
  }
}

function useSetAttachmentInDataModel() {
  const setLeafValue = FD.useSetLeafValue();
  const appendToListUnique = FD.useAppendToListUnique();
  const debounce = FD.useDebounceImmediately();

  return useCallback(
    (attachmentIds: string[], dataModelBindings: IDataModelBindingsSimple | IDataModelBindingsList | undefined) => {
      if (dataModelBindings && 'list' in dataModelBindings) {
        for (const attachmentId of attachmentIds) {
          appendToListUnique({
            reference: dataModelBindings.list,
            newValue: attachmentId,
          });
        }
        debounce();
      } else if (dataModelBindings && 'simpleBinding' in dataModelBindings) {
        for (const attachmentId of attachmentIds) {
          setLeafValue({
            reference: dataModelBindings.simpleBinding,
            newValue: attachmentId,
          });
        }
        debounce();
      }
    },
    [appendToListUnique, debounce, setLeafValue],
  );
}

interface AttachmentUploadVariables {
  dataTypeId: string;
  file: File;
}

function useAttachmentsUploadMutationOld() {
  const { doAttachmentUploadOld } = useAppMutations();
  const instanceId = useLaxInstanceId();

  const options: UseMutationOptions<IData, AxiosError, AttachmentUploadVariables> = {
    mutationFn: ({ dataTypeId, file }) => {
      if (!instanceId) {
        throw new Error('Missing instanceId, cannot upload attachment');
      }

      return doAttachmentUploadOld(instanceId, dataTypeId, file);
    },
    onError: (error: AxiosError) => {
      window.logError('Failed to upload attachment:\n', error.message);
    },
  };

  return useMutation(options);
}

export function useAttachmentsUploadMutation() {
  const { doAttachmentUpload } = useAppMutations();
  const instanceId = useLaxInstanceId();
  const language = useCurrentLanguage();

  const options: UseMutationOptions<DataPostResponse, AxiosError, AttachmentUploadVariables> = {
    mutationFn: ({ dataTypeId, file }) => {
      if (!instanceId) {
        throw new Error('Missing instanceId, cannot upload attachment');
      }

      return doAttachmentUpload(instanceId, dataTypeId, language, file);
    },
    onError: (error: AxiosError) => {
      if (!isDataPostError(error.response?.data)) {
        window.logError('Failed to upload attachment:\n', error.message);
      }
    },
  };

  return useMutation(options);
}

function useAttachmentsAddTagMutation() {
  const { doAttachmentAddTag } = useAppMutations();
  const instanceId = useLaxInstanceId();

  return useMutation({
    mutationFn: ({ dataGuid, tagToAdd }: { dataGuid: string; tagToAdd: string }) => {
      if (!instanceId) {
        throw new Error('Missing instanceId, cannot add attachment');
      }

      return doAttachmentAddTag(instanceId, dataGuid, tagToAdd);
    },
    onError: (error: AxiosError) => {
      window.logError('Failed to add tag to attachment:\n', error);
    },
  });
}

function useAttachmentsRemoveTagMutation() {
  const { doAttachmentRemoveTag } = useAppMutations();
  const instanceId = useLaxInstanceId();

  return useMutation({
    mutationFn: ({ dataGuid, tagToRemove }: { dataGuid: string; tagToRemove: string }) => {
      if (!instanceId) {
        throw new Error('Missing instanceId, cannot remove attachment');
      }

      return doAttachmentRemoveTag(instanceId, dataGuid, tagToRemove);
    },
    onError: (error: AxiosError) => {
      window.logError('Failed to remove tag from attachment:\n', error);
    },
  });
}

function useAttachmentsRemoveMutation() {
  const { doAttachmentRemove } = useAppMutations();
  const instanceId = useLaxInstanceId();
  const language = useCurrentLanguage();

  return useMutation({
    mutationFn: (dataGuid: string) => {
      if (!instanceId) {
        throw new Error('Missing instanceId, cannot remove attachment');
      }

      return doAttachmentRemove(instanceId, dataGuid, language);
    },
    onError: (error: AxiosError) => {
      window.logError('Failed to delete attachment:\n', error);
    },
  });
}

export function appSupportsNewAttatchmentAPI({ altinnNugetVersion }: ApplicationMetadata) {
  return !altinnNugetVersion || isAtLeastVersion({ actualVersion: altinnNugetVersion, minimumVersion: '8.5.0.153' });
}
