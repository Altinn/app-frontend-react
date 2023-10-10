import React from 'react';
import { useSearchParams } from 'react-router-dom';

import cn from 'classnames';
import type { AxiosError } from 'axios';

import { AltinnContentIconFormData } from 'src/components/atoms/AltinnContentIconFormData';
import { Form } from 'src/components/form/Form';
import { AltinnContentLoader } from 'src/components/molecules/AltinnContentLoader';
import { PresentationComponent } from 'src/components/wrappers/Presentation';
import classes from 'src/components/wrappers/ProcessWrapper.module.css';
import { Confirm } from 'src/features/confirm/containers/Confirm';
import { Feedback } from 'src/features/feedback/Feedback';
import { useStrictInstance } from 'src/features/instance/InstanceContext';
import { useRealTaskType } from 'src/features/instance/useProcess';
import { ForbiddenError } from 'src/features/instantiate/containers/ForbiddenError';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { useIsLoading } from 'src/features/isLoading/useIsLoading';
import { PDFView } from 'src/features/pdf/PDFView';
import { ReceiptContainer } from 'src/features/receipt/ReceiptContainer';
import { useApiErrorCheck } from 'src/hooks/useApiErrorCheck';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { selectAppName, selectAppOwner } from 'src/selectors/language';
import { ProcessTaskType } from 'src/types';
import { checkIfAxiosError, HttpStatusCodes } from 'src/utils/network/networking';

export interface IProcessWrapperProps {
  isFetching?: boolean;
}

export const ProcessWrapper = ({ isFetching }: IProcessWrapperProps) => {
  const { isFetching: isInstanceDataFetching } = useStrictInstance();
  const isLoadingData = useIsLoading();
  const isLoading = isLoadingData || isFetching === true || isInstanceDataFetching;
  const { hasApiErrors } = useApiErrorCheck();
  const appName = useAppSelector(selectAppName);
  const appOwner = useAppSelector(selectAppOwner);
  const { error: processError } = useStrictInstance().processNavigation;
  const taskType = useRealTaskType();

  const [searchParams] = useSearchParams();
  const renderPDF = searchParams.get('pdf') === '1';
  const previewPDF = useAppSelector((state) => state.devTools.pdfPreview);

  if (hasApiErrors || processError) {
    if (checkIfAxiosError(processError)) {
      const axiosError = processError as AxiosError;
      if (axiosError.status === HttpStatusCodes.Forbidden) {
        return <ForbiddenError />;
      }
    }
    return <UnknownError />;
  }

  if (renderPDF) {
    if (isLoading) {
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
        <PresentationComponent
          header={appName}
          appOwner={appOwner}
          type={taskType}
        >
          {!isLoading ? (
            <>
              {taskType === ProcessTaskType.Data ? (
                <Form />
              ) : taskType === ProcessTaskType.Confirm ? (
                <Confirm />
              ) : taskType === ProcessTaskType.Feedback ? (
                <Feedback />
              ) : taskType === ProcessTaskType.Archived ? (
                <ReceiptContainer />
              ) : null}
            </>
          ) : (
            <div style={{ marginTop: '1.5625rem' }}>
              <AltinnContentLoader
                width='100%'
                height={700}
              >
                <AltinnContentIconFormData />
              </AltinnContentLoader>
            </div>
          )}
        </PresentationComponent>
      </div>
      {previewPDF && !isLoading && (
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
