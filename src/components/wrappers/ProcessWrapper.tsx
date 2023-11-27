import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';

import cn from 'classnames';

import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/presentation/Presentation';
import classes from 'src/components/wrappers/ProcessWrapper.module.css';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { useLaxProcessData, useTaskType } from 'src/features/instance/ProcessContext';
import { PDFView } from 'src/features/pdf/PDFView';
import { Confirm } from 'src/features/processEnd/confirm/containers/Confirm';
import { Feedback } from 'src/features/processEnd/feedback/Feedback';
import { ReceiptContainer } from 'src/features/receipt/ReceiptContainer';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useNavigatePage } from 'src/hooks/useNavigatePage';

export function ProcessWrapperWrapper() {
  const { taskId } = useNavigatePage();
  const location = useLocation();
  const currentTaskId = useLaxProcessData()?.currentTask?.elementId;
  if (taskId === undefined) {
    return (
      <Navigate
        to={`${location.pathname}/${currentTaskId}`}
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
  const { taskId, currentPageId, isValidPageId, startUrl } = useNavigatePage();
  const { scrollPosition } = usePageNavigationContext();
  const { partyId, instanceGuid } = useNavigatePage();
  const taskType = useTaskType(taskId);
  const applicationMetadataId = useApplicationMetadata()?.id;
  const location = useLocation();

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
  if (!currentPageId || !isValidPageId(currentPageId)) {
    return (
      <Navigate
        to={startUrl}
        replace
      />
    );
  }

  return (
    <>
      <div className={cn(classes['content'], { [classes['hide-form']]: previewPDF })}>
        <PresentationComponent type={taskType}>
          <Routes>
            <Route
              path='confirmation'
              element={<Confirm />}
            />
            <Route
              path='feedback'
              element={<Feedback />}
            />
            <Route
              path='receipt'
              element={<ReceiptContainer />}
            />
            <Route
              path=':pageKey'
              element={<Form />}
            />
          </Routes>
        </PresentationComponent>
      </div>
      {previewPDF && (
        <div className={cn(classes['content'], classes['hide-pdf'])}>
          <PDFView />
        </div>
      )}
    </>
  );
};
