import React from 'react';
import type { PropsWithChildren } from 'react';

import { Paragraph, Table } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { Label } from 'src/components/form/Label';
import { useDisplayDataProps } from 'src/features/displayData/useDisplayData';
import { Lang } from 'src/features/language/Lang';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { CompCategory } from 'src/layout/common';
import classes from 'src/layout/Grid/GridSummary.module.css';
import { isGridRowHidden } from 'src/layout/Grid/tools';
import { EditButton } from 'src/layout/Summary2/CommonSummaryComponents/EditButton';
import { getColumnStyles } from 'src/utils/formComponentUtils';
import { BaseLayoutNode, type LayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { GridRowInternal, ITableColumnFormatting, ITableColumnProperties } from 'src/layout/common.generated';
import type { CompInputInternal } from 'src/layout/Input/config.generated';
import type { ITextResourceBindings } from 'src/layout/layout';

type GridSummaryProps = {
  componentNode: LayoutNode<'Grid'>;
  summaryOverrides?: CompInputInternal['summaryProps'];
};

export const GridSummary = ({ componentNode, summaryOverrides }: GridSummaryProps) => {
  const { rows, textResourceBindings } = componentNode.item;
  const { title } = textResourceBindings ?? {};

  const shouldHaveFullWidth = componentNode.parent instanceof LayoutPage;
  const columnSettings: ITableColumnFormatting = {};
  const isMobile = useIsMobile();
  const isNested = componentNode.parent instanceof BaseLayoutNode;

  return (
    <ConditionalWrapper
      condition={shouldHaveFullWidth}
      wrapper={(child) => <FullWidthWrapper>{child}</FullWidthWrapper>}
    >
      <Table
        id={componentNode.item.id}
        className={cn(classes.table, { [classes.responsiveTable]: isMobile })}
      >
        {title && (
          <caption className={cn({ [classes.captionFullWidth]: shouldHaveFullWidth }, classes.tableCaption)}>
            <Paragraph
              className={classes.gridSummaryTitle}
              size='large'
              asChild
            >
              <span>
                <Lang id={title} />
              </span>
            </Paragraph>
          </caption>
        )}
        {rows.map((row, rowIdx) => (
          <GridRowRenderer
            key={rowIdx}
            row={row}
            isNested={isNested}
            mutableColumnSettings={columnSettings}
            node={componentNode}
          />
        ))}
      </Table>
    </ConditionalWrapper>
  );
};

interface GridRowProps {
  row: GridRowInternal;
  isNested: boolean;
  mutableColumnSettings: ITableColumnFormatting;
  node: LayoutNode;
}

export function GridRowRenderer({ row, isNested, mutableColumnSettings, node }: GridRowProps) {
  const firstComponentCell = row.cells.find((cell) => cell && 'node' in cell);
  const firstComponentNode =
    firstComponentCell &&
    'node' in firstComponentCell &&
    firstComponentCell.node.isCategory(CompCategory.Form) &&
    firstComponentCell.node;

  return isGridRowHidden(row) ? null : (
    <InternalRow
      header={row.header}
      readOnly={row.readOnly}
    >
      {row.cells.map((cell, cellIdx) => {
        const isFirst = cellIdx === 0;
        const isLast = cellIdx === row.cells.length - 1;
        const className = cn({
          [classes.fullWidthCellFirst]: isFirst && !isNested,
          [classes.fullWidthCellLast]: isLast && !isNested,
        });

        if (row.header && cell && 'columnOptions' in cell && cell.columnOptions) {
          mutableColumnSettings[cellIdx] = cell.columnOptions;
        }

        if (cell && ('labelFrom' in cell || 'text' in cell)) {
          let textCellSettings: ITableColumnProperties = mutableColumnSettings[cellIdx]
            ? structuredClone(mutableColumnSettings[cellIdx])
            : {};
          textCellSettings = { ...textCellSettings, ...cell };

          if ('text' in cell && cell.text) {
            return (
              <CellWithText
                key={`${cell.text}/${cellIdx}`}
                className={className}
                help={cell?.help}
                isHeader={row.header}
                columnStyleOptions={textCellSettings}
              >
                <Lang
                  id={cell.text}
                  node={node}
                />
              </CellWithText>
            );
          }

          if ('labelFrom' in cell && cell.labelFrom) {
            const closestComponent = node
              .flat(true)
              .find((n) => n.item.id === cell.labelFrom || n.item.baseComponentId === cell.labelFrom);
            return (
              <CellWithLabel
                key={`${cell.labelFrom}/${cellIdx}`}
                className={className}
                isHeader={row.header}
                columnStyleOptions={textCellSettings}
                referenceComponent={closestComponent}
              />
            );
          }
        }
        const componentNode = cell && 'node' in cell ? cell.node : undefined;
        const componentId = componentNode && componentNode.item.id;
        return (
          <CellWithComponent
            rowReadOnly={row.readOnly}
            key={`${componentId}/${cellIdx}`}
            node={componentNode}
            isHeader={row.header}
            className={className}
            columnStyleOptions={mutableColumnSettings[cellIdx]}
          />
        );
      })}
      {row.header && (
        <Table.HeaderCell
          className={cn({
            [classes.fullWidthCellLast]: !isNested,
          })}
        />
      )}
      {!row.header && (
        <Table.Cell
          align='right'
          className={cn({
            [classes.fullWidthCellLast]: !isNested,
          })}
        >
          {firstComponentNode && (
            <EditButton
              componentNode={firstComponentNode}
              summaryComponentId=''
            />
          )}
        </Table.Cell>
      )}
    </InternalRow>
  );
}

type InternalRowProps = PropsWithChildren<Pick<GridRowInternal, 'header' | 'readOnly'>>;

function InternalRow({ header, readOnly, children }: InternalRowProps) {
  const className = readOnly ? classes.rowReadOnly : undefined;

  if (header) {
    return (
      <Table.Head>
        <Table.Row className={className}>{children}</Table.Row>
      </Table.Head>
    );
  }

  return (
    <Table.Body>
      <Table.Row className={className}>{children}</Table.Row>
    </Table.Body>
  );
}

interface CellProps {
  className?: string;
  columnStyleOptions?: ITableColumnProperties;
  isHeader?: boolean;
  rowReadOnly?: boolean;
}

interface CellWithComponentProps extends CellProps {
  node?: LayoutNode;
}

interface CellWithTextProps extends PropsWithChildren, CellProps {
  help?: string;
}

interface CellWithLabelProps extends CellProps {
  referenceComponent?: LayoutNode;
}

function CellWithComponent({
  node,
  className,
  columnStyleOptions,
  isHeader = false,
  rowReadOnly,
}: CellWithComponentProps) {
  const CellComponent = isHeader ? Table.HeaderCell : Table.Cell;
  const displayDataProps = useDisplayDataProps();
  if (node && !node.isHidden()) {
    const columnStyles = columnStyleOptions && getColumnStyles(columnStyleOptions);
    return (
      <CellComponent
        className={cn(classes.tableCellFormatting, className)}
        style={columnStyles}
      >
        {('getDisplayData' in node.def && node.def.getDisplayData(node as LayoutNode<any>, displayDataProps)) || '-'}
        {/* <GenericComponent
          node={node}
          overrideDisplay={{
            renderLabel: false,
            renderLegend: false,
            renderedInTable: true,
            rowReadOnly,
          }}
        /> */}
      </CellComponent>
    );
  }

  return <CellComponent className={className} />;
}

function CellWithText({ children, className, columnStyleOptions, isHeader = false }: CellWithTextProps) {
  const columnStyles = columnStyleOptions && getColumnStyles(columnStyleOptions);
  const CellComponent = isHeader ? Table.HeaderCell : Table.Cell;

  return (
    <CellComponent
      className={cn(classes.tableCellFormatting, className)}
      style={columnStyles}
    >
      <span
        className={classes.contentFormatting}
        style={columnStyles}
      >
        {children}
      </span>
    </CellComponent>
  );
}

function CellWithLabel({ className, columnStyleOptions, referenceComponent, isHeader = false }: CellWithLabelProps) {
  const columnStyles = columnStyleOptions && getColumnStyles(columnStyleOptions);
  const refItem = referenceComponent?.item;
  const trb = (refItem && 'textResourceBindings' in refItem ? refItem.textResourceBindings : {}) as
    | ITextResourceBindings
    | undefined;
  const title = trb && 'title' in trb ? trb.title : undefined;
  const required =
    (referenceComponent && 'required' in referenceComponent.item && referenceComponent.item.required) ?? false;
  const componentId = referenceComponent?.item.id ?? referenceComponent?.item.baseComponentId;

  const CellComponent = isHeader ? Table.HeaderCell : Table.Cell;

  return (
    <CellComponent
      className={cn(classes.tableCellFormatting, className)}
      style={columnStyles}
    >
      {componentId && (
        <span className={classes.textLabel}>
          <Label
            key={`label-${componentId}`}
            label={<Lang id={title} />}
            id={componentId}
            required={required}
          />
        </span>
      )}
    </CellComponent>
  );
}
