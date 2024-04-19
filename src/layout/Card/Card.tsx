import React from 'react';
import type { PropsWithChildren } from 'react';

import { Card as DesignSystemCard } from '@digdir/design-system-react';

import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import styles from 'src/layout/Card/Card.module.css';
import type { PropsFromGenericComponent } from 'src/layout';

type ICardProps = PropsFromGenericComponent<'Card'>;

export const Card = ({ node }: ICardProps) => {
  const { textResourceBindings, image, video, audio, minMediaHeight } = node.item;
  const { langAsString } = useLanguage();
  const languageKey = useCurrentLanguage();
  const width = image?.width || '100%';
  const altText = textResourceBindings?.altText && langAsString(textResourceBindings.altText);
  const audioSource = audio?.src?.[languageKey] || '';
  const videoSource = video?.src?.[languageKey] || '';
  const imageSource = image?.src?.[languageKey] || '';

  if (image && imageSource) {
    return (
      <SharedCard node={node}>
        <img
          src={imageSource}
          alt={altText}
          style={{
            width,
            height: minMediaHeight,
          }}
        />
      </SharedCard>
    );
  }
  if (video && videoSource) {
    return (
      <SharedCard node={node}>
        <video
          controls
          style={{ height: minMediaHeight }}
        >
          <source src={videoSource}></source>
          <track
            kind='captions'
            src={videoSource}
            label={languageKey}
          />
        </video>
      </SharedCard>
    );
  }
  if (audio && audioSource) {
    return (
      <SharedCard node={node}>
        <audio
          controls
          style={{ height: minMediaHeight }}
        >
          <source src={audioSource}></source>
          <track
            kind='captions'
            src={audioSource}
            label={languageKey}
          />
        </audio>
      </SharedCard>
    );
  }
};

const SharedCard = ({ children, node }: PropsWithChildren<{ node: ICardProps['node'] }>) => {
  const { color, textResourceBindings, position } = node.item;

  return (
    <DesignSystemCard
      color={color}
      className={styles.container}
    >
      {position === 'top' && <DesignSystemCard.Media>{children}</DesignSystemCard.Media>}
      {textResourceBindings?.title && (
        <DesignSystemCard.Header>
          <Lang id={textResourceBindings?.title} />
        </DesignSystemCard.Header>
      )}
      {textResourceBindings?.body && (
        <DesignSystemCard.Content>
          <Lang id={textResourceBindings?.body} />
        </DesignSystemCard.Content>
      )}
      {textResourceBindings?.footer && (
        <DesignSystemCard.Footer>
          <Lang id={textResourceBindings?.footer} />
        </DesignSystemCard.Footer>
      )}
      {position === 'bottom' && <DesignSystemCard.Media>{children}</DesignSystemCard.Media>}
    </DesignSystemCard>
  );
};
