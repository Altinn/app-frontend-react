import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import cn from 'classnames';

import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { PDFView } from 'src/features/pdf/PDFView';
import classes from 'src/features/pdf/PDFView.module.css';
import { useQueryKey } from 'src/features/routing/AppRoutingContext';

export function PDFWrapper({ children }: PropsWithChildren) {
  const previewPDF = useDevToolsStore((state) => state.pdfPreview);
  const setPdfPreview = useDevToolsStore((state) => state.actions.setPdfPreview);
  const renderInstead = useQueryKey('pdf') === '1';

  useEffect(() => {
    if (previewPDF) {
      waitForPrint().then((success) => {
        if (success) {
          window.print();
        } else {
          window.logWarn('PDF preview timed out');
        }
        setPdfPreview(false);
      });
    }
  }, [previewPDF, setPdfPreview]);

  if (renderInstead) {
    return <PDFView />;
  }

  return (
    <>
      <div className={cn({ [classes.hideInPrint]: previewPDF })}>{children}</div>
      {previewPDF && (
        <div className={classes.onlyInPrint}>
          <PDFView />
        </div>
      )}
    </>
  );
}

async function waitForPrint(timeOut = 5000): Promise<boolean> {
  const start = performance.now();
  while (document.querySelector('#pdfView #readyForPrint') === null) {
    if (performance.now() - start > timeOut) {
      return false;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return true;
}
