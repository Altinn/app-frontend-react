import React from 'react';

import { Card as DesignSystemCard } from '@digdir/design-system-react';

import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import type { PropsFromGenericComponent } from 'src/layout';

import '@digdir/design-system-tokens/brand/digdir/tokens.css';

type ICardProps = PropsFromGenericComponent<'Card'>;

export const Card = ({ node }: ICardProps) => {
  const { color, textResourceBindings, image, media, position } = node.item;
  const { langAsString } = useLanguage();

  const languageKey = useCurrentLanguage();

  const width = image?.width || '100%';
  const altText = textResourceBindings?.altText && langAsString(textResourceBindings.altText);
  const title = textResourceBindings?.title && langAsString(textResourceBindings.title);
  const body = textResourceBindings?.body && langAsString(textResourceBindings.body);
  const footer = textResourceBindings?.footer && langAsString(textResourceBindings.footer);
  let mediaSrc = media?.src[languageKey] || media?.src.nb || '';
  let imgSrc = image?.src[languageKey] || image?.src.nb || '';
  if (imgSrc.startsWith('wwwroot')) {
    imgSrc = imgSrc.replace('wwwroot', `/${window.org}/${window.app}`);
  }
  if (mediaSrc.startsWith('wwwroot')) {
    mediaSrc = mediaSrc.replace('wwwroot', `/${window.org}/${window.app}`);
  }

  if (image) {
    if (position === 'bottom') {
      return (
        <DesignSystemCard color={color}>
          <DesignSystemCard.Header>{title}</DesignSystemCard.Header>
          <DesignSystemCard.Content>{body}</DesignSystemCard.Content>
          <DesignSystemCard.Footer>{footer}</DesignSystemCard.Footer>
          <DesignSystemCard.Media>
            <img
              src={imgSrc}
              alt={altText}
              style={{
                width,
              }}
            />
          </DesignSystemCard.Media>
        </DesignSystemCard>
      );
    } else {
      return (
        <DesignSystemCard color={color}>
          <DesignSystemCard.Media>
            <img
              src={imgSrc}
              alt={altText}
              style={{
                width,
              }}
            />
          </DesignSystemCard.Media>
          <DesignSystemCard.Header>{title}</DesignSystemCard.Header>
          <DesignSystemCard.Content>{body}</DesignSystemCard.Content>
          <DesignSystemCard.Footer>{footer}</DesignSystemCard.Footer>
        </DesignSystemCard>
      );
    }
  }
  if (media) {
    if (position === 'bottom') {
      return (
        <DesignSystemCard color={color}>
          <DesignSystemCard.Header>{title}</DesignSystemCard.Header>
          <DesignSystemCard.Content>{body}</DesignSystemCard.Content>
          <DesignSystemCard.Footer>{footer}</DesignSystemCard.Footer>
          <DesignSystemCard.Media>
            <video controls>
              alt={altText}
              <track
                kind='captions'
                src={mediaSrc}
                //bytt til default senere
                label='English'
              />
              <source
                src={mediaSrc}
                type='video/mp4'
              />
            </video>
          </DesignSystemCard.Media>
        </DesignSystemCard>
      );
    } else {
      return (
        <DesignSystemCard color={color}>
          <DesignSystemCard.Media>
            <video controls>
              alt={altText}
              <track
                kind='captions'
                src={mediaSrc}
                //bytt til default senere
                label='English'
              />
              <source
                src={mediaSrc}
                type='video/mp4'
              />
            </video>
          </DesignSystemCard.Media>
          <DesignSystemCard.Header>{title}</DesignSystemCard.Header>
          <DesignSystemCard.Content>{body}</DesignSystemCard.Content>
          <DesignSystemCard.Footer>{footer}</DesignSystemCard.Footer>
        </DesignSystemCard>
      );
    }
  }
};
