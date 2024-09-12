import React, { useEffect, useState } from 'react';
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
      {/*{children}*/}
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
  const { subformPage } = useParams();
  return <FormPage currentPageId={subformPage} />;
};

export const useDoOverrideSummary = (dataElementId: string, layoutSet: string, dataType: string) => {
  const setOverriddenLayoutSetId = useTaskStore((state) => state.setOverriddenLayoutSetId);
  const setOverriddenDataModelType = useTaskStore((state) => state.setOverriddenDataModelType);
  const setOverriddenDataModelUuid = useTaskStore((state) => state.setOverriddenDataModelUuid);

  const { overriddenDataModelType, overriddenDataModelUuid, overriddenLayoutSetId } = useTaskStore((s) => ({
    overriddenDataModelType: s.overriddenDataModelType,
    overriddenDataModelUuid: s.overriddenDataModelUuid,
    overriddenLayoutSetId: s.overriddenLayoutSetId,
  }));

  const [isDone, setIsDone] = useState(false); // Use state for isDone

  useEffect(() => {
    setOverriddenLayoutSetId?.(layoutSet);
    setOverriddenDataModelType?.(dataType);
    setOverriddenDataModelUuid?.(dataElementId);
    // console.log('in effect');
    //
    // console.log('layoutSet', layoutSet);
    // console.log('dataType', dataType);
    // console.log('actualDataElementId', dataElementId);
    // console.log({ overriddenDataModelType, overriddenDataModelUuid, overriddenLayoutSetId });
    // debugger;
    // // Calculate isDone after state changes
    // const done =
    //   overriddenDataModelType === dataType &&
    //   overriddenDataModelUuid === dataElementId &&
    //   overriddenLayoutSetId === layoutSet;
    setIsDone(true); // Update state for isDone
  }, [
    dataElementId,
    dataType,
    layoutSet,
    overriddenDataModelType,
    overriddenDataModelUuid,
    overriddenLayoutSetId,
    setOverriddenDataModelType,
    setOverriddenDataModelUuid,
    setOverriddenLayoutSetId,
  ]);

  return isDone;
  // return true;
};

// export const useDoOverrideSummary = (dataElementId: string, layoutSet: string, dataType: string) => {
//   // const { dataElementId } = useParams();
//
//   // const actualDataElementId = providedDataElementId ? providedDataElementId : dataElementId;
//
//   // console.log('dataElementId in override', actualDataElementId);
//   // debugger;
//   // const { layoutSet, id } = useNodeItem(node);
//   // const dataType = useDataTypeFromLayoutSet(layoutSet);
//
//   const setOverriddenLayoutSetId = useTaskStore((state) => state.setOverriddenLayoutSetId);
//
//   // console.log('setOverriddenLayoutSetId', setOverriddenLayoutSetId);
//
//   const setOverriddenDataModelType = useTaskStore((state) => state.setOverriddenDataModelType);
//   const setOverriddenDataModelUuid = useTaskStore((state) => state.setOverriddenDataModelUuid);
//
//   const { overriddenDataModelType, overriddenDataModelUuid, overriddenLayoutSetId } = useTaskStore((s) => ({
//     overriddenDataModelType: s.overriddenDataModelType,
//     overriddenDataModelUuid: s.overriddenDataModelUuid,
//     overriddenLayoutSetId: s.overriddenLayoutSetId,
//   }));
//
//   const isDone =
//     overriddenDataModelType === dataType &&
//     overriddenDataModelUuid === dataElementId &&
//     overriddenLayoutSetId === layoutSet;
//
//   useEffect(() => {
//     setOverriddenLayoutSetId?.(layoutSet);
//     setOverriddenDataModelType?.(dataType);
//     setOverriddenDataModelUuid?.(dataElementId!);
//   }, [
//     dataElementId,
//     dataType,
//     layoutSet,
//     overriddenDataModelType,
//     overriddenDataModelUuid,
//     overriddenLayoutSetId,
//     setOverriddenDataModelType,
//     setOverriddenDataModelUuid,
//     setOverriddenLayoutSetId,
//   ]);
//
//   return isDone;
// };

export const useDoOverride = (node: LayoutNode<'Subform'>, providedDataElementId?: string) => {
  const { dataElementId } = useParams();

  const actualDataElementId = providedDataElementId ? providedDataElementId : dataElementId;

  // console.log('dataElementId in override', actualDataElementId);
  // debugger;
  const { layoutSet, id } = useNodeItem(node);
  const dataType = useDataTypeFromLayoutSet(layoutSet);
  if (!dataType) {
    throw new Error(`Unable to find data type for subform with id ${id}`);
  }
  const setOverriddenLayoutSetId = useTaskStore((state) => state.setOverriddenLayoutSetId);

  // console.log('setOverriddenLayoutSetId', setOverriddenLayoutSetId);

  const setOverriddenDataModelType = useTaskStore((state) => state.setOverriddenDataModelType);
  const setOverriddenDataModelUuid = useTaskStore((state) => state.setOverriddenDataModelUuid);

  const { overriddenDataModelType, overriddenDataModelUuid, overriddenLayoutSetId } = useTaskStore((s) => ({
    overriddenDataModelType: s.overriddenDataModelType,
    overriddenDataModelUuid: s.overriddenDataModelUuid,
    overriddenLayoutSetId: s.overriddenLayoutSetId,
  }));

  const isDone =
    overriddenDataModelType === dataType &&
    overriddenDataModelUuid === actualDataElementId &&
    overriddenLayoutSetId === layoutSet;

  useEffect(() => {
    setOverriddenLayoutSetId?.(layoutSet);
    setOverriddenDataModelType?.(dataType);
    setOverriddenDataModelUuid?.(actualDataElementId!);
  }, [
    actualDataElementId,
    dataType,
    layoutSet,
    overriddenDataModelType,
    overriddenDataModelUuid,
    overriddenLayoutSetId,
    setOverriddenDataModelType,
    setOverriddenDataModelUuid,
    setOverriddenLayoutSetId,
  ]);

  return isDone;
};
