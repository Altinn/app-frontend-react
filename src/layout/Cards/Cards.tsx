import React from 'react';
import type { CSSProperties } from 'react';

import { AppCard } from 'src/app-components/Card/Card';
import { Flex } from 'src/app-components/Flex/Flex';
import { Lang } from 'src/features/language/Lang';
import { CardProvider } from 'src/layout/Cards/CardContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import { useHasCapability } from 'src/utils/layout/canRenderIn';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useExternalItem } from 'src/utils/layout/hooks';
import { useNode } from 'src/utils/layout/NodesContext';
import { typedBoolean } from 'src/utils/typing';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type ICardsProps = PropsFromGenericComponent<'Cards'>;

function parseSize(size: string | undefined, defaultValue: string): string {
  return size && /^[0-9]+$/.test(size) ? `${size}px` : (size ?? defaultValue);
}

const colorVariantMap: Record<string, 'tinted' | 'default'> = {
  neutral: 'default',
  subtle: 'tinted',
};

export const Cards = ({ node }: ICardsProps) => {
  const {
    cards,
    minMediaHeight,
    minWidth,
    color,
    mediaPosition: _mediaPosition,
  } = useExternalItem(node.baseId, 'Cards');
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
        {cards.map((card, idx) => (
          <AppCard
            key={idx}
            title={card.title && <Lang id={card.title} />}
            description={card.description && <Lang id={card.description} />}
            footer={card.footer && <Lang id={card.footer} />}
            variant={colorVariantMap[color]}
            mediaPosition={mediaPosition}
            media={
              card.media && (
                <CardItem
                  key={idx}
                  baseComponentId={card.media}
                  parentNode={node}
                  isMedia={true}
                  minMediaHeight={processedMinMediaHeight}
                />
              )
            }
          >
            <Flex
              container
              direction='row'
              spacing={6}
              item
            >
              <Flex
                container
                alignItems='flex-start'
                spacing={6}
                item
              >
                {card?.children &&
                  card.children?.length > 0 &&
                  card.children?.filter(typedBoolean).map((childId, idx) => (
                    <CardItem
                      key={idx}
                      baseComponentId={childId}
                      parentNode={node}
                      isMedia={false}
                    />
                  ))}
              </Flex>
            </Flex>
          </AppCard>
        ))}
      </div>
    </ComponentStructureWrapper>
  );
};

type CardItemProps = {
  baseComponentId: string;
  parentNode: LayoutNode<'Cards'>;
  isMedia: boolean;
  minMediaHeight?: string;
};

function CardItem({ baseComponentId, parentNode, isMedia, minMediaHeight }: CardItemProps) {
  const id = useIndexedId(baseComponentId);
  const itemNode = useNode(id);
  const canRenderInMedia = useHasCapability('renderInCardsMedia');
  const canRenderInCard = useHasCapability('renderInCards');
  if (!itemNode || (isMedia && !canRenderInMedia(baseComponentId)) || (!isMedia && !canRenderInCard(baseComponentId))) {
    return null;
  }

  return (
    <CardProvider
      node={parentNode}
      renderedInMedia={isMedia}
      minMediaHeight={minMediaHeight}
    >
      {isMedia ? (
        <div
          data-componentid={id}
          data-componentbaseid={baseComponentId}
        >
          <GenericComponent
            node={itemNode}
            overrideDisplay={{
              directRender: true,
            }}
          />
        </div>
      ) : (
        <GenericComponent node={itemNode} />
      )}
    </CardProvider>
  );
}
