import React from 'react';

import cn from 'classnames';

import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { Lang } from 'src/features/language/Lang';
import { OverrideLang, useLanguage } from 'src/features/language/useLanguage';
import { useDeepValidationsForNode } from 'src/features/validation/selectors/deepValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import classes from 'src/layout/Likert/Summary/LikertSummary.module.css';
import { useLikertRows } from 'src/layout/Likert/useLikertRows';
import { EditButton } from 'src/layout/Summary/EditButton';
import { SummaryItemCompact } from 'src/layout/Summary/SummaryItemCompact';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ILikertSummary {
  changeText: string | null;
  onChangeClick: () => void;
  summaryNode: LayoutNode<'Summary'>;
  likertNode: LayoutNode<'Likert'>;
  overrides?: ISummaryComponent['overrides'];
}

export function LikertSummary({ onChangeClick, changeText, summaryNode, likertNode, overrides }: ILikertSummary) {
  const display = overrides?.display || summaryNode.item.display;
  const { lang, langAsString } = useLanguage();

  const validations = useDeepValidationsForNode(likertNode);
  const hasErrors = hasValidationErrors(validations);

  const textBindings = likertNode.item.textResourceBindings;
  const summaryAccessibleTitleTrb =
    textBindings && 'summaryAccessibleTitle' in textBindings ? textBindings.summaryAccessibleTitle : undefined;
  const summaryTitleTrb = textBindings && 'summaryTitle' in textBindings ? textBindings.summaryTitle : undefined;
  const titleTrb = textBindings && 'title' in textBindings ? textBindings.title : undefined;
  const title = lang(summaryTitleTrb ?? titleTrb);
  const ariaLabel = langAsString(summaryTitleTrb ?? summaryAccessibleTitleTrb ?? titleTrb);
  const rows = useLikertRows(likertNode.item);

  if (likertNode.isHidden()) {
    return null;
  }

  return (
    <>
      <div
        data-testid={'summary-group-component'}
        style={{ width: '100%' }}
      >
        <div className={classes.container}>
          <span className={cn(classes.label, hasErrors && !display?.hideValidationMessages && classes.labelWithError)}>
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
            rows.map((row) => (
              <OverrideLang
                key={`row-${row.uuid}`}
                value={{ dataSources: { dataModelPath: row.answerPath } }}
              >
                <div className={classes.border}>
                  <SummaryItemCompact
                    textBindings={{
                      title: textBindings?.questions,
                    }}
                    displayData={row.getDisplayData()}
                  />
                </div>
              </OverrideLang>
            ))
          )}
        </div>
      </div>

      {hasErrors && !display?.hideValidationMessages && (
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
