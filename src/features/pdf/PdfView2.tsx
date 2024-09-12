import React from 'react';
import type { PropsWithChildren } from 'react';

import { Heading } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { OrganisationLogo } from 'src/components/presentation/OrganisationLogo/OrganisationLogo';
import { ReadyForPrint } from 'src/components/ReadyForPrint';
import { TaskStoreProvider, useTaskStore } from 'src/core/contexts/taskStoreContext';
import { useAppName, useAppOwner } from 'src/core/texts/appTexts';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { FormProvider } from 'src/features/form/FormContext';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { useLayoutSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsPayment } from 'src/features/payment/utils';
import classes from 'src/features/pdf/PDFView.module.css';
import { usePdfFormatQuery } from 'src/features/pdf/usePdfFormatQuery';
import { getFeature } from 'src/features/toggles';
import { usePageOrder } from 'src/hooks/useNavigatePage';
import { GenericComponent } from 'src/layout/GenericComponent';
import { InstanceInformation } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import { useDoOverrideSummary } from 'src/layout/Subform/SubformWrapper';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { ComponentSummary } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { LayoutSetSummary } from 'src/layout/Summary2/SummaryComponent2/LayoutSetSummary';
import { SummaryComponent2 } from 'src/layout/Summary2/SummaryComponent2/SummaryComponent2';
import { Hidden, NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import type { IPdfFormat } from 'src/features/pdf/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export const PDFView2 = () => {
  const order = usePageOrder();
  const { data: pdfSettings, isFetching: pdfFormatIsLoading } = usePdfFormatQuery(true);
  const pdfLayoutName = useLayoutSettings().pages.pdfLayoutName;
  const isHiddenPage = Hidden.useIsHiddenPageSelector();

  if (pdfFormatIsLoading) {
    return null;
  }

  if (pdfLayoutName) {
    // Render all components directly if given a separate PDF layout
    return (
      <PdfWrapping>
        <PlainPage pageKey={pdfLayoutName} />
      </PdfWrapping>
    );
  }

  return (
    <PdfWrapping>
      <div className={classes.instanceInfo}>
        <InstanceInformation
          elements={{
            dateSent: true,
            sender: true,
            receiver: true,
            referenceNumber: true,
          }}
        />
      </div>

      {order
        ?.filter((pageKey) => !isHiddenPage(pageKey))
        .filter((pageKey) => !pdfSettings?.excludedPages.includes(pageKey))
        .map((pageKey) => (
          <PdfForPage
            key={pageKey}
            pageKey={pageKey}
            pdfSettings={pdfSettings}
          />
        ))}

      <SubformPDF />
    </PdfWrapping>
  );
};

