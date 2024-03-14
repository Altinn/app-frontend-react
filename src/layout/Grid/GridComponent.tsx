import React from 'react';
import type { PropsWithChildren } from 'react';

import { Table } from '@digdir/design-system-react';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { Caption } from 'src/components/form/Caption';
import { Description } from 'src/components/form/Description';
import { Fieldset } from 'src/components/form/Fieldset';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { Label } from 'src/components/form/Label';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { GenericComponent } from 'src/layout/GenericComponent';
import css from 'src/layout/Grid/Grid.module.css';
import { isGridRowHidden, nodesFromGrid } from 'src/layout/Grid/tools';
import { getColumnStyles } from 'src/utils/formComponentUtils';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import { isNodeRef } from 'src/utils/layout/nodeRef';
import { useNodes } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { GridRowInternal, ITableColumnFormatting, ITableColumnProperties } from 'src/layout/common.generated';
import type { ITextResourceBindings } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function RenderGrid(props: PropsFromGenericComponent<'Grid'>) {
  const { node } = props;
  const { rows, textResourceBindings, labelSettings } = useNodeItem(node);
  const { title, description, help } = textResourceBindings ?? {};
  const shouldHaveFullWidth = node.parent instanceof LayoutPage;
  const columnSettings: ITableColumnFormatting = {};
  const isMobile = useIsMobile();
  const isNested = node.parent instanceof BaseLayoutNode;

  if (isMobile) {
    return <MobileGrid {...props} />;
  }

  return (
    <ConditionalWrapper
      condition={shouldHaveFullWidth}
      wrapper={(child) => <FullWidthWrapper>{child}</FullWidthWrapper>}
    >
      <Table
        id={node.getId()}
        className={css.table}
      >
        {title && (
          <Caption
            className={cn({ [css.captionFullWidth]: shouldHaveFullWidth })}
            title={<Lang id={title} />}
            description={description && <Lang id={description} />}
            helpText={help}
            labelSettings={labelSettings}
          />
        )}
        {rows.map((row, rowIdx) => (
          <GridRowRenderer
            key={rowIdx}
            row={row}
            isNested={isNested}
            mutableColumnSettings={columnSettings}
            node={node}
          />
        ))}
      </Table>
    </ConditionalWrapper>
  );
}

interface GridRowProps {
  row: GridRowInternal;
  isNested: boolean;
  mutableColumnSettings: ITableColumnFormatting;
  node: LayoutNode;
}

export function GridRowRenderer({ row, isNested, mutableColumnSettings, node }: GridRowProps) {
  const nodes = useNodes();
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
            const closestComponent = node.flat().find((n) => n.getBaseId() === cell.labelFrom);
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
        const targetNode = isNodeRef(cell) ? nodes.findById(cell.nodeRef) : undefined;
        return (
          <CellWithComponent
            key={`${targetNode?.getId()}/${cellIdx}`}
            node={targetNode}
            isHeader={row.header}
            className={className}
            columnStyleOptions={mutableColumnSettings[cellIdx]}
          />
        );
      })}
    </InternalRow>
  );
}

type InternalRowProps = PropsWithChildren<Pick<GridRowInternal, 'header' | 'readOnly'>>;

function InternalRow({ header, readOnly, children }: InternalRowProps) {
  const className = readOnly ? css.rowReadOnly : undefined;

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

function CellWithComponent({ node, className, columnStyleOptions, isHeader = false }: CellWithComponentProps) {
  const CellComponent = isHeader ? Table.HeaderCell : Table.Cell;
  if (node && !node.isHidden()) {
    const columnStyles = columnStyleOptions && getColumnStyles(columnStyleOptions);
    return (
      <CellComponent
        className={cn(css.tableCellFormatting, className)}
        style={columnStyles}
      >
        <GenericComponent
          node={node}
          overrideDisplay={{
            renderLabel: false,
            renderLegend: false,
            renderedInTable: true,
          }}
        />
      </CellComponent>
    );
  }

  return <CellComponent className={className} />;
}

function CellWithText({ children, className, columnStyleOptions, help, isHeader = false }: CellWithTextProps) {
  const columnStyles = columnStyleOptions && getColumnStyles(columnStyleOptions);
  const { elementAsString } = useLanguage();
  const CellComponent = isHeader ? Table.HeaderCell : Table.Cell;

  return (
    <CellComponent
      className={cn(css.tableCellFormatting, className)}
      style={columnStyles}
    >
      <span className={help && css.textCell}>
        <span
          className={css.contentFormatting}
          style={columnStyles}
        >
          {children}
        </span>
        {help && (
          <HelpTextContainer
            title={elementAsString(children)}
            helpText={<Lang id={help} />}
          />
        )}
      </span>
    </CellComponent>
  );
}

function CellWithLabel({ className, columnStyleOptions, referenceComponent, isHeader = false }: CellWithLabelProps) {
  const columnStyles = columnStyleOptions && getColumnStyles(columnStyleOptions);
  const refItem = useNodeItem(referenceComponent);
  const trb = (refItem && 'textResourceBindings' in refItem ? refItem.textResourceBindings : {}) as
    | ITextResourceBindings
    | undefined;
  const title = trb && 'title' in trb ? trb.title : undefined;
  const help = trb && 'help' in trb ? trb.help : undefined;
  const description = trb && 'description' in trb ? trb.description : undefined;
  const required = (refItem && 'required' in refItem && refItem.required) ?? false;
  const componentId = referenceComponent?.getId();

  const CellComponent = isHeader ? Table.HeaderCell : Table.Cell;

  return (
    <CellComponent
      className={cn(css.tableCellFormatting, className)}
      style={columnStyles}
    >
      {componentId && (
        <>
          <span className={css.textLabel}>
            <Label
              key={`label-${componentId}`}
              label={<Lang id={title} />}
              id={componentId}
              required={required}
              helpText={help && <Lang id={help} />}
            />
          </span>
          {description && (
            <Description
              id={componentId}
              description={<Lang id={description} />}
            />
          )}
        </>
      )}
    </CellComponent>
  );
}

function MobileGrid({ node }: PropsFromGenericComponent<'Grid'>) {
  const { textResourceBindings, id, labelSettings } = useNodeItem(node);
  const { title, description, help } = textResourceBindings ?? {};
  return (
    <Fieldset
      id={id}
      legend={title && <Lang id={title} />}
      description={title && <Lang id={description} />}
      helpText={help}
      labelSettings={labelSettings}
      className={css.mobileFieldset}
    >
      {nodesFromGrid(node)
        .filter((child) => !child.isHidden())
        .map((child) => (
          <GenericComponent
            key={child.getId()}
            node={child}
          />
        ))}
    </Fieldset>
  );
}
