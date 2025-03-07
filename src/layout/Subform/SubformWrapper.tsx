import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import { useTaskStore } from 'src/core/contexts/taskStoreContext';
import { Loader } from 'src/core/loading/Loader';
import { FormProvider } from 'src/features/form/FormContext';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useNavigateToPage } from 'src/features/navigation/useNavigatePage';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { ProcessTaskType } from 'src/types';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function SubformWrapper({ node, children }: PropsWithChildren<{ node: LayoutNode<'Subform'> }>) {
  const isDone = useDoOverride(node);

  if (!isDone) {
    return <Loader reason='subform-taskstore' />;
  }

  return <FormProvider>{children}</FormProvider>;
}

export function SubformForm() {
  return (
    <PresentationComponent type={ProcessTaskType.Data}>
      <Form />
    </PresentationComponent>
  );
}

export const RedirectBackToMainForm = () => {
  const mainPageKey = useNavigationParam('mainPageKey');
  const { mutate: navigateToPage } = useNavigateToPage();

  useEffect(() => {
    navigateToPage({ page: mainPageKey });
  }, [navigateToPage, mainPageKey]);

  return <Loader reason='navigate-to-mainform' />;
};

export const useDoOverrideSummary = (dataElementId: string, layoutSet: string, dataType: string) => {
  const setOverriddenLayoutSetId = useTaskStore((state) => state.setOverriddenLayoutSetId);
  const setOverriddenDataModelType = useTaskStore((state) => state.setOverriddenDataModelType);
  const setOverriddenDataModelUuid = useTaskStore((state) => state.setOverriddenDataModelUuid);

  const isDone = useTaskStore(
    (s) =>
      s.overriddenDataModelType === dataType &&
      s.overriddenDataModelUuid === dataElementId &&
      s.overriddenLayoutSetId === layoutSet,
  );

  useEffect(() => {
    setOverriddenLayoutSetId?.(layoutSet);
    setOverriddenDataModelType?.(dataType);
    setOverriddenDataModelUuid?.(dataElementId!);
  }, [
    dataElementId,
    dataType,
    layoutSet,
    setOverriddenDataModelType,
    setOverriddenDataModelUuid,
    setOverriddenLayoutSetId,
  ]);

  return isDone;
};

export const useDoOverride = (node: LayoutNode<'Subform'>, providedDataElementId?: string) => {
  const dataElementId = useNavigationParam('dataElementId');
  const actualDataElementId = providedDataElementId ? providedDataElementId : dataElementId;
  const { layoutSet, id } = useNodeItem(node);
  const dataType = useDataTypeFromLayoutSet(layoutSet);

  if (!dataType) {
    throw new Error(`Unable to find data type for subform with id ${id}`);
  }

  const setOverriddenLayoutSetId = useTaskStore((state) => state.setOverriddenLayoutSetId);
  const setOverriddenDataModelType = useTaskStore((state) => state.setOverriddenDataModelType);
  const setOverriddenDataModelUuid = useTaskStore((state) => state.setOverriddenDataModelUuid);
  const isDone = useTaskStore(
    (s) =>
      s.overriddenDataModelType === dataType &&
      s.overriddenDataModelUuid === actualDataElementId &&
      s.overriddenLayoutSetId === layoutSet,
  );

  useEffect(() => {
    setOverriddenLayoutSetId?.(layoutSet);
    setOverriddenDataModelType?.(dataType);
    setOverriddenDataModelUuid?.(actualDataElementId!);
  }, [
    actualDataElementId,
    dataType,
    layoutSet,
    setOverriddenDataModelType,
    setOverriddenDataModelUuid,
    setOverriddenLayoutSetId,
  ]);

  return isDone;
};
