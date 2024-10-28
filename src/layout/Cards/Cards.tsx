import React from 'react';
import type { CSSProperties } from 'react';

import { Card, Heading, Paragraph } from '@digdir/designsystemet-react';
import Grid from '@material-ui/core/Grid';

import { Lang } from 'src/features/language/Lang';
import { CardProvider } from 'src/layout/Cards/CardContext';
import classes from 'src/layout/Cards/Cards.module.css';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { typedBoolean } from 'src/utils/typing';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CardInternal } from 'src/layout/Cards/CardsPlugin';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ICardsProps = PropsFromGenericComponent<'Cards'>;

function parseSize(size: string | undefined, defaultValue: string): string {
  return size && /^[0-9]+$/.test(size) ? `${size}px` : (size ?? defaultValue);
}

export const Cards = ({ node }: ICardsProps) => {
  const { cardsInternal, minMediaHeight, minWidth, color, mediaPosition: _mediaPosition } = useNodeItem(node);
  const processedMinWidth = parseSize(minWidth, '250px');
  const processedMinMediaHeight = parseSize(minMediaHeight, '150px');
  const mediaPosition = _mediaPosition ?? 'top';

  const cardContainer: CSSProperties = {
    display: 'grid',
    gap: '28px',
    gridTemplateColumns: `repeat(auto-fit, minmax(${processedMinWidth}, 1fr))`,
  };

  return (
    <ComponentStructureWrapper node={node}>
      <div style={cardContainer}>
        {cardsInternal.map((card, idx) => (
          <Card
            key={idx}
            color={color}
          >
            {mediaPosition === 'top' && (
              <Media
                card={card}
                node={node}
                minMediaHeight={processedMinMediaHeight}
              />
            )}
            {(card.title || card.description) && (
              <Card.Block>
                {card.title && (
                  <Heading data-size='md'>
                    <Lang id={card.title} />
                  </Heading>
                )}
                {card.description && (
                  <Paragraph>
                    <Lang id={card.description} />
                  </Paragraph>
                )}
              </Card.Block>
            )}
            {card.children && card.children.length > 0 && (
              <Card.Block>
                <CardProvider
                  node={node}
                  renderedInMedia={false}
                >
                  <Grid
                    container
                    spacing={6}
                  >
                    {card.children.filter(typedBoolean).map((childNode, idx) => (
                      <GenericComponent
                        key={idx}
                        node={childNode}
                      />
                    ))}
                  </Grid>
                </CardProvider>
              </Card.Block>
            )}
            {card.footer && (
              <Card.Block>
                <Paragraph data-size='sm'>
                  <Lang id={card.footer} />
                </Paragraph>
              </Card.Block>
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
  if (!card.media) {
    return null;
  }

  return (
    <Card.Block className={classes.mediaCard}>
      <CardProvider
        node={node}
        renderedInMedia={true}
        minMediaHeight={minMediaHeight}
      >
        <div
          data-componentid={card.media.id}
          data-componentbaseid={card.media.baseId}
        >
          <GenericComponent
            node={card.media}
            overrideDisplay={{
              directRender: true,
            }}
          />
        </div>
      </CardProvider>
    </Card.Block>
  );
}
