import React from 'react';
import type { CSSProperties } from 'react';

import { Card as DesignSystemCard } from '@digdir/design-system-react';

import { Lang } from 'src/features/language/Lang';
import { CardProvider } from 'src/layout/Cards/CardContext';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CardConfigInternal } from 'src/layout/Cards/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ICardsProps = PropsFromGenericComponent<'Cards'>;

export const Cards = ({ node }: ICardsProps) => {
  const { cardsInternal, minMediaHeight, color, mediaPosition } = node.item;

  const cardContainer: CSSProperties = {
    display: 'grid',
    gap: '28px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  };

  return (
    <div style={cardContainer}>
      {cardsInternal.map((card, idx) => (
        <DesignSystemCard
          key={idx}
          color={color}
          style={{ height: '100%' }}
        >
          {mediaPosition === 'top' && (
            <Media
              card={card}
              node={node}
            />
          )}
          {card.title && (
            <DesignSystemCard.Header>
              <Lang id={card.title} />
            </DesignSystemCard.Header>
          )}
          {card.body && (
            <DesignSystemCard.Content>
              <Lang id={card.body} />
            </DesignSystemCard.Content>
          )}
          {card.footer && (
            <DesignSystemCard.Footer>
              <Lang id={card.footer} />
            </DesignSystemCard.Footer>
          )}
          {mediaPosition === 'bottom' && (
            <Media
              card={card}
              node={node}
            />
          )}
        </DesignSystemCard>
      ))}
    </div>
  );
};

function Media({ card, node }: { card: CardConfigInternal; node: LayoutNode<'Cards'> }) {
  if (!card.mediaNode) {
    return null;
  }

  return (
    <DesignSystemCard.Media>
      <CardProvider
        node={node}
        renderedInMedia={true}
      >
        <GenericComponent
          key={card.mediaNode.item.id}
          node={card.mediaNode}
          overrideDisplay={{
            directRender: true,
          }}
        />
      </CardProvider>
    </DesignSystemCard.Media>
  );
}