function PdfWrapping({ children }: PropsWithChildren) {
  const enableOrgLogo = Boolean(useApplicationMetadata().logoOptions);
  const appOwner = useAppOwner();
  const appName = useAppName();
  const { langAsString } = useLanguage();
  const isPayment = useIsPayment();

  return (
    <div
      id={'pdfView'}
      className={classes.pdfWrapper}
    >
      {appOwner && <span role='doc-subtitle'>{appOwner}</span>}

      <ConditionalWrapper
        condition={enableOrgLogo}
        wrapper={(children) => (
          <div
            className={classes.paymentTitleContainer}
            data-testid={'pdf-logo'}
          >
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
      {children}
      <ReadyForPrint />
    </div>
  );
}

function PlainPage({ pageKey }: { pageKey: string }) {
  const children = useNodeTraversal((t) => {
    const page = t.findPage(pageKey);
    return page ? t.with(page).children() : [];
  });

  return (
    <div className={classes.page}>
      <Grid
        container={true}
        spacing={6}
        alignItems='flex-start'
      >
        {children.map((node) => (
          <GenericComponent
            key={node.id}
            node={node}
          />
        ))}
      </Grid>
    </div>
  );
}

export const DoSummaryWrapper = ({
  dataElementId,
  layoutSet,
  dataType,
  children,
}: PropsWithChildren<{ dataElementId: string; layoutSet: string; dataType: string }>) => {
  const isDone = useDoOverrideSummary(dataElementId, layoutSet, dataType);
  if (!isDone) {
    return null;
  }
  return <FormProvider>{children}</FormProvider>;
};

export const SummarySubformWrapper = ({ node, children }: PropsWithChildren<{ node: LayoutNode<'Subform'> }>) => {
  const {
    id,
    layoutSet,
    textResourceBindings,
    tableColumns = [],
    showAddButton = true,
    showDeleteButton = true,
  } = useNodeItem(node);

  const instanceData = useStrictInstanceData();

  const dataType = useDataTypeFromLayoutSet(layoutSet);
  const dataElements = instanceData.data.filter((d) => d.dataType === dataType) ?? [];

  const dataElementId = `${dataElements[0]?.id}`;

  console.log('node', node);
  console.log('dataElements[0]?.id', dataElements[0]?.id);
  // const isDone = useDoOverride(node, dataElementId);

  const overriddenTaskId = useTaskStore((state) => state.overriddenTaskId);
  const overriddenDataModelType = useTaskStore((state) => state.overriddenDataModelType);
  const overriddenDataModelUuid = useTaskStore((state) => state.overriddenDataModelUuid);

  // console.log('dataType', dataType);
  //
  // console.log('instanceData', instanceData);
  //
  // console.log('dataElements', dataElements);

  // 1. Finne alle subform komponenter OK
  // 2. For hver subform komponent:
  //        a For hver innsendfte subform instance:
  //    a. Hente layoutsettet som subform komponenten referer til OK
  //    b. Finne ut hvilken datamodell subformen trenger OK
  //    c. Finne alle dataElements som matcher dataTypen
  //    d. Laste dataen vi trenger
  //    e. Override datamodellType, datamodellUUid, layoutsetId
  //    f. Rendre form context
  // 3.

  // if (!isDone) {
  //   return (
  //     <div style={{ backgroundColor: 'pink' }}>
  //       <pre>{JSON.stringify({ overriddenTaskId, overriddenDataModelType, overriddenDataModelUuid }, null, 2)}</pre>
  //       {/*<pre>{JSON.stringify(dataElements, null, 2)}</pre>*/}
  //       {/*not done {layoutSet} {dataElements[0]?.id}*/}
  //     </div>
  //   );
  // }

  return (
    <div style={{ border: '1px solid gray' }}>
      {/*<ul>*/}
      {/*  <li>done</li>*/}
      {/*  <li>layoutSet {layoutSet}</li>*/}
      {/*  <li>id: {dataElements[0]?.id}</li>*/}
      {/*  <li>dataType: {dataElements[0]?.dataType}</li>*/}
      {/*</ul>*/}

      {/*{ dataElements.map }*/}
      {/*<LayoutSetSummary></LayoutSetSummary>*/}
      {/*<ul>*/}
      {/*  {dataElements.map((element) => (*/}
      {/*    <li key={element.id}>{element.id}</li>*/}
      {/*  ))}*/}
      {/*</ul>*/}

      {/*<pre>{JSON.stringify(dataElements, null, 2)}</pre>*/}

      {dataElements?.map((element, idx) => (
        <DoSummaryWrapper
          key={idx}
          dataElementId={element.id}
          layoutSet={layoutSet}
          dataType={element.dataType}
        >
          <div style={{ border: '1px solid lightgray' }}>
            <LayoutSetSummary />
          </div>
        </DoSummaryWrapper>
      ))}
      {/*{dataElements?.map((element) => (*/}
      {/*  <DoSummaryWrapper*/}
      {/*    key={element.id}*/}
      {/*    dataElementId={element.id}*/}
      {/*    layoutSet={layoutSet}*/}
      {/*    dataType={element.dataType}*/}
      {/*  >*/}
      {/*    <PageSummary pageId={'Side1'} />*/}
      {/*  </DoSummaryWrapper>*/}
      {/*))}*/}

      {/*<LayoutSetSummary pageKey={layoutSet} />*/}
      {/*<PresentationComponent type={ProcessTaskType.Data}>{children}</PresentationComponent>*/}
    </div>
  );
};

function SubformPDF() {
  // const isHiddenSelector = Hidden.useIsHiddenSelector();
  // const nodeDataSelector = NodesInternal.useNodeDataSelector();
  const children = useNodeTraversal((t) => t.allNodes().filter((node) => node.isType('Subform')));
  // const dataType = useDataTypeFromLayoutSet(layoutSet);
  console.log('children', children);

  return (
    <div>
      {children.map((child, idx) => (
        <TaskStoreProvider key={idx}>
          <SummarySubformWrapper node={child} />
        </TaskStoreProvider>
      ))}
    </div>
  );

  // return (
  //   <TaskStoreProvider>
  //     <ul>
  //       {children.map((child, idx) => {
  //         console.log('child', child);
  //         return (
  //           <SummarySubformWrapper
  //             key={idx}
  //             node={child}
  //           ></SummarySubformWrapper>
  //         );
  //       })}
  //     </ul>
  //   </TaskStoreProvider>
  // );

  // return (
  //   <TaskStoreProvider>
  //     {children.map((child, idx) => (
  //       <SummarySubformWrapper
  //         node={child}
  //         key={idx}
  //       >
  //         <LayoutSetSummary pageKey={child.pageKey} />
  //       </SummarySubformWrapper>
  //     ))}
  //   </TaskStoreProvider>
  // );

  // return (
  //   <div className={classes.page}>
  //     <h2>Subform kjeme her:::</h2>
  //     <Grid
  //       container={true}
  //       spacing={6}
  //       alignItems='flex-start'
  //     >
  //       {children.map((node) => {
  //         console.log('subform node', node);
  //
  //         // return (
  //         //   <PageSummary
  //         //     key={node.id}
  //         //     pageId={node.page.pageKey}
  //         //   ></PageSummary>
  //         // );
  //
  //         // node.
  //         return (
  //           <PdfForNode
  //             key={node.id}
  //             node={node}
  //           />
  //         );
  //       })}
  //     </Grid>
  //   </div>
  // );
}

function PdfForPage({ pageKey, pdfSettings }: { pageKey: string; pdfSettings: IPdfFormat | undefined }) {
  const isHiddenSelector = Hidden.useIsHiddenSelector();
  const nodeDataSelector = NodesInternal.useNodeDataSelector();
  const children = useNodeTraversal((t) => {
    const page = t.findPage(pageKey);
    return page
      ? t
          .with(page)
          .children()
          .filter((node) => !node.isType('Subform'))
          .filter((node) => !isHiddenSelector(node))
          .filter((node) => !pdfSettings?.excludedComponents.includes(node.id))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((node) => node.def.shouldRenderInAutomaticPDF(node as any, nodeDataSelector))
      : [];
  });

  return (
    <div className={classes.page}>
      <Grid
        container={true}
        spacing={6}
        alignItems='flex-start'
      >
        {children.map((node) => (
          <PdfForNode
            key={node.id}
            node={node}
          />
        ))}
      </Grid>
    </div>
  );
}

function PdfForNode({ node }: { node: LayoutNode }) {
  const target = useNodeItem(node, (i) => (i.type === 'Summary2' ? i.target : undefined));
  if (node.isType('Summary2') && target?.taskId) {
    return (
      <SummaryComponent2
        key={node.id}
        summaryNode={node}
      />
    );
  }

  const betaEnabled = getFeature('betaPDFenabled');
  if (betaEnabled.value && node.def.renderSummary2) {
    return <ComponentSummary componentNode={node} />;
  }

  return (
    <SummaryComponent
      summaryNode={undefined}
      overrides={{
        targetNode: node,
        largeGroup: node.isType('Group'),
        display: {
          hideChangeButton: true,
          hideValidationMessages: true,
        },
      }}
    />
  );
}
