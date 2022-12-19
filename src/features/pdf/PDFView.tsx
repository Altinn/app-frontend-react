import React from 'react';

import { useAppSelector } from 'src/common/hooks';
import AutomaticPDFLayout from 'src/features/pdf/AutomaticPDFLayout';
import CustomPDFLayout from 'src/features/pdf/CustomPDFLayout';
import css from 'src/features/pdf/PDFView.module.css';
import { ReadyForPrint } from 'src/shared/components/ReadyForPrint';

interface PDFViewProps {
  appName: string;
}

const PDFView = ({ appName }: PDFViewProps) => {
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const excludePageFromPdf = useAppSelector((state) => new Set(state.formLayout.uiConfig.excludePageFromPdf));
  const excludeComponentFromPdf = useAppSelector((state) => new Set(state.formLayout.uiConfig.excludeComponentFromPdf));
  const pageOrder = useAppSelector((state) => state.formLayout.uiConfig.tracks.order);
  const hiddenPages = useAppSelector((state) => new Set(state.formLayout.uiConfig.tracks.hidden));
  const pdfLayoutName = useAppSelector((state) => state.formLayout.uiConfig.pdfLayoutName);

  if (!layouts || !excludePageFromPdf || !excludeComponentFromPdf || !pageOrder || !hiddenPages) {
    return null;
  }

  const pdfLayout = pdfLayoutName ? layouts[pdfLayoutName] : undefined;

  document.body.style.backgroundColor = 'white';
  return (
    <div className={css['pdf-wrapper']}>
      <h1>{appName}</h1>
      {typeof pdfLayout !== 'undefined' ? (
        <CustomPDFLayout pdfLayout={pdfLayout} />
      ) : (
        <AutomaticPDFLayout
          excludeComponentFromPdf={excludeComponentFromPdf}
          excludePageFromPdf={excludePageFromPdf}
          hiddenPages={hiddenPages}
          layouts={layouts}
          pageOrder={pageOrder}
        />
      )}
      <ReadyForPrint />
    </div>
  );
};

export default PDFView;
