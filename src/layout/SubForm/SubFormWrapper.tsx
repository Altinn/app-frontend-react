import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { FormPage } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import { useTaskStore } from 'src/core/contexts/taskStoreContext';
import { FormProvider } from 'src/features/form/FormContext';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { ProcessTaskType } from 'src/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const SubFormWrapper = ({ node, children }: PropsWithChildren<{ node: LayoutNode<'SubForm'> }>) => {
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

export const SubFormFirstPage = () => {
  const order = useLayoutSettings().pages.order;
  const firstPage = order[0];
  return <Navigate to={firstPage} />;
};

export const RedirectBackToMainForm = () => {
  const { currentPageId, navigateToPage } = useNavigatePage();

  useEffect(() => {
    navigateToPage(currentPageId);
  }, [navigateToPage, currentPageId]);

  return null;
};

export const SubFormForm = () => {
  const { subFormPage } = useParams();
  return <FormPage currentPageId={subFormPage} />;
};

const useDoOverride = (node: LayoutNode<'SubForm'>) => {
  const { dataElementId } = useParams();
  const setOverriddenLayoutSetId = useTaskStore((state) => state.setOverriddenLayoutSetId);
  const setOverriddenDataModelType = useTaskStore((state) => state.setOverriddenDataModelType);
  const setOverriddenDataModelUuid = useTaskStore((state) => state.setOverriddenDataModelUuid);
  const isDone = useTaskStore(
    (s) =>
      s.overriddenDataModelType === node.item.dataType &&
      s.overriddenDataModelUuid === dataElementId &&
      s.overriddenLayoutSetId === node.item.layoutSet,
  );

  useEffect(() => {
    setOverriddenLayoutSetId?.(node.item.layoutSet);
    setOverriddenDataModelType?.(node.item.dataType);
    setOverriddenDataModelUuid?.(dataElementId!);
  }, [
    dataElementId,
    node.item.dataType,
    node.item.layoutSet,
    setOverriddenDataModelType,
    setOverriddenDataModelUuid,
    setOverriddenLayoutSetId,
  ]);

  return isDone;
};
