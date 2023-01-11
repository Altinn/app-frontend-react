import React from 'react';

import cn from 'classnames';

import type { IPdfFormat } from '.';

import { useAppSelector } from 'src/common/hooks';
import AutomaticPDFLayout from 'src/features/pdf/AutomaticPDFLayout';
import CustomPDFLayout from 'src/features/pdf/CustomPDFLayout';
import css from 'src/features/pdf/PDFView.module.css';
import { ReadyForPrint } from 'src/shared/components/ReadyForPrint';
import { getCurrentTaskDataElementId } from 'src/utils/appMetadata';
import { get } from 'src/utils/network/networking';
import { getPdfFormatUrl } from 'src/utils/urls/appUrlHelper';

interface PDFViewProps {
  appName: string;
  appOwner?: string;
}

const PDFView = ({ appName, appOwner }: PDFViewProps) => {
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const layoutSets = useAppSelector((state) => state.formLayout.layoutsets);
  const excludedPages = useAppSelector((state) => state.formLayout.uiConfig.excludePageFromPdf);
  const excludedComponents = useAppSelector((state) => state.formLayout.uiConfig.excludeComponentFromPdf);
  const pageOrder = useAppSelector((state) => state.formLayout.uiConfig.tracks.order);
  const hidden = useAppSelector((state) => state.formLayout.uiConfig.tracks.hidden);
  const pdfLayoutName = useAppSelector((state) => state.formLayout.uiConfig.pdfLayoutName);
  const optionsLoading = useAppSelector((state) => state.optionState.loading);
  const dataListLoading = useAppSelector((state) => state.dataListState.loading);
  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const applicationSettings = useAppSelector((state) => state.applicationSettings.applicationSettings);
  const applicationMetadata = useAppSelector((state) => state.applicationMetadata.applicationMetadata);
  const formData = useAppSelector((state) => state.formData.formData);
  const hiddenFields = useAppSelector((state) => state.formLayout.uiConfig.hiddenFields);
  const parties = useAppSelector((state) => state.party.parties);
  const language = useAppSelector((state) => state.language.language);
  const textResources = useAppSelector((state) => state.textResources.resources);
  const instance = useAppSelector((state) => state.instanceData.instance);
  const allOrgs = useAppSelector((state) => state.organisationMetaData.allOrgs);
  const profile = useAppSelector((state) => state.profile.profile);

  // Custom pdf layout
  const pdfLayout = pdfLayoutName && layouts ? layouts[pdfLayoutName] : undefined;

  // Fetch PdfFormat from backend
  const [pdfFormat, setPdfFormat] = React.useState<IPdfFormat | null>(null);
  React.useEffect(() => {
    if (
      applicationMetadata &&
      instance &&
      layoutSets &&
      excludedPages &&
      excludedComponents &&
      pageOrder &&
      !pdfLayout
    ) {
      const dataGuid = getCurrentTaskDataElementId(applicationMetadata, instance, layoutSets);
      if (typeof dataGuid === 'string') {
        const url = getPdfFormatUrl(instance.id, dataGuid);
        get(url)
          .then((pdfFormat: IPdfFormat) => setPdfFormat(pdfFormat))
          .catch(() => setPdfFormat({ excludedPages, excludedComponents, pageOrder }));
      } else {
        setPdfFormat({ excludedPages, excludedComponents, pageOrder });
      }
    }
  }, [applicationMetadata, excludedComponents, excludedPages, instance, layoutSets, pageOrder, pdfLayout]);

  if (
    optionsLoading ||
    dataListLoading ||
    !layouts ||
    !hidden ||
    !repeatingGroups ||
    !applicationSettings ||
    !formData ||
    !hiddenFields ||
    !parties ||
    !language ||
    !textResources ||
    !allOrgs ||
    !profile ||
    (!pdfFormat && !pdfLayout)
  ) {
    return null;
  }

  document.body.style.backgroundColor = 'white';
  return (
    <div className={css['pdf-wrapper']}>
      <h1 className={cn({ [css['title-margin']]: !appOwner })}>{appName}</h1>
      {appOwner && (
        <p
          role='doc-subtitle'
          className={css['title-margin']}
        >
          {appOwner}
        </p>
      )}
      {typeof pdfLayout !== 'undefined' ? (
        <CustomPDFLayout layout={pdfLayout} />
      ) : (
        <AutomaticPDFLayout
          pdfFormat={pdfFormat as IPdfFormat}
          hidden={hidden}
          layouts={layouts}
        />
      )}
      <ReadyForPrint />
    </div>
  );
};

export default PDFView;
