import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';

import { Button } from '@digdir/design-system-react';
import Grid from '@material-ui/core/Grid';
import cn from 'classnames';

import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import classes from 'src/components/wrappers/ProcessWrapper.module.css';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { LayoutValidationProvider } from 'src/features/devtools/layoutValidation/useLayoutValidation';
import { FormProvider } from 'src/features/form/FormContext';
import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { FormDataForInfoTaskProvider } from 'src/features/formData/FormDataReadOnly';
import { useLaxProcessData, useTaskType } from 'src/features/instance/ProcessContext';
import { Lang } from 'src/features/language/Lang';
import { PDFView } from 'src/features/pdf/PDFView';
import { Confirm } from 'src/features/processEnd/confirm/containers/Confirm';
import { Feedback } from 'src/features/processEnd/feedback/Feedback';
import { ReceiptContainer } from 'src/features/receipt/ReceiptContainer';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { PageKeys, TaskKeys, useNavigatePage, useNavigationParams } from 'src/hooks/useNavigatePage';

interface NavigationErrorProps {
  label: ReactNode;
}

function NavigationError({ label }: NavigationErrorProps) {
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  const { navigateToTask } = useNavigatePage();
  return (
    <Grid
      item={true}
      xs={12}
      aria-live='polite'
      className={classes.errorReport}
    >
      <div>{label}</div>
      <div className={classes.navigationError}>
        <Button
          variant='secondary'
          onClick={() => {
            navigateToTask(currentTaskId);
          }}
        >
          <Lang id='general.navigate_to_current_process' />
        </Button>
      </div>
    </Grid>
  );
}

export function NotCurrentTaskPage() {
  return <NavigationError label={<Lang id='general.part_of_form_completed' />} />;
}

export function InvalidTaskIdPage() {
  return <NavigationError label={<Lang id='general.invalid_task_id' />} />;
}

export function ProcessWrapperWrapper() {
  const { taskId, startUrl } = useNavigatePage();
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;

  if (taskId === undefined && currentTaskId !== undefined) {
    return (
      <Navigate
        to={`${startUrl}/${currentTaskId}`}
        replace
      />
    );
  }

  return (
    <Routes>
      <Route
        path=':taskId/*'
        element={<ProcessWrapper />}
      />
    </Routes>
  );
}

export const ProcessWrapper = () => {
  const { isValidPageId, isCurrentTask, isValidTaskId } = useNavigatePage();
  const { taskId, partyId, instanceGuid, pageKey } = useNavigationParams();
  const { scrollPosition } = usePageNavigationContext();
  const taskType = useTaskType(taskId);
  const applicationMetadataId = useApplicationMetadata()?.id;
  const location = useLocation();

  const currentPageId = pageKey ?? '';

  const [searchParams] = useSearchParams();
  const renderPDF = searchParams.get('pdf') === '1';
  const previewPDF = useAppSelector((state) => state.devTools.pdfPreview);

  useEffect(() => {
    if (currentPageId !== undefined && scrollPosition === undefined) {
      window.scrollTo({ top: 0 });
    }
  }, [currentPageId, scrollPosition]);

  if (renderPDF) {
    return <PDFView />;
  }

  const instanceId = `${partyId}/${instanceGuid}`;
  const currentViewCacheKey = instanceId || applicationMetadataId;

  /**
   * Redirects users that had a stored page in their local storage to the correct
   * page, and later removes this currentViewCacheKey from localstorage, as
   * it is no longer needed.
   */
  if (!currentPageId && !!currentViewCacheKey) {
    const lastVisitedPage = localStorage.getItem(currentViewCacheKey);
    if (lastVisitedPage !== null && isValidPageId(lastVisitedPage)) {
      localStorage.removeItem(currentViewCacheKey);
      return (
        <Navigate
          to={`${location.pathname}/${lastVisitedPage}`}
          replace
        />
      );
    }
  }

  if (!isValidTaskId(taskId)) {
    return (
      <PresentationComponent type={taskType}>
        <InvalidTaskIdPage />
      </PresentationComponent>
    );
  }

  if (!isCurrentTask && taskId !== TaskKeys.ProcessEnd) {
    return (
      <PresentationComponent type={taskType}>
        <NotCurrentTaskPage />
      </PresentationComponent>
    );
  }

  return (
    <>
      <div className={cn(classes['content'], { [classes['hide-form']]: previewPDF })}>
        <Routes>
          <Route
            path={PageKeys.Confirmation}
            element={
              <FormDataForInfoTaskProvider taskId={taskId}>
                <PresentationComponent type={taskType}>
                  <Confirm />
                </PresentationComponent>
              </FormDataForInfoTaskProvider>
            }
          />
          <Route
            path={PageKeys.Feedback}
            element={
              <FormDataForInfoTaskProvider taskId={taskId}>
                <PresentationComponent type={taskType}>
                  <Feedback />
                </PresentationComponent>
              </FormDataForInfoTaskProvider>
            }
          />
          <Route
            path={PageKeys.Receipt}
            element={
              <FormDataForInfoTaskProvider taskId={taskId}>
                <PresentationComponent type={taskType}>
                  <ReceiptContainer />
                </PresentationComponent>
              </FormDataForInfoTaskProvider>
            }
          />
          <Route
            path='*'
            element={
              <FormProvider>
                <LayoutValidationProvider>
                  <Routes>
                    <Route
                      path=':pageKey'
                      element={
                        <PresentationComponent type={taskType}>
                          <Form />
                        </PresentationComponent>
                      }
                    />
                    <Route
                      path='*'
                      // This will redirect to the first page of the form
                      element={
                        <PresentationComponent type={taskType}>
                          <Form />
                        </PresentationComponent>
                      }
                    />
                  </Routes>
                </LayoutValidationProvider>
              </FormProvider>
            }
          />
        </Routes>
      </div>
      {previewPDF && (
        <div className={cn(classes['content'], classes['hide-pdf'])}>
          <PDFView />
        </div>
      )}
    </>
  );
};
