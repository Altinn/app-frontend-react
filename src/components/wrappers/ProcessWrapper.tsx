import React from 'react';
import { Route, Routes, useSearchParams } from 'react-router-dom';

import cn from 'classnames';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { Form } from 'src/components/form/Form';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import classes from 'src/components/wrappers/ProcessWrapper.module.css';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useTaskType } from 'src/features/instance/ProcessContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { PDFView } from 'src/features/pdf/PDFView';
import { ProcessEndWrapper } from 'src/features/processEnd/ProcessEndWrapper';
import { useApiErrorCheck } from 'src/hooks/useApiErrorCheck';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { ProcessTaskType } from 'src/types';

export interface IProcessWrapperProps {
  isFetching?: boolean;
}

export function ProcessWrapperWrapper({ isFetching }: { isFetching: boolean }) {
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
  const { taskId } = useNavigatePage();
  const taskType = useTaskType(taskId);

  const [searchParams] = useSearchParams();
  const renderPDF = searchParams.get('pdf') === '1';
  const previewPDF = useAppSelector((state) => state.devTools.pdfPreview);

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

  // TODO: Create an process end wrapper which contains both Feedback and Receipt.
  // Then the user can navigate between the two states confirmation and Archived.
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
              <>
                {taskType === ProcessTaskType.Data && <Form />}
                {taskType !== ProcessTaskType.Data && <ProcessEndWrapper />}
              </>
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
