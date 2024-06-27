import React from 'react';

import cn from 'classnames';

import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useDeepValidationsForNode } from 'src/features/validation/selectors/deepValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { CompCategory } from 'src/layout/common';
import { LargeGroupSummaryContainer } from 'src/layout/RepeatingGroup/Summary/LargeGroupSummaryContainer';
import classes from 'src/layout/RepeatingGroup/Summary/SummaryRepeatingGroup.module.css';
import { EditButton } from 'src/layout/Summary/EditButton';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import { Hidden } from 'src/utils/layout/NodesContext';
import { useNodeFormDataSelector, useNodeItem } from 'src/utils/layout/useNodeItem';
import { useNodeTraversal } from 'src/utils/layout/useNodeTraversal';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { RepGroupRow } from 'src/layout/RepeatingGroup/types';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISummaryRepeatingGroup {
  changeText: string | null;
  onChangeClick: () => void;
  summaryNode: LayoutNode<'Summary'>;
  targetNode: LayoutNode<'RepeatingGroup'>;
  overrides?: ISummaryComponent['overrides'];
}

interface FullProps extends ISummaryRepeatingGroup {
  rows: RepGroupRow[];
  inExcludedChildren: (n: LayoutNode) => boolean;
}

interface FullRowProps extends Omit<FullProps, 'rows'> {
  row: RepGroupRow;
}

export function SummaryRepeatingGroup(props: ISummaryRepeatingGroup) {
  const { excludedChildren, largeGroup } = useNodeItem(props.summaryNode);
  const { rows: _rows } = useNodeItem(props.targetNode);
  const isHidden = Hidden.useIsHiddenSelector();

  const inExcludedChildren = (n: LayoutNode) =>
    excludedChildren ? excludedChildren.includes(n.id) || excludedChildren.includes(n.baseId) : false;

  const rows: RepGroupRow[] = [];
  for (const row of _rows) {
    if (!row || row.groupExpressions?.hiddenRow || row.index === undefined) {
      continue;
    }
    rows.push(row);
  }

  if (largeGroup && props.overrides?.largeGroup !== false && rows.length) {
    return (
      <LargeRepeatingGroup
        {...props}
        rows={rows}
        inExcludedChildren={inExcludedChildren}
      />
    );
  }

  return (
    <RegularRepeatingGroup
      {...props}
      rows={rows}
      inExcludedChildren={inExcludedChildren}
    />
  );
}

function RegularRepeatingGroup(props: FullProps) {
  const { onChangeClick, changeText, summaryNode, targetNode, overrides, rows } = props;

  const { display: summaryDisplay } = useNodeItem(summaryNode);
  const { textResourceBindings: trb } = useNodeItem(targetNode);

  const display = overrides?.display || summaryDisplay;
  const { langAsString } = useLanguage(targetNode);

  const groupValidations = useDeepValidationsForNode(targetNode);
  const groupHasErrors = hasValidationErrors(groupValidations);

  const summaryAccessibleTitleTrb = trb && 'summaryAccessibleTitle' in trb ? trb.summaryAccessibleTitle : undefined;
  const summaryTitleTrb = trb && 'summaryTitle' in trb ? trb.summaryTitle : undefined;
  const titleTrb = trb && 'title' in trb ? trb.title : undefined;
  const ariaLabel = langAsString(summaryTitleTrb ?? summaryAccessibleTitleTrb ?? titleTrb);

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
            <Lang
              id={summaryTitleTrb ?? titleTrb}
              node={targetNode}
            />
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
            <span className={classes.emptyField}>
              <Lang id={'general.empty_summary'} />
            </span>
          ) : (
            rows.map((row) => (
              <RegularRepeatingGroupRow
                key={`row-${row.uuid}`}
                {...props}
                row={row}
              />
            ))
          )}
        </div>
      </div>

      {groupHasErrors && !display?.hideValidationMessages && (
        <div className={classes.gridStyle}>
          <ErrorPaper message={<Lang id={'group.row_error'} />} />
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

function RegularRepeatingGroupRow({
  targetNode,
  inExcludedChildren,
  row,
  onChangeClick,
  changeText,
  summaryNode,
}: FullRowProps) {
  const isHidden = Hidden.useIsHiddenSelector();
  const formDataSelector = FD.useDebouncedSelector();
  const nodeDataSelector = useNodeFormDataSelector();
  const children = useNodeTraversal((t) => t.children(undefined, { onlyInRowUuid: row.uuid }), targetNode);

  const childSummaryComponents = children
    .filter((n) => !inExcludedChildren(n))
    .map((child) => {
      if (isHidden(child) || !child.isCategory(CompCategory.Form)) {
        return;
      }
      const RenderCompactSummary = child.def.renderCompactSummary.bind(child.def) as React.FC<
        SummaryRendererProps<any>
      >;
      return (
        <RenderCompactSummary
          onChangeClick={onChangeClick}
          changeText={changeText}
          key={child.id}
          targetNode={child}
          summaryNode={summaryNode}
          overrides={{}}
          formDataSelector={formDataSelector}
          nodeFormDataSelector={nodeDataSelector}
        />
      );
    });

  return (
    <div
      data-testid={'summary-repeating-row'}
      key={`row-${row.uuid}`}
      className={classes.border}
    >
      {childSummaryComponents}
    </div>
  );
}

function LargeRepeatingGroup({ targetNode, summaryNode, overrides, inExcludedChildren, rows }: FullProps) {
  const isHidden = Hidden.useIsHiddenSelector();

  return (
    <>
      {rows.map((row) => (
        <LargeGroupSummaryContainer
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
