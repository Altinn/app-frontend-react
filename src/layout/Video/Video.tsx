import React from 'react';

import { Grid, makeStyles } from '@material-ui/core';

import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useParentCard } from 'src/layout/Cards/CardContext';
import styles from 'src/layout/Video/Video.module.css';
import type { PropsFromGenericComponent } from 'src/layout';

export type IVideoProps = PropsFromGenericComponent<'Video'>;

const useStyles = makeStyles({
  spacing: {
    letterSpacing: '0.3px',
  },
});

export function VideoComponent({ node }: IVideoProps) {
  const { langAsString } = useLanguage();
  const { id, video, textResourceBindings } = node.item;
  const classes = useStyles();
  const languageKey = useCurrentLanguage();
  const altText = textResourceBindings?.altTextVideo ? langAsString(textResourceBindings.altTextVideo) : undefined;

  let videoSrc = video?.src?.[languageKey] || '';
  if (videoSrc.startsWith('wwwroot')) {
    videoSrc = videoSrc.replace('wwwroot', `/${window.org}/${window.app}`);
  }
  const renderedInCardMedia = useParentCard()?.renderedInMedia;
  const cardMediaHeight = useParentCard()?.minMediaHeight;
  if (renderedInCardMedia) {
    return (
      <InnerVideo
        id={id}
        languageKey={languageKey}
        videoSrc={videoSrc}
        height={cardMediaHeight}
        altText={altText}
        className={styles.container}
      />
    );
  }

  return (
    <Grid
      container
      direction='row'
      spacing={1}
    >
      <Grid item={true}>
        <InnerVideo
          className={styles.container}
          id={id}
          languageKey={languageKey}
          videoSrc={videoSrc}
          altText={altText}
        />
      </Grid>
      {textResourceBindings?.help && (
        <Grid
          item={true}
          className={classes.spacing}
        >
          <HelpTextContainer
            helpText={<Lang id={textResourceBindings.help} />}
            title={altText}
          />
        </Grid>
      )}
    </Grid>
  );
}

interface InnerVideoProps {
  id: string;
  videoSrc: string;
  altText: string | undefined;
  languageKey: string | undefined;
  height?: string;
  className: string;
}

function InnerVideo({ id, videoSrc, altText, languageKey, height, className }: InnerVideoProps) {
  return (
    <video
      controls
      id={id}
      style={{ height }}
      className={className}
    >
      <source src={videoSrc} />
      <track
        kind='captions'
        src={videoSrc}
        srcLang={languageKey}
        label={altText}
      />
    </video>
  );
}
