import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, Routes } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';

import { Button } from 'src/app-components/Button/Button';
import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import classes from 'src/components/wrappers/ProcessWrapper.module.css';
import { Loader } from 'src/core/loading/Loader';
import { useAppName, useAppOwner } from 'src/core/texts/appTexts';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useCurrentDataModelGuid } from 'src/features/datamodel/useBindingSchema';
import { FormProvider } from 'src/features/form/FormContext';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useGetTaskTypeById, useLaxProcessData, useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { ProcessNavigationProvider } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { PDFWrapper } from 'src/features/pdf/PDFWrapper';
import { Confirm } from 'src/features/processEnd/confirm/containers/Confirm';
import { Feedback } from 'src/features/processEnd/feedback/Feedback';
import { ReceiptContainer } from 'src/features/receipt/ReceiptContainer';
import {
  useNavigate,
  useNavigationParam,
  useNavigationPath,
  useQueryKeysAsString,
} from 'src/features/routing/AppRoutingContext';
import {
  TaskKeys,
  useIsCurrentTask,
  useIsValidTaskId,
  useNavigateToTask,
  useStartUrl,
} from 'src/hooks/useNavigatePage';
import { RedirectBackToMainForm } from 'src/layout/Subform/SubformWrapper';
import { ProcessTaskType } from 'src/types';
import { behavesLikeDataTask } from 'src/utils/formLayout';
import { getPageTitle } from 'src/utils/getPageTitle';
import { useNode } from 'src/utils/layout/NodesContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface NavigationErrorProps {
  label: string;
}

function NavigationError({ label }: NavigationErrorProps) {
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const navigateToTask = useNavigateToTask();

  const appName = useAppName();
  const appOwner = useAppOwner();
  const { langAsString } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{`${getPageTitle(appName, langAsString(label), appOwner)}`}</title>
      </Helmet>
      <Grid
        item={true}
        xs={12}
        aria-live='polite'
      >
        <div>
          <Lang id={label} />
        </div>

        {currentTaskId && (
          <div className={classes.navigationError}>
            <Button
              variant='secondary'
              size='md'
              onClick={() => {
                navigateToTask(currentTaskId);
              }}
            >
              <Lang id='general.navigate_to_current_process' />
            </Button>
          </div>
        )}
      </Grid>
    </>
  );
}

export function NotCurrentTaskPage() {
  return <NavigationError label='general.part_of_form_completed' />;
}

export function InvalidTaskIdPage() {
  return <NavigationError label='general.invalid_task_id' />;
}

export function NavigateToStartUrl() {
  const navigate = useNavigate();
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const startUrl = useStartUrl(currentTaskId);

  const currentLocation = `${useNavigationPath()}${useQueryKeysAsString()}`;

  useEffect(() => {
    if (currentLocation !== startUrl) {
      navigate(startUrl, { replace: true });
    }
  }, [currentLocation, navigate, startUrl]);

  return <Loader reason='navigate-to-process-start' />;
}

export const ProcessWrapper = () => {
  const isCurrentTask = useIsCurrentTask();
  const isValidTaskId = useIsValidTaskId();
  const taskIdParam = useNavigationParam('taskId');
  const taskType = useGetTaskTypeById()(taskIdParam);
  const realTaskType = useRealTaskType();
  const layoutSets = useLayoutSets();
  const dataModelGuid = useCurrentDataModelGuid();

  const hasCustomReceipt = behavesLikeDataTask(TaskKeys.CustomReceipt, layoutSets);
  const customReceiptDataModelNotFound = hasCustomReceipt && !dataModelGuid && taskIdParam === TaskKeys.CustomReceipt;

  if (!isValidTaskId(taskIdParam)) {
    return (
      <PresentationComponent type={realTaskType}>
        <InvalidTaskIdPage />
      </PresentationComponent>
    );
  }

  if (!isCurrentTask && taskType !== ProcessTaskType.Archived) {
    return (
      <PresentationComponent type={realTaskType}>
        <NotCurrentTaskPage />
      </PresentationComponent>
    );
  }

  if (taskType === ProcessTaskType.Confirm) {
    return (
      <ProcessNavigationProvider>
        <PresentationComponent type={realTaskType}>
          <Confirm />
        </PresentationComponent>
      </ProcessNavigationProvider>
    );
  }

  if (taskType === ProcessTaskType.Feedback) {
    return (
      <PresentationComponent type={realTaskType}>
        <Feedback />
      </PresentationComponent>
    );
  }

  if (taskType === ProcessTaskType.Archived) {
    return (
      <PresentationComponent type={realTaskType}>
        <ReceiptContainer />
      </PresentationComponent>
    );
  }

  if (taskType === ProcessTaskType.Data) {
    if (customReceiptDataModelNotFound) {
      window.logWarnOnce(
        'You specified a custom receipt, but the data model is missing. Falling back to default receipt.',
      );
      return (
        <PresentationComponent type={realTaskType}>
          <ReceiptContainer />
        </PresentationComponent>
      );
    }

    return (
      <FormProvider>
        <Routes>
          <Route
            path=':pageKey/:componentId/*'
            element={
              <PresentationComponent type={realTaskType}>
                <ComponentRouting />
              </PresentationComponent>
            }
          />
          <Route
            path='*'
            element={
              <PDFWrapper>
                <PresentationComponent type={realTaskType}>
                  <Form />
                </PresentationComponent>
              </PDFWrapper>
            }
          />
        </Routes>
      </FormProvider>
    );
  }

  throw new Error(`Unknown task type: ${taskType}`);
};

export const ComponentRouting = () => {
  const componentId = useNavigationParam('componentId');
  const node = useNode(componentId);

  // Wait for props to sync, needed for now
  if (!componentId) {
    return <Loader reason='component-routing' />;
  }

  if (!node) {
    // Consider adding a 404 page?
    return <RedirectBackToMainForm />;
  }

  function isSubroutingNode(node: LayoutNode): node is LayoutNode<'Subform'> {
    return node.type === 'Subform' && !!node.def.subRouting;
  }

  if (isSubroutingNode(node)) {
    const SubRouting = node.def.subRouting;

    return (
      <SubRouting
        key={node.id}
        node={node}
      />
    );
  }

  // If node exists but does not implement sub routing
  throw new Error(`Component ${componentId} does not have subRouting`);
};

function useRealTaskType() {
  const taskId = useLaxProcessData()?.currentTask?.elementId;
  const isStateless = useApplicationMetadata().isStatelessApp;
  const layoutSets = useLayoutSets();
  const processData = useLaxProcessData();
  const altinnTaskType = useTaskTypeFromBackend();

  if (isStateless || behavesLikeDataTask(taskId, layoutSets)) {
    // Stateless apps only have data tasks. As soon as they start creating an instance from that stateless step,
    // applicationMetadata.isStatelessApp will return false and we'll proceed as normal.
    return ProcessTaskType.Data;
  }

  if (processData?.ended) {
    return ProcessTaskType.Archived;
  }

  return altinnTaskType;
}
