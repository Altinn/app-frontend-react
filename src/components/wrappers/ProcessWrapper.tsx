import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';

import cn from 'classnames';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { Form } from 'src/components/form/Form';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import classes from 'src/components/wrappers/ProcessWrapper.module.css';
import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useLaxProcessData, useTaskType } from 'src/features/instance/ProcessContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { PDFView } from 'src/features/pdf/PDFView';
import { Confirm } from 'src/features/processEnd/confirm/containers/Confirm';
import { Feedback } from 'src/features/processEnd/feedback/Feedback';
import { ReceiptContainer } from 'src/features/receipt/ReceiptContainer';
import { useApplicationMetadata } from 'src/hooks/queries/useApplicationMetadataQuery';
import { useApiErrorCheck } from 'src/hooks/useApiErrorCheck';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { selectAppName, selectAppOwner } from 'src/selectors/language';

export interface IProcessWrapperProps {
  isFetching?: boolean;
}

export function ProcessWrapperWrapper({ isFetching }: { isFetching: boolean }) {
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
        element={<ProcessWrapper isFetching={isFetching} />}
      />
    </Routes>
  );
}

export const ProcessWrapper = ({ isFetching }: IProcessWrapperProps) => {
  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);
  const { isFetching: isInstanceDataFetching } = useStrictInstance();
  const { hasApiErrors } = useApiErrorCheck();
  const { taskId, currentPageId, isValidPageId, startUrl } = useNavigatePage();
  const { scrollPosition } = usePageNavigationContext();
  const { partyId, instanceGuid } = useNavigatePage();
  const taskType = useTaskType(taskId);
  const applicationMetadataId = useApplicationMetadata()?.data?.id;
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const renderPDF = searchParams.get('pdf') === '1';
  const previewPDF = useAppSelector((state) => state.devTools.pdfPreview);

  useEffect(() => {
    if (currentPageId !== undefined && scrollPosition === undefined) {
      window.scrollTo({ top: 0 });
    }
  }, [currentPageId, scrollPosition]);

  const loadingReason = isFetching === true ? 'fetching' : isInstanceDataFetching ? 'fetching-instance' : undefined;
  if (hasApiErrors) {
    return <UnknownError />;
  }
  if (renderPDF) {
    if (loadingReason) {
      return null;
    }
    return (
      <PDFView
        appName={appName as string}
        appOwner={appOwner}
      />
    );
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
        <PresentationComponent
          header={appName}
          appOwner={appOwner}
          type={taskType}
        >
          <>
            {!loadingReason && (
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
            )}
            {loadingReason && (
              <div style={{ marginTop: '1.5625rem' }}>
                <AltinnContentLoader
                  width='100%'
                  height={700}
                  reason={`process-wrapper-${loadingReason}`}
                >
                  <AltinnContentIconFormData />
                </AltinnContentLoader>
              </div>
            )}
          </>
        </PresentationComponent>
      </div>
      {previewPDF && !loadingReason && (
        <div className={cn(classes['content'], classes['hide-pdf'])}>
          <PDFView
            appName={appName as string}
            appOwner={appOwner}
          />
        </div>
      )}
    </>
  );
};
