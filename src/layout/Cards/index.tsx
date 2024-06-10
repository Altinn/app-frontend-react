import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { Cards as CardsComponent } from 'src/layout/Cards/Cards';
import { CardsDef } from 'src/layout/Cards/config.def.generated';
import { SummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Cards extends CardsDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Cards'>>(
    function LayoutComponentCardRender(props, _): React.JSX.Element | null {
      return <CardsComponent {...props} />;
    },
  );

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  renderSummary({ summaryNode, targetNode, overrides }: SummaryRendererProps<'Cards'>): JSX.Element | null {
    const children = targetNode.item.cardsInternal.map((card) => card.childNodes).flat();

    return (
      <>
        {children.map((child) => (
          <SummaryComponent
            key={child.item.id}
            summaryNode={summaryNode}
            overrides={{
              ...overrides,
              targetNode: child,
              grid: {},
              largeGroup: true,
            }}
          />
        ))}
      </>
    );
  }
}
