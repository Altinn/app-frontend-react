import { put, race, select, take } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';

import { AttachmentActions } from 'src/features/attachments/attachmentSlice';
import { FormDynamicsActions } from 'src/features/dynamics/formDynamicsSlice';
import { FormDataActions } from 'src/features/formData/formDataSlice';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import {
  selectAttachmentState,
  selectFormData,
  selectFormLayoutState,
  selectOptions,
  selectValidations,
} from 'src/features/layout/update/updateFormLayoutSagas';
import { OptionsActions } from 'src/features/options/optionsSlice';
import { ValidationActions } from 'src/features/validation/validationSlice';
import { shiftAttachmentRowInRepeatingGroup } from 'src/utils/attachment';
import { findChildAttachments, removeGroupData } from 'src/utils/databindings';
import { findChildren, removeRepeatingGroupFromUIConfig, splitDashedKey } from 'src/utils/formLayout';
import { removeGroupOptionsByIndex } from 'src/utils/options';
import { removeGroupValidationsByIndex } from 'src/utils/validation/validation';
import type { IAttachmentState } from 'src/features/attachments';
import type {
  IDeleteAttachmentActionFulfilled,
  IDeleteAttachmentActionRejected,
} from 'src/features/attachments/delete/deleteAttachmentActions';
import type { IFormDataState } from 'src/features/formData';
import type { ILayoutState } from 'src/features/layout/formLayoutSlice';
import type { IUpdateRepeatingGroups } from 'src/features/layout/formLayoutTypes';
import type { ILayoutGroup } from 'src/layout/Group/types';
import type { IOptions, IRepeatingGroups, IValidations } from 'src/types';

