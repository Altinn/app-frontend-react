import React from 'react';
import type { CSSProperties } from 'react';

import { Card } from '@digdir/designsystemet-react';

import { Flex } from 'src/components/Flex';
import { Lang } from 'src/features/language/Lang';
import { CardProvider } from 'src/layout/Cards/CardContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponent, GenericComponentById } from 'src/layout/GenericComponent';
import { useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CardInternal } from 'src/layout/Cards/CardsPlugin';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ICardsProps = PropsFromGenericComponent<'Cards'>;

function parseSize(size: string | undefined, defaultValue: string): string {
  return size && /^[0-9]+$/.test(size) ? `${size}px` : (size ?? defaultValue);
}

export const Cards = ({ node }: ICardsProps) => {
  const { cardsInternal, minMediaHeight, minWidth, color, mediaPosition: _mediaPosition } = useNodeItem(node);
  const processedMinMediaHeight = parseSize(minMediaHeight, '150px');
  const mediaPosition = _mediaPosition ?? 'top';
  const processedMinWidth = parseSize(minWidth, '250px');

  const cardContainer: CSSProperties = {
    display: 'grid',
    gap: '28px',
    gridTemplateColumns: `repeat(auto-fit, minmax(${processedMinWidth}, 1fr))`,
    width: '100%',
  };

  return (
    <ComponentStructureWrapper node={node}>
      <div style={cardContainer}>
        {cardsInternal.map((card, idx) => (
          <Card
            key={idx}
            color={color}
            style={{ height: '100%', minWidth: processedMinWidth, flexGrow: 1 }}
          >
            {mediaPosition === 'top' && (
              <Media
                card={card}
                node={node}
                minMediaHeight={processedMinMediaHeight}
              />
            )}
            {card.title && (
              <Card.Header>
                <Lang id={card.title} />
              </Card.Header>
            )}
            {card.description && (
              <Card.Content>
                <Lang id={card.description} />
              </Card.Content>
            )}
            {card.childIds && card.childIds.length > 0 && (
              <Flex
                container
                justifyContent='flex-start'
                spacing={2}
                style={{ flex: 0 }}
              >
                <CardProvider
                  node={node}
                  renderedInMedia={false}
                >
                  {card.childIds.map((childId, idx) => (
                    <GenericComponentById
                      key={idx}
                      id={childId}
                    />
                  ))}
                </CardProvider>
              </Flex>
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
                minMediaHeight={processedMinMediaHeight}
              />
            )}
          </Card>
        ))}
      </div>
    </ComponentStructureWrapper>
  );
};

interface MediaProps {
  card: CardInternal;
  node: LayoutNode<'Cards'>;
  minMediaHeight: string | undefined;
}

function Media({ card, node, minMediaHeight }: MediaProps) {
  const mediaNode = useNode(card.mediaId);
  if (!mediaNode) {
    return null;
  }

  return (
    <Card.Media>
      <CardProvider
        node={node}
        renderedInMedia={true}
        minMediaHeight={minMediaHeight}
      >
        <div
          data-componentid={mediaNode.id}
          data-componentbaseid={mediaNode.baseId}
        >
          <GenericComponent
            node={mediaNode}
            overrideDisplay={{
              directRender: true,
            }}
          />
        </div>
      </CardProvider>
    </Card.Media>
  );
}
