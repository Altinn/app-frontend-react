import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { Cards as CardsComponent } from 'src/layout/Cards/Cards';
import { CardsSummary, CardsSummary2 } from 'src/layout/Cards/CardsSummary';
import { CardsDef } from 'src/layout/Cards/config.def.generated';
import { EmptyChildrenBoundary } from 'src/layout/Summary2/isEmpty/EmptyChildrenContext';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ChildClaimerProps, SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export class Cards extends CardsDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Cards'>>(
    function LayoutComponentCardRender(props, _): React.JSX.Element | null {
      return <CardsComponent {...props} />;
    },
  );

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  renderSummary2(props: Summary2Props): React.JSX.Element | null {
    return (
      <EmptyChildrenBoundary>
        <CardsSummary2 {...props} />
      </EmptyChildrenBoundary>
    );
  }

  renderSummary(props: SummaryRendererProps): JSX.Element | null {
    return <CardsSummary {...props} />;
  }

  extraNodeGeneratorChildren(): string {
    return `<GenerateNodeChildren claims={props.childClaims} pluginKey='CardsPlugin' />`;
  }

  claimChildren({ item, claimChild, getType, getCapabilities }: ChildClaimerProps<'Cards'>): void {
    for (const card of (item.cards || []).values()) {
      if (card.media) {
        const type = getType(card.media);
        if (!type) {
          continue;
        }
        const capabilities = getCapabilities(type);
        if (!capabilities.renderInCardsMedia) {
          window.logWarn(
            `Cards component included a component '${card.media}', which ` +
              `is a '${type}' and cannot be rendered as Card media.`,
          );
          continue;
        }
        claimChild('CardsPlugin', card.media);
      }

      for (const child of card.children?.values() ?? []) {
        const type = getType(child);
        if (!type) {
          continue;
        }
        const capabilities = getCapabilities(type);
        if (!capabilities.renderInCards) {
          window.logWarn(
            `Cards component included a component '${child}', which ` +
              `is a '${type}' and cannot be rendered as a Card child.`,
          );
          continue;
        }
        claimChild('CardsPlugin', child);
      }
    }
  }
}
