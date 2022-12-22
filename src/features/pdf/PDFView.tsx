import React from 'react';

import { useAppSelector } from 'src/common/hooks';
import AutomaticPDFLayout from 'src/features/pdf/AutomaticPDFLayout';
import CustomPDFLayout from 'src/features/pdf/CustomPDFLayout';
import css from 'src/features/pdf/PDFView.module.css';
import { ReadyForPrint } from 'src/shared/components/ReadyForPrint';
import { getInstanceContextSelector } from 'src/utils/instanceContext';
import { nodesInLayout, nodesInLayouts } from 'src/utils/layout/hierarchy';
import type { ContextDataSources } from 'src/features/expressions/ExprContext';
import type { IInstanceContext } from 'src/types/shared';

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
  const optionsLoading = useAppSelector((state) => state.optionState.loading);
  const dataListLoading = useAppSelector((state) => state.dataListState.loading);
  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const instanceContextSelector = getInstanceContextSelector();
  const instanceContext: IInstanceContext = useAppSelector(instanceContextSelector);
  const applicationSettings = useAppSelector((state) => state.applicationSettings?.applicationSettings);
  const formData = useAppSelector((state) => state.formData?.formData);
  const hiddenFields = useAppSelector((state) => state.formLayout.uiConfig.hiddenFields);

  if (
    optionsLoading ||
    dataListLoading ||
    !layouts ||
    !excludePageFromPdf ||
    !excludeComponentFromPdf ||
    !pageOrder ||
    !hiddenPages ||
    !repeatingGroups ||
    !instanceContext ||
    !applicationSettings ||
    !formData ||
    !hiddenFields
  ) {
    return null;
  }

  const pdfLayout = pdfLayoutName ? layouts[pdfLayoutName] : undefined;

  const nodes =
    typeof pdfLayout !== 'undefined'
      ? nodesInLayout(pdfLayout, repeatingGroups)
      : nodesInLayouts(layouts, '__pdf__', repeatingGroups);

  const dataSources: ContextDataSources = {
    instanceContext,
    applicationSettings,
    formData,
    hiddenFields: new Set(hiddenFields),
  };

  document.body.style.backgroundColor = 'white';
  return (
    <div className={css['pdf-wrapper']}>
      <h1>{appName}</h1>
      {typeof pdfLayout !== 'undefined' ? (
        <CustomPDFLayout
          layout={pdfLayout}
          nodes={nodes}
          dataSources={dataSources}
        />
      ) : (
        <AutomaticPDFLayout
          excludeComponentFromPdf={excludeComponentFromPdf}
          excludePageFromPdf={excludePageFromPdf}
          hiddenPages={hiddenPages}
          layouts={layouts}
          pageOrder={pageOrder}
          nodes={nodes}
          dataSources={dataSources}
        />
      )}
      <ReadyForPrint />
    </div>
  );
};

export default PDFView;
