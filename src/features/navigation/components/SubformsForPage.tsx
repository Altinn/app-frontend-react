import React, { useState } from 'react';

import { ChevronDownIcon } from '@navikt/aksel-icons';
import cn from 'classnames';

import { useIsProcessing } from 'src/core/contexts/processingContext';
import { ExprVal } from 'src/features/expressions/types';
import { useDataTypeFromLayoutSet, useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { useStrictDataElements } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/features/navigation/components/SubformsForPage.module.css';
import { isSubformValidation } from 'src/features/validation';
import { useComponentValidationsFor } from 'src/features/validation/selectors/componentValidationsForNode';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import {
  getSubformEntryDisplayName,
  useExpressionDataSourcesForSubform,
  useSubformFormData,
} from 'src/layout/Subform/utils';
import { useEvalExpression } from 'src/utils/layout/generator/useEvalExpression';
import { useExternalItem } from 'src/utils/layout/hooks';
import type { ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { IData } from 'src/types/shared';

export function SubformsForPage({ pageKey }: { pageKey: string }) {
  const lookups = useLayoutLookups();
  const subformIds = lookups.topLevelComponents[pageKey]?.filter((id) => lookups.allComponents[id]?.type === 'Subform');
  if (!subformIds?.length) {
    return null;
  }

  return subformIds.map((baseId) => (
    <SubformGroup
      key={baseId}
      baseId={baseId}
    />
  ));
}

function SubformGroup({ baseId }: { baseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pageKey = useLayoutLookups().componentToPage[baseId];
  if (!pageKey) {
    throw new Error(`Unable to find page for subform with id ${baseId}`);
  }

  const subformIdsWithError = useComponentValidationsFor(baseId).find(isSubformValidation)?.subformDataElementIds;
  const { layoutSet, textResourceBindings, entryDisplayName } = useExternalItem(baseId, 'Subform');
  const title = useEvalExpression(textResourceBindings?.title, {
    returnType: ExprVal.String,
    defaultValue: '',
    errorIntroText: `Invalid expression for Subform title in ${baseId}`,
  });
  const dataType = useDataTypeFromLayoutSet(layoutSet);
  if (!dataType) {
    throw new Error(`Unable to find data type for subform with id ${baseId}`);
  }
  const dataElements = useStrictDataElements(dataType);

  if (!dataElements.length || !entryDisplayName) {
    return null;
  }

  const buttonId = `navigation-button-${dataType}`;
  const listId = `navigation-subform-list-${dataType}`;

  return (
    <div className={classes.subformContainer}>
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-owns={listId}
        onClick={() => setIsOpen((o) => !o)}
        className={cn(classes.subformExpandButton, 'fds-focus')}
      >
        <span className={classes.subformGroupName}>
          <Lang id={title} />
          &nbsp;({dataElements.length})
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn(classes.subformExpandChevron, { [classes.subformExpandChevronOpen]: isOpen })}
        />
      </button>
      <ul
        id={listId}
        aria-labelledby={buttonId}
        style={!isOpen ? { display: 'none' } : undefined}
        className={cn(classes.subformList)}
      >
        {dataElements.map((dataElement) => (
          <SubformLink
            key={dataElement.id}
            page={pageKey}
            entryDisplayName={entryDisplayName}
            nodeId={baseId}
            dataElement={dataElement}
            hasErrors={Boolean(subformIdsWithError?.includes(dataElement.id))}
          />
        ))}
      </ul>
    </div>
  );
}

function SubformLink({
  page,
  entryDisplayName,
  nodeId,
  dataElement,
  hasErrors,
}: {
  page: string;
  entryDisplayName: ExprValToActualOrExpr<ExprVal.String>;
  nodeId: string;
  dataElement: IData;
  hasErrors: boolean;
}) {
  const { isAnyProcessing: disabled } = useIsProcessing();
  const { enterSubform } = useNavigatePage();
  const { isSubformDataFetching, subformData, subformDataError } = useSubformFormData(dataElement.id);
  const subformDataSources = useExpressionDataSourcesForSubform(dataElement.dataType, subformData, entryDisplayName);

  const subformEntryName =
    !isSubformDataFetching && !subformDataError
      ? getSubformEntryDisplayName(entryDisplayName, subformDataSources, nodeId)
      : null;

  if (!subformEntryName) {
    return null;
  }

  return (
    <li>
      <button
        disabled={disabled}
        className={cn(classes.subformLink, 'fds-focus')}
        onClick={() => enterSubform({ nodeId, dataElementId: dataElement.id, page, validate: hasErrors })}
      >
        <span className={classes.subformLinkName}>{subformEntryName}</span>
      </button>
    </li>
  );
}
