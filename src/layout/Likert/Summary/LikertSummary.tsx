import React from 'react';

import cn from 'classnames';

import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useDeepValidationsForNode } from 'src/features/validation/selectors/deepValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { CompCategory } from 'src/layout/common';
import { LargeLikertSummaryContainer } from 'src/layout/Likert/Summary/LargeLikertSummaryContainer';
import classes from 'src/layout/Likert/Summary/LikertSummary.module.css';
import { EditButton } from 'src/layout/Summary/EditButton';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { Hidden } from 'src/utils/layout/NodesContext';
import { useNodeFormDataSelector, useNodeItem } from 'src/utils/layout/useNodeItem';
import type { ITextResourceBindings } from 'src/layout/layout';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ILikertSummary {
  changeText: string | null;
  onChangeClick: () => void;
  summaryNode: LayoutNode<'Summary'>;
  targetNode: LayoutNode<'Likert'>;
  overrides?: ISummaryComponent['overrides'];
}

export function LikertSummary({ onChangeClick, changeText, summaryNode, targetNode, overrides }: ILikertSummary) {
  const targetItem = useNodeItem(targetNode);
  const summaryItem = useNodeItem(summaryNode);
  const excludedChildren = summaryItem.excludedChildren;
  const display = overrides?.display || summaryItem.display;
  const { lang, langAsString } = useLanguage();
  const formDataSelector = FD.useDebouncedSelector();
  const nodeFormDataSelector = useNodeFormDataSelector();
  const isHidden = Hidden.useIsHiddenSelector();

  const inExcludedChildren = (n: LayoutNode) =>
    excludedChildren && (excludedChildren.includes(n.id) || excludedChildren.includes(n.baseId));

  const groupValidations = useDeepValidationsForNode(targetNode);
  const groupHasErrors = hasValidationErrors(groupValidations);

  const textBindings = targetItem.textResourceBindings as ITextResourceBindings;
  const summaryAccessibleTitleTrb =
    textBindings && 'summaryAccessibleTitle' in textBindings ? textBindings.summaryAccessibleTitle : undefined;
  const summaryTitleTrb = textBindings && 'summaryTitle' in textBindings ? textBindings.summaryTitle : undefined;
  const titleTrb = textBindings && 'title' in textBindings ? textBindings.title : undefined;
  const title = lang(summaryTitleTrb ?? titleTrb);
  const ariaLabel = langAsString(summaryTitleTrb ?? summaryAccessibleTitleTrb ?? titleTrb);

  const rows = targetItem.rows;

  if (summaryItem.largeGroup && overrides?.largeGroup !== false && rows.length) {
    return (
      <>
        {rows.map((row) => (
          <LargeLikertSummaryContainer
            key={`summary-${targetNode.id}-${row.uuid}`}
            id={`summary-${targetNode.id}-${row.index}`}
            groupNode={targetNode}
            onlyInRowUuid={row.uuid}
            renderLayoutNode={(n) => {
              if (inExcludedChildren(n) || isHidden(n)) {
                return null;
              }

              return (
                <SummaryComponent
                  key={n.id}
                  summaryNode={summaryNode}
                  overrides={{
                    ...overrides,
                    targetNode: n,
                    grid: {},
                    largeGroup: false,
                  }}
                />
              );
            }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <div
        data-testid={'summary-group-component'}
        style={{ width: '100%' }}
      >
        <div className={classes.container}>
          <span
            className={cn(classes.label, groupHasErrors && !display?.hideValidationMessages && classes.labelWithError)}
          >
            {title}
          </span>

          {!display?.hideChangeButton ? (
            <EditButton
              onClick={onChangeClick}
              editText={changeText}
              label={ariaLabel}
            />
          ) : null}
        </div>
        <div style={{ width: '100%' }}>
          {rows.length === 0 ? (
            <span className={classes.emptyField}>{lang('general.empty_summary')}</span>
          ) : (
            rows.map((row) => {
              if (inExcludedChildren(row.item)) {
                return null;
              }
              if (isHidden(row.item) || !row.item.isCategory(CompCategory.Form)) {
                return null;
              }

              const RenderCompactSummary = row.item.def.renderCompactSummary.bind(row.item.def);
              return (
                <div
                  key={`row-${row.uuid}`}
                  className={classes.border}
                >
                  <RenderCompactSummary
                    onChangeClick={onChangeClick}
                    changeText={changeText}
                    key={row.item.id}
                    targetNode={row.item as any}
                    summaryNode={summaryNode}
                    overrides={{}}
                    formDataSelector={formDataSelector}
                    nodeFormDataSelector={nodeFormDataSelector}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {groupHasErrors && !display?.hideValidationMessages && (
        <div className={classes.gridStyle}>
          <ErrorPaper message={langAsString('group.row_error')} />
          <div>
            {!display?.hideChangeButton && (
              <button
                className={classes.link}
                onClick={onChangeClick}
                type='button'
              >
                <Lang id={'form_filler.summary_go_to_correct_page'} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
