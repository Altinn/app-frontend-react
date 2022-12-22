import React from 'react';
import type { ReactNode } from 'react';

import cn from 'classnames';

import { evalExpr } from 'src/features/expressions';
import css from 'src/features/pdf/PDFView.module.css';
import type { ContextDataSources } from 'src/features/expressions/ExprContext';
import type { ILayoutComponentOrGroup } from 'src/layout/layout';
import type { LayoutRootNode, LayoutRootNodeCollection } from 'src/utils/layout/hierarchy';

interface IPDFComponentWrapper {
  component: ILayoutComponentOrGroup;
  nodes:
    | LayoutRootNode<'unresolved'>
    | LayoutRootNodeCollection<
        'unresolved',
        {
          [layoutKey: string]: LayoutRootNode<'unresolved'>;
        }
      >;
  dataSources: ContextDataSources;
  children: ReactNode;
}

const PDFComponentWrapper = ({ component, nodes, dataSources, children }: IPDFComponentWrapper) => {
  const node = nodes.findById(component.id);

  const breakBefore: boolean =
    component.pageBreak?.breakBefore && Array.isArray(component.pageBreak?.breakBefore) && node
      ? evalExpr(component.pageBreak.breakBefore, node, dataSources)
      : Boolean(component.pageBreak?.breakBefore);

  const breakAfter: boolean =
    component.pageBreak?.breakAfter && Array.isArray(component.pageBreak?.breakAfter) && node
      ? evalExpr(component.pageBreak.breakAfter, node, dataSources)
      : Boolean(component.pageBreak?.breakAfter);

  return (
    <div
      className={cn(css['component-container'], {
        [css['break-before']]: breakBefore,
        [css['break-after']]: breakAfter,
      })}
    >
      {children}
    </div>
  );
};

export default PDFComponentWrapper;
