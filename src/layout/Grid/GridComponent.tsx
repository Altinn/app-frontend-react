import React from 'react';
import type { PropsWithChildren } from 'react';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@digdir/design-system-react';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import css from 'src/layout/Grid/Grid.module.css';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { PropsFromGenericComponent } from 'src/layout';
import type { GridRow } from 'src/layout/Grid/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function GridComponent({ node }: PropsFromGenericComponent<'Grid'>) {
  const { rows } = node.item;
  const shouldHaveFullWidth = node.parent instanceof LayoutPage;

  return (
    <ConditionalWrapper
      condition={shouldHaveFullWidth}
      wrapper={(child) => <FullWidthWrapper>{child}</FullWidthWrapper>}
    >
      <Table>
        {rows.map((row, rowIdx) => {
          let atLeastNoneNodeExists = false;
          const allCellsAreHidden = row.cells.every((cell) => {
            const node = cell && 'node' in cell && (cell?.node as LayoutNode);
            if (node && typeof node === 'object') {
              atLeastNoneNodeExists = true;
              return node.isHidden();
            }

            // Non-component cells always collapse and hide if components in other cells are hidden
            return true;
          });

          if (atLeastNoneNodeExists && allCellsAreHidden) {
            return null;
          }

          return (
            <Row
              key={rowIdx}
              header={row.header}
              readOnly={row.readOnly}
            >
              {row.cells.map((cell, cellIdx) => {
                const isFirst = cellIdx === 0;
                const isLast = cellIdx === row.cells.length - 1;
                const className = cn({
                  [css.fullWidthCellFirst]: isFirst,
                  [css.fullWidthCellLast]: isLast,
                });

                if (cell && 'text' in cell) {
                  return (
                    <CellWithText
                      key={cell.text}
                      className={className}
                    >
                      {cell.text}
                    </CellWithText>
                  );
                }

                const node = cell?.node as LayoutNode;
                const componentId = node?.item.id;
                return (
                  <CellWithComponent
                    key={componentId || `${rowIdx}-${cellIdx}`}
                    node={node}
                    className={className}
                  />
                );
              })}
            </Row>
          );
        })}
      </Table>
    </ConditionalWrapper>
  );
}

type RowProps = PropsWithChildren<Pick<GridRow<any>, 'header' | 'readOnly'>>;

function Row({ header, readOnly, children }: RowProps) {
  const className = readOnly ? css.rowReadOnly : undefined;

  // PRIORITY: Do not duplicate TableHeader/TableBody elements?
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
  className?: string;
}

interface CellWithComponentProps extends CellProps {
  node?: LayoutNode;
}

function CellWithComponent({ node, className }: CellWithComponentProps) {
  if (node && !node.isHidden()) {
    return (
      <TableCell className={className}>
        <GenericComponent
          node={node}
          overrideDisplay={{
            renderLabel: false,
            renderLegend: false,
            renderCheckboxRadioLabelsWhenOnlyOne: false,
          }}
        />
      </TableCell>
    );
  }

  return <TableCell className={className} />;
}

type CellWithTextProps = CellProps & PropsWithChildren;

function CellWithText({ children, className }: CellWithTextProps) {
  return <TableCell className={className}>{children}</TableCell>;
}
