import React from 'react';
import type { CSSProperties } from 'react';

import { AppCard } from 'src/app-components/Card/Card';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { Lang } from 'src/features/language/Lang';
import { CardProvider } from 'src/layout/Cards/CardContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { typedBoolean } from 'src/utils/typing';
import type { PropsFromGenericComponent } from 'src/layout';
import type { BaseLayoutNode, LayoutNode } from 'src/utils/layout/LayoutNode';

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
          <AppCard
            key={idx}
            title={card.title && <Lang id={card.title} />}
            description={card.description && <Lang id={card.description} />}
            footer={card.footer && <Lang id={card.footer} />}
            color={color}
            mediaPosition={mediaPosition}
            media={
              card.media && (
                <CardItem
                  key={idx}
                  node={card.media}
                  parentNode={node}
                  isMedia={true}
                  minMediaHeight={processedMinMediaHeight}
                />
              )
            }
          >
            {card?.children &&
              card.children?.length > 0 &&
              card.children?.filter(typedBoolean).map((childNode, idx) => (
                <CardItem
                  key={idx}
                  node={childNode}
                  parentNode={node}
                  isMedia={false}
                />
              ))}
          </AppCard>
        ))}
      </div>
    </ComponentStructureWrapper>
  );
};

type CardItemProps = {
  node: LayoutNode;
  parentNode: BaseLayoutNode<'Cards'>;
  isMedia: boolean;
  minMediaHeight?: string;
};

function CardItem({ node, parentNode, isMedia, minMediaHeight }: CardItemProps) {
  return (
    <CardProvider
      node={parentNode}
      renderedInMedia={isMedia}
      minMediaHeight={minMediaHeight}
    >
      <ConditionalWrapper
        condition={isMedia}
        wrapper={(children) => (
          <div
            data-componentid={node.id}
            data-componentbaseid={node.baseId}
          >
            {children}
          </div>
        )}
      >
        <GenericComponent
          node={node}
          overrideDisplay={{
            directRender: true,
          }}
        />
      </ConditionalWrapper>
    </CardProvider>
  );
}
