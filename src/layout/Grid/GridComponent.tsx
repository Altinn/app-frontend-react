import React from 'react';
import type { PropsWithChildren } from 'react';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import css from 'src/layout/Grid/Grid.module.css';
import { isGridRowHidden, nodesFromGrid } from 'src/layout/Grid/tools';
import { getColumnStyles } from 'src/utils/formComponentUtils';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { getPlainTextFromNode } from 'src/utils/stringHelper';
import type { PropsFromGenericComponent } from 'src/layout';
import type { GridComponent, GridRow, GridText } from 'src/layout/Grid/types';
import type { ITableColumnFormatting, ITableColumnProperties } from 'src/layout/layout';

export function RenderGrid(props: PropsFromGenericComponent<'Grid'>) {
  const { node } = props;
  const { rows } = node.item;
  const shouldHaveFullWidth = node.parent instanceof LayoutPage;
  const columnSettings: ITableColumnFormatting = {};
  const isMobile = useIsMobile();
  const isNested = node.parent instanceof LayoutNode;

  if (isMobile) {
    return <MobileGrid {...props} />;
  }

  return (
    <ConditionalWrapper
      condition={shouldHaveFullWidth}
      wrapper={(child) => <FullWidthWrapper>{child}</FullWidthWrapper>}
    >
      <Table id={node.item.id}>
        {rows.map((row, rowIdx) => (
          <GridRowRenderer
            key={rowIdx}
            id={rowIdx}
            row={row}
            isNested={isNested}
            mutableColumnSettings={columnSettings}
          />
        ))}
      </Table>
    </ConditionalWrapper>
  );
}

interface GridRowProps {
  id: number;
  row: GridRow<GridComponent>;
  isNested: boolean;
  mutableColumnSettings: ITableColumnFormatting;
}

export function GridRowRenderer({ id, row, isNested, mutableColumnSettings }: GridRowProps) {
  const { lang } = useLanguage();

  return isGridRowHidden(row) ? null : (
    <InternalRow
      header={row.header}
      readOnly={row.readOnly}
    >
      {row.cells.map((cell, cellIdx) => {
        const isFirst = cellIdx === 0;
        const isLast = cellIdx === row.cells.length - 1;
        const className = cn({
          [css.fullWidthCellFirst]: isFirst && !isNested,
          [css.fullWidthCellLast]: isLast && !isNested,
        });

        const helpTextId = () => {
          const helpTextIdx = row.cells.findIndex((cell: GridText) => cell?.text && cell?.help);
          return helpTextIdx !== -1 ? `row-${id}-cell-${helpTextIdx}` : undefined;
        };

        if (row.header && cell && 'columnOptions' in cell && cell.columnOptions) {
          mutableColumnSettings[cellIdx] = cell.columnOptions;
        }

        if (cell && 'text' in cell && cell.text) {
          let textCellSettings: ITableColumnProperties = mutableColumnSettings[cellIdx]
            ? structuredClone(mutableColumnSettings[cellIdx])
            : {};
          textCellSettings = { ...textCellSettings, ...cell };

          return (
            <CellWithText
              key={`${cell.text}/${cellIdx}`}
              id={helpTextId()}
              className={className}
              columnStyleOptions={textCellSettings}
              helpText={cell?.help}
            >
              {lang(cell.text)}
            </CellWithText>
          );
        }

        const node = cell && 'node' in cell && cell?.node;
        const componentId = node && node.item.id;
        return (
          <CellWithComponent
            key={`${componentId}/${cellIdx}`}
            ariaDescribedById={helpTextId()}
            node={node}
            className={className}
            columnStyleOptions={mutableColumnSettings[cellIdx]}
          />
        );
      })}
    </InternalRow>
  );
}

type InternalRowProps = PropsWithChildren<Pick<GridRow, 'header' | 'readOnly'>>;

function InternalRow({ header, readOnly, children }: InternalRowProps) {
  const className = readOnly ? css.rowReadOnly : undefined;

  if (header) {
    return (
      <TableHeader>
        <TableRow className={className}>{children}</TableRow>
      </TableHeader>
    );
  }

  return (
    <TableBody>
      <TableRow className={className}>{children}</TableRow>
    </TableBody>
  );
}

interface CellProps {
  id?: string;
  className?: string;
  helpText?: string;
  columnStyleOptions?: ITableColumnProperties;
}

interface CellWithComponentProps extends CellProps {
  node?: LayoutNode;
  ariaDescribedById?: string;
}

function CellWithComponent({ node, className, columnStyleOptions, ariaDescribedById }: CellWithComponentProps) {
  if (node && !node.isHidden()) {
    const columnStyles = columnStyleOptions && getColumnStyles(columnStyleOptions);
    return (
      <TableCell
        className={cn(css.tableCellFormatting, className)}
        style={columnStyles}
        aria-describedby={ariaDescribedById}
      >
        <GenericComponent
          node={node}
          overrideDisplay={{
            renderLabel: false,
            renderLegend: false,
            renderedInTable: true,
          }}
        />
      </TableCell>
    );
  }

  return <TableCell className={className} />;
}

type CellWithTextProps = CellProps & PropsWithChildren;

function CellWithText({ children, className, columnStyleOptions, helpText, id }: CellWithTextProps) {
  const columnStyles = columnStyleOptions && getColumnStyles(columnStyleOptions);
  return (
    <TableCell
      className={cn(css.tableCellFormatting, className)}
      style={columnStyles}
    >
      <span className={css.cellWithText}>
        <span
          className={css.contentFormatting}
          style={columnStyles}
        >
          {children}
        </span>
        {helpText && (
          <HelpTextContainer
            title={getPlainTextFromNode(children)}
            helpText={helpText}
            id={id}
          />
        )}
      </span>
    </TableCell>
  );
}

function MobileGrid({ node }: PropsFromGenericComponent<'Grid'>) {
  return (
    <Grid
      id={node.item.id}
      container={true}
      item={true}
      spacing={3}
      alignItems='flex-start'
    >
      {nodesFromGrid(node)
        .filter((child) => !child.isHidden())
        .map((child) => (
          <GenericComponent
            key={child.item.id}
            node={child}
          />
        ))}
    </Grid>
  );
}
