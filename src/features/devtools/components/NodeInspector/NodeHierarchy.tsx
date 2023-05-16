/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import cn from 'classnames';

import classes from 'src/features/devtools/components/LayoutInspector/LayoutInspector.module.css';
import { useComponentHighlighter } from 'src/features/devtools/hooks/useComponentHighlighter';
import { nodesFromGridRow } from 'src/layout/Grid/tools';
import type { GridComponent, GridRow } from 'src/layout/Grid/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface INodeHierarchyItemProps {
  node: LayoutNode;
  onClick: (id: string) => void;
}

interface INodeHierarchyProps {
  nodes: LayoutNode[] | undefined;
  onClick: (id: string) => void;
}

interface IGridRowsRenderer {
  rows: GridRow<GridComponent>[];
  text: string;
  onClick: (id: string) => void;
}

const GridRows = ({ rows, onClick, text }: IGridRowsRenderer) => (
  <>
    {rows.map((row, idx) => {
      const nodes = nodesFromGridRow(row);
      return (
        <li
          className={classes.repGroupRow}
          key={idx}
        >
          <span className={classes.componentMetadata}>{text}</span>
          {nodes.length > 0 ? (
            <NodeHierarchy
              nodes={nodes}
              onClick={onClick}
            />
          ) : (
            <li className={cn(classes.componentMetadata, classes.list)}>Ingen komponenter å vise her</li>
          )}
        </li>
      );
    })}
  </>
);

export const NodeHierarchyItem = ({ node, onClick }: INodeHierarchyItemProps) => {
  const { onMouseEnter, onMouseLeave } = useComponentHighlighter(node.item.id, false);
  const hasChildren = node.children().length > 0;
  const isRepGroup = node.isRepGroup();

  return (
    <>
      <li
        className={classes.item}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={() => onClick(node.item.id)}
      >
        <span className={classes.componentType}>{node.item.type}</span>
        <span className={classes.componentId}>
          {node.item.multiPageIndex !== undefined ? `${node.item.multiPageIndex}:` : ''}
          {node.item.id}
        </span>
      </li>
      {/* Support for generic components with children */}
      {hasChildren && !isRepGroup && (
        <li>
          <NodeHierarchy
            nodes={node.children()}
            onClick={onClick}
          />
        </li>
      )}
      {/* Support for repeating groups */}
      {isRepGroup && node.item.rowsBefore && (
        <GridRows
          rows={node.item.rowsBefore}
          text={'rowsBefore'}
          onClick={onClick}
        />
      )}
      {isRepGroup &&
        node.item.rows.map((row) => (
          <li
            className={classes.repGroupRow}
            key={row?.index}
          >
            <span className={classes.componentMetadata}>
              Rad {row?.index} {row?.groupExpressions?.hiddenRow === true ? '(skjult)' : ''}
            </span>
            <NodeHierarchy
              nodes={row?.items}
              onClick={onClick}
            />
          </li>
        ))}
      {isRepGroup && node.item.rowsAfter && (
        <GridRows
          rows={node.item.rowsAfter}
          text={'rowsAfter'}
          onClick={onClick}
        />
      )}
    </>
  );
};

export function NodeHierarchy({ nodes, onClick }: INodeHierarchyProps) {
  return (
    <ul className={classes.list}>
      {nodes?.map((child) => (
        <NodeHierarchyItem
          key={child.item.id}
          node={child}
          onClick={onClick}
        />
      ))}
    </ul>
  );
}