export function* updateRepeatingGroupsSaga({
  payload: { layoutElementId, remove, index },
}: PayloadAction<IUpdateRepeatingGroups>): SagaIterator {
  try {
    const formLayoutState: ILayoutState = yield select(selectFormLayoutState);
    const repeatingGroups = formLayoutState.uiConfig.repeatingGroups;
    if (!repeatingGroups) {
      throw new Error('Repeating groups not set');
    }
    const layouts = formLayoutState.layouts;
    if (!layouts) {
      throw new Error('Layouts not set');
    }
    const currentLayout = layouts[formLayoutState.uiConfig.currentView];
    if (!currentLayout) {
      throw new Error('Current layout not set');
    }

    const currentIndex = repeatingGroups[layoutElementId]?.index ?? -1;
    const newIndex = remove ? currentIndex - 1 : currentIndex + 1;
    let updatedRepeatingGroups: IRepeatingGroups = {
      ...repeatingGroups,
      [layoutElementId]: {
        ...repeatingGroups[layoutElementId],
        index: newIndex,
      },
    };

    const groupContainer = currentLayout.find((element) => element.id === layoutElementId) as ILayoutGroup | undefined;

    const children = groupContainer?.children || [];
    const childGroups = currentLayout.filter((element) => {
      if (element.type !== 'Group') {
        return false;
      }

      if (groupContainer?.edit?.multiPage) {
        return children.find((c) => c.split(':')[1] === element.id);
      }

      return children?.indexOf(element.id) > -1;
    });

    childGroups?.forEach((group) => {
      if (remove && typeof index === 'number') {
        updatedRepeatingGroups = removeRepeatingGroupFromUIConfig(updatedRepeatingGroups, group.id, index, true);
      } else {
        const groupId = `${group.id}-${newIndex}`;
        updatedRepeatingGroups[groupId] = {
          index: -1,
          baseGroupId: group.id,
          dataModelBinding: group.dataModelBindings?.group,
          editIndex: -1,
          multiPageIndex: -1,
        };
      }
    });

    if (remove && typeof index === 'number') {
      const formDataState: IFormDataState = yield select(selectFormData);
      const attachments: IAttachmentState = yield select(selectAttachmentState);
      const validations: IValidations = yield select(selectValidations);
      const options: IOptions = yield select(selectOptions);
      const repeatingGroup = repeatingGroups[layoutElementId];

      // Find uploaded attachments inside group and delete them
      const childAttachments = findChildAttachments(
        formDataState.formData,
        attachments.attachments,
        currentLayout,
        layoutElementId,
        repeatingGroup,
        index,
      );

      let attachmentRemovalSuccessful = true;
      for (const { attachment, component, componentId } of childAttachments) {
        yield put(
          AttachmentActions.deleteAttachment({
            attachment,
            attachmentType: component.id,
            componentId,

            // Deleting attachment, but deliberately avoiding passing the dataModelBindings to avoid removing the formData
            // references. We're doing that ourselves here later, and having other sagas compete for it will cause race
            // conditions and lots of useless requests.
            dataModelBindings: {},
          }),
        );

        while (true) {
          const completion: {
            fulfilled?: PayloadAction<IDeleteAttachmentActionFulfilled>;
            rejected?: PayloadAction<IDeleteAttachmentActionRejected>;
          } = yield race({
            fulfilled: take(AttachmentActions.deleteAttachmentFulfilled),
            rejected: take(AttachmentActions.deleteAttachmentRejected),
          });
          const attachmentId = completion.fulfilled?.payload.attachmentId || completion.rejected?.payload.attachment.id;
          if (attachmentId !== attachment.id) {
            // Some other attachment elsewhere had its event complete, we'll ignore it
            continue;
          }
          if (completion.rejected) {
            attachmentRemovalSuccessful = false;
          }
          break;
        }
      }

      if (attachmentRemovalSuccessful) {
        const attachments: IAttachmentState = yield select(selectAttachmentState);
        const splitLayoutElementId = splitDashedKey(layoutElementId);
        const childFileUploaders = findChildren(currentLayout, {
          matching: (c) => c.type === 'FileUpload' || c.type === 'FileUploadWithTag',
          rootGroupId: splitLayoutElementId.baseComponentId,
        });
        const updatedAttachments = shiftAttachmentRowInRepeatingGroup(
          attachments.attachments,
          childFileUploaders,
          layoutElementId,
          index,
        );

        // Remove the form data associated with the group
        const updatedFormData = removeGroupData(
          formDataState.formData,
          index,
          currentLayout,
          layoutElementId,
          repeatingGroup,
        );

        // Remove the validations associated with the group
        const updatedValidations = removeGroupValidationsByIndex(
          layoutElementId,
          index,
          formLayoutState.uiConfig.currentView,
          layouts,
          repeatingGroups,
          validations,
        );
        yield put(
          ValidationActions.updateValidations({
            validations: updatedValidations,
          }),
        );

        // Remove options associated with the group
        const updatedOptions = removeGroupOptionsByIndex({
          groupId: layoutElementId,
          index,
          repeatingGroups,
          options,
          layout: currentLayout,
        });
        yield put(OptionsActions.setOptions({ options: updatedOptions }));

        updatedRepeatingGroups[layoutElementId].deletingIndex = updatedRepeatingGroups[
          layoutElementId
        ].deletingIndex?.filter((value) => value !== index);
        updatedRepeatingGroups[layoutElementId].editIndex = -1;

        yield put(
          FormLayoutActions.updateRepeatingGroupsFulfilled({
            repeatingGroups: updatedRepeatingGroups,
          }),
        );
        yield put(FormDataActions.setFulfilled({ formData: updatedFormData }));
        yield put(
          AttachmentActions.mapAttachmentsFulfilled({
            attachments: updatedAttachments,
          }),
        );
        yield put(FormDataActions.saveEvery({}));
      } else {
        yield put(
          FormLayoutActions.updateRepeatingGroupsRemoveCancelled({
            layoutElementId,
            index,
          }),
        );
      }
    } else {
      updatedRepeatingGroups[layoutElementId].editIndex = index;
      yield put(
        FormLayoutActions.updateRepeatingGroupsFulfilled({
          repeatingGroups: updatedRepeatingGroups,
        }),
      );
    }

    yield put(FormDynamicsActions.checkIfConditionalRulesShouldRun({}));
  } catch (error) {
    yield put(FormLayoutActions.updateRepeatingGroupsRejected({ error }));
  }
}
