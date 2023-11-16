import React from 'react';
import { useSearchParams } from 'react-router-dom';

import cn from 'classnames';

import { Form } from 'src/components/form/Form';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import classes from 'src/components/wrappers/ProcessWrapper.module.css';
import { Loader } from 'src/core/loading/Loader';
import { useAppName } from 'src/core/texts/appTexts';
import { Confirm } from 'src/features/confirm/containers/Confirm';
import { Feedback } from 'src/features/feedback/Feedback';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/ProcessContext';
import { PDFView } from 'src/features/pdf/PDFView';
import { ReceiptContainer } from 'src/features/receipt/ReceiptContainer';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { ProcessTaskType } from 'src/types';

export const ProcessWrapper = () => {
  const { isFetching: isInstanceDataFetching } = useStrictInstance();
  const appName = useAppName();
  const appOwner = useAppName();
  const taskType = useRealTaskType();

  const [searchParams] = useSearchParams();
  const renderPDF = searchParams.get('pdf') === '1';
  const previewPDF = useAppSelector((state) => state.devTools.pdfPreview);

  const loadingReason = isInstanceDataFetching ? 'fetching-instance' : undefined;

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

  return (
    <>
      <div
        className={cn(classes['content'], {
          [classes['hide-form']]: previewPDF,
        })}
      >
        {!loadingReason ? (
          <PresentationComponent
            header={appName}
            appOwner={appOwner}
            type={taskType}
          >
            {taskType === ProcessTaskType.Data ? (
              <Form />
            ) : taskType === ProcessTaskType.Confirm ? (
              <Confirm />
            ) : taskType === ProcessTaskType.Feedback ? (
              <Feedback />
            ) : taskType === ProcessTaskType.Archived ? (
              <ReceiptContainer />
            ) : null}
          </PresentationComponent>
        ) : (
          <Loader reason={`process-wrapper-${loadingReason}`} />
        )}
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
