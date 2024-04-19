import React from 'react';
import type { CSSProperties } from 'react';

import { Card as DesignSystemCard } from '@digdir/design-system-react';

import { Lang } from 'src/features/language/Lang';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { PropsFromGenericComponent } from 'src/layout';

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
          {mediaPosition === 'top' && card.mediaNode && (
            <DesignSystemCard.Media>
              <GenericComponent
                key={card.mediaNode.item.id}
                node={card.mediaNode}
              />
            </DesignSystemCard.Media>
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
          {mediaPosition === 'bottom' && card.mediaNode && (
            <DesignSystemCard.Media>
              <GenericComponent
                key={card.mediaNode.item.id}
                node={card.mediaNode}
              />
            </DesignSystemCard.Media>
          )}
        </DesignSystemCard>
      ))}
    </div>
  );
};
