import React from 'react';
import type { CSSProperties } from 'react';

import { Card } from '@digdir/design-system-react';

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
        <Card
          key={idx}
          color={color}
          style={{ height: '100%' }}
        >
          {mediaPosition === 'top' && (
            <Media
              card={card}
              node={node}
              minMediaHeight={minMediaHeight}
            />
          )}
          {card.title && (
            <Card.Header>
              <Lang id={card.title} />
            </Card.Header>
          )}
          {card.body && (
            <Card.Content>
              <Lang id={card.body} />
            </Card.Content>
          )}
          {card.footer && (
            <Card.Footer>
              <Lang id={card.footer} />
            </Card.Footer>
          )}
          {mediaPosition === 'bottom' && (
            <Media
              card={card}
              node={node}
              minMediaHeight={minMediaHeight}
            />
          )}
        </Card>
      ))}
    </div>
  );
};

interface MediaProps {
  card: CardConfigInternal;
  node: LayoutNode<'Cards'>;
  minMediaHeight: string | undefined;
}

function Media({ card, node, minMediaHeight }: MediaProps) {
  if (!card.mediaNode) {
    return null;
  }

  return (
    <Card.Media>
      <CardProvider
        node={node}
        renderedInMedia={true}
        minMediaHeight={minMediaHeight}
      >
        <GenericComponent
          key={card.mediaNode.item.id}
          node={card.mediaNode}
          overrideDisplay={{
            directRender: true,
          }}
        />
      </CardProvider>
    </Card.Media>
  );
}
