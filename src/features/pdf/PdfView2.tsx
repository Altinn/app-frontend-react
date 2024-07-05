import React from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { OrganisationLogo } from 'src/components/presentation/OrganisationLogo/OrganisationLogo';
import { ReadyForPrint } from 'src/components/ReadyForPrint';
import { useAppName, useAppOwner } from 'src/core/texts/appTexts';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsPayment } from 'src/features/payment/utils';
import classes from 'src/features/pdf/PDFView.module.css';
import { usePdfFormatQuery } from 'src/features/pdf/usePdfFormatQuery';
import { usePageOrder } from 'src/hooks/useNavigatePage';
import { InstanceInformation } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { ComponentSummary } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import type { IPdfFormat } from 'src/features/pdf/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const PDFView2 = () => {
  const order = usePageOrder();
  const { data: pdfSettings, isFetching: pdfFormatIsLoading } = usePdfFormatQuery(true);
  const pdfLayoutName = useLayoutSettings().pages.pdfLayoutName;
  const enableOrgLogo = Boolean(useApplicationMetadata().logo);
  const appOwner = useAppOwner();
  const appName = useAppName();
  const { langAsString } = useLanguage();
  const pagesToRender = pdfLayoutName ? [pdfLayoutName] : order;
  const isPayment = useIsPayment();
  const isHiddenPage = Hidden.useIsHiddenPageSelector();

  if (pdfFormatIsLoading) {
    return null;
  }

  return (
    <div
      id={'pdfView'}
      className={classes['pdf-wrapper']}
    >
      {appOwner && <span role='doc-subtitle'>{appOwner}</span>}

      <ConditionalWrapper
        condition={enableOrgLogo}
        wrapper={(children) => (
          <div className={classes.paymentTitleContainer}>
            {children} <OrganisationLogo></OrganisationLogo>
          </div>
        )}
      >
        <Heading
          level={1}
          size={'lg'}
        >
          {isPayment ? `${appName} - ${langAsString('payment.receipt.title')}` : appName}
        </Heading>
      </ConditionalWrapper>
      <InstanceInformation
        elements={{
          dateSent: true,
          sender: true,
          receiver: true,
          referenceNumber: true,
        }}
      />

      {pagesToRender
        ?.filter((pageKey) => (!pdfLayoutName ? pageKey : pageKey === pdfLayoutName))
        .filter((pageKey) => !isHiddenPage(pageKey))
        .filter((pageKey) => !pdfSettings?.excludedPages.includes(pageKey))
        .map((pageKey) => (
          <PdfForPage
            key={pageKey}
            pageKey={pageKey}
            pdfSettings={pdfSettings}
          />
        ))}
      <ReadyForPrint />
    </div>
  );
};

function PdfForPage({ pageKey, pdfSettings }: { pageKey: string; pdfSettings: IPdfFormat | undefined }) {
  const nodeDataSelector = NodesInternal.useNodeDataSelector();
  const children = useNodeTraversal((t) => {
    const page = t.findPage(pageKey);
    return page
      ? t
          .with(page)
          .children()
          .filter((node) => !pdfSettings?.excludedComponents.includes(node.id))
          .filter((node) => node.def.shouldRenderInAutomaticPDF(node as any, nodeDataSelector))
      : [];
  });

  return (
    <div className={classes.page}>
      {children.map((node) => (
        <PdfForNode
          key={node.id}
          node={node}
        />
      ))}
    </div>
  );
}

function PdfForNode({ node }: { node: LayoutNode }) {
  if (node.def.renderSummary2) {
    return (
      <ComponentSummary
        key={node.id}
        componentNode={node}
      />
    );
  }

  return (
    <SummaryComponent
      key={node.id}
      summaryNode={node as LayoutNode<'Summary'>}
      overrides={{
        display: { hideChangeButton: true, hideValidationMessages: true },
      }}
    />
  );
}