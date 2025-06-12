import React from 'react';
import type { CSSProperties } from 'react';

import { Card } from '@digdir/designsystemet-react';

import { Flex } from 'src/app-components/Flex/Flex';
import { Lang } from 'src/features/language/Lang';
import { CardProvider } from 'src/layout/Cards/CardContext';
import classes from 'src/layout/Cards/Cards.module.css';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponent, GenericComponentByBaseId } from 'src/layout/GenericComponent';
import { useHasCapability } from 'src/utils/layout/canRenderIn';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
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
  const { cards, minMediaHeight, minWidth, color, mediaPosition: _mediaPosition } = useNodeItem(node);
  const processedMinWidth = parseSize(minWidth, '250px');
  const processedMinMediaHeight = parseSize(minMediaHeight, '150px');
  const mediaPosition = _mediaPosition ?? 'top';
  const canRender = useHasCapability('renderInCards');

  const cardContainer: CSSProperties = {
    display: 'grid',
    gap: '28px',
    gridTemplateColumns: `repeat(auto-fit, minmax(${processedMinWidth}, 1fr))`,
  };

  return (
    <ComponentStructureWrapper node={node}>
      <div style={cardContainer}>
        {cards.map((card, idx) => (
          <Card
            key={idx}
            color={color}
            className={classes.card}
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
            {card.children && card.children.filter(canRender).length > 0 && (
              <Flex
                container
                item
                direction='row'
                spacing={6}
              >
                <Flex
                  container
                  alignItems='flex-start'
                  item
                  spacing={6}
                >
                  <CardProvider
                    node={node}
                    renderedInMedia={false}
                  >
                    {card.children.filter(canRender).map((childId, idx) => (
                      <GenericComponentByBaseId
                        key={idx}
                        id={childId}
                      />
                    ))}
                  </CardProvider>
                </Flex>
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
  const id = useIndexedId(card.mediaId);
  const canRenderInMedia = useHasCapability('renderInCardsMedia');
  const mediaNode = useNode(id);
  if (!mediaNode || !canRenderInMedia(card.mediaId)) {
    return null;
  }

  return (
    <Card.Media className={classes.cardMedia}>
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
