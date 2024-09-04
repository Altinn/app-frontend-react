import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { FormPage } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import { useTaskStore } from 'src/core/contexts/taskStoreContext';
import { FormProvider } from 'src/features/form/FormContext';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { ProcessTaskType } from 'src/types';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const SubformWrapper = ({ node, children }: PropsWithChildren<{ node: LayoutNode<'Subform'> }>) => {
  const isDone = useDoOverride(node);

  if (!isDone) {
    return null;
  }

  return (
    <FormProvider>
      <PresentationComponent type={ProcessTaskType.Data}>{children}</PresentationComponent>
    </FormProvider>
  );
};

export const SubformFirstPage = () => {
  const order = useLayoutSettings().pages.order;
  const firstPage = order[0];
  return <Navigate to={firstPage} />;
};

export const RedirectBackToMainForm = () => {
  const mainPageKey = useNavigationParam('mainPageKey');
  const { navigateToPage } = useNavigatePage();

  useEffect(() => {
    navigateToPage(mainPageKey);
  }, [navigateToPage, mainPageKey]);

  return null;
};

export const SubformForm = () => {
  const { subFormPage } = useParams();
  return <FormPage currentPageId={subFormPage} />;
};

const useDoOverride = (node: LayoutNode<'Subform'>) => {
  const { dataElementId } = useParams();
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
