import React from 'react';
import type { PropsWithChildren } from 'react';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@digdir/design-system-react';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import css from 'src/layout/Grid/Grid.module.css';
import { useResolvedNode } from 'src/utils/layout/ExprContext';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { PropsFromGenericComponent } from 'src/layout';
import type { GridRow } from 'src/layout/Grid/types';

export function GridComponent({ node }: PropsFromGenericComponent<'Grid'>) {
  const { rows } = node.item;
  const shouldHaveFullWidth = node.parent instanceof LayoutPage;

  return (
    <ConditionalWrapper
      condition={shouldHaveFullWidth}
      wrapper={(child) => <FullWidthWrapper>{child}</FullWidthWrapper>}
    >
      <Table>
        {rows.map((row, rowIdx) => (
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

              const componentId = cell && 'id' in cell && typeof cell.id === 'string' ? cell.id : undefined;
              return (
                <CellWithComponent
                  key={componentId || `${rowIdx}-${cellIdx}`}
                  id={componentId}
                  className={className}
                />
              );
            })}
          </Row>
        ))}
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
  id?: string;
}

function CellWithComponent({ id, className }: CellWithComponentProps) {
  const node = useResolvedNode(id);
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
