import React, { Fragment, type PropsWithChildren } from 'react';

import { Heading, Paragraph } from '@digdir/designsystemet-react';

import { Flex } from 'src/app-components/Flex/Flex';
import { Label, LabelInner } from 'src/components/label/Label';
import { TaskOverrides } from 'src/core/contexts/TaskOverrides';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { DynamicFormProvider, StaticFormProvider } from 'src/features/form/FormContext';
import { useDataTypeFromLayoutSet, useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { useInstanceDataElements } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/Subform/Summary/SubformSummaryComponent2.module.css';
import { SubformSummaryTable } from 'src/layout/Subform/Summary/SubformSummaryTable';
import { getSubformEntryDisplayName } from 'src/layout/Subform/utils';
import classes_singlevaluesummary from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary.module.css';
import { SummaryContains, SummaryFlex } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { LayoutSetSummary } from 'src/layout/Summary2/SummaryComponent2/LayoutSetSummary';
import { useSummaryOverrides } from 'src/layout/Summary2/summaryStoreContext';
import { useExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import { typedBoolean } from 'src/utils/typing';
import type { ExprVal, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { CompInternal } from 'src/layout/layout';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { IData } from 'src/types/shared';

const SummarySubformWrapperInner = ({
  targetBaseComponentId,
}: PropsWithChildren<{ targetBaseComponentId: string }>) => {
  const { layoutSet, id, textResourceBindings, entryDisplayName } = useItemWhenType(targetBaseComponentId, 'Subform');
  const dataType = useDataTypeFromLayoutSet(layoutSet);
  const dataElements = useInstanceDataElements(dataType);

  const item = useItemWhenType(targetBaseComponentId, 'Subform');

  if (dataElements.length === 0) {
    return (
      <>
        <div className={classes.pageBreak} />
        <Label
          baseComponentId={targetBaseComponentId}
          id={`subform-summary2-${id}`}
          renderLabelAs='span'
          weight='regular'
          textResourceBindings={{ title: textResourceBindings?.title }}
          className={classes.summaryLabelMargin}
        />
        <Paragraph asChild>
          <span className={classes.emptyField}>
            <Lang id='general.empty_summary' />
          </span>
        </Paragraph>
      </>
    );
  }

  return (
    <TaskOverrides
      dataModelType={dataType}
      layoutSetId={layoutSet}
    >
      <StaticFormProvider>
        {dataElements.map((element) => (
          <Fragment key={element.id}>
            <div className={classes.pageBreak} />
            <DoSummaryWrapper
              dataElement={element}
              item={item}
              entryDisplayName={entryDisplayName}
              title={textResourceBindings?.title}
            />
          </Fragment>
        ))}
      </StaticFormProvider>
    </TaskOverrides>
  );
};

export const SummarySubformWrapper = React.memo(SummarySubformWrapperInner);
SummarySubformWrapper.displayName = 'SummarySubformWrapper';

const DoSummaryWrapper = ({
  dataElement,
  entryDisplayName,
  title,
  item,
}: React.PropsWithChildren<{
  dataElement: IData;
  entryDisplayName?: ExprValToActualOrExpr<ExprVal.String>;
  title: string | undefined;
  item: CompInternal<'Subform'>;
}>) => (
  <div className={classes.summaryWrapperMargin}>
    <TaskOverrides dataModelElementId={dataElement.id}>
      <DynamicFormProvider readOnly={true}>
        <Flex
          container
          spacing={6}
          alignItems='flex-start'
        >
          <Flex item>
            <div className={classes_singlevaluesummary.labelValueWrapper}>
              <LabelInner
                item={item}
                baseComponentId={item.id}
                id={`subform-summary2-${dataElement.id}`}
                renderLabelAs='span'
                weight='regular'
                textResourceBindings={{ title }}
              />
              <SubformHeading
                entryDisplayName={entryDisplayName}
                id={item.id}
              />
            </div>
          </Flex>
          <LayoutSetSummary />
        </Flex>
      </DynamicFormProvider>
    </TaskOverrides>
  </div>
);

function SubformHeading({
  entryDisplayName,
  id,
}: {
  entryDisplayName?: ExprValToActualOrExpr<ExprVal.String>;
  id: string;
}) {
  const dataSources = useExpressionDataSources(entryDisplayName);
  const subformEntryName = entryDisplayName ? getSubformEntryDisplayName(entryDisplayName, dataSources, id) : null;

  if (subformEntryName) {
    return (
      <Heading
        className='no-visual-testing'
        data-size='sm'
        level={2}
      >
        {subformEntryName}
      </Heading>
    );
  }
  return null;
}

export function AllSubformSummaryComponent2() {
  const lookups = useLayoutLookups();
  const allIds = Object.values(lookups.topLevelComponents)
    .flat()
    .filter((id) => (id ? lookups.allComponents[id]?.type === 'Subform' : false))
    .filter(typedBoolean);

  return (
    <>
      {allIds.map((childId, idx) => (
        <SummarySubformWrapper
          key={idx}
          targetBaseComponentId={childId}
        />
      ))}
    </>
  );
}

export function SubformSummaryComponent2({ targetBaseComponentId }: Summary2Props) {
  const displayType = useSummaryOverrides<'Subform'>(targetBaseComponentId)?.display;
  const { layoutSet } = useItemWhenType(targetBaseComponentId, 'Subform');
  const dataType = useDataTypeFromLayoutSet(layoutSet);
  const dataElements = useInstanceDataElements(dataType);
  const minCount = useApplicationMetadata().dataTypes.find((dt) => dt.id === dataType)?.minCount;
  const hasElements = !!(dataType && dataElements.length > 0);
  const required =
    useItemWhenType(targetBaseComponentId, 'Subform').required || (minCount !== undefined && minCount > 0);

  const inner =
    displayType === 'table' ? (
      <SubformSummaryTable targetBaseComponentId={targetBaseComponentId} />
    ) : (
      <SummarySubformWrapper targetBaseComponentId={targetBaseComponentId} />
    );

  return (
    <SummaryFlex
      targetBaseId={targetBaseComponentId}
      content={
        hasElements
          ? SummaryContains.SomeUserContent
          : required
            ? SummaryContains.EmptyValueRequired
            : SummaryContains.EmptyValueNotRequired
      }
    >
      {inner}
    </SummaryFlex>
  );
}
