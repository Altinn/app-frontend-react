import React from 'react';

import { Grid, makeStyles } from '@material-ui/core';

import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import styles from 'src/layout/Audio/Audio.module.css';
import { useParentCard } from 'src/layout/Cards/CardContext';
import type { PropsFromGenericComponent } from 'src/layout';

export type IAudioProps = PropsFromGenericComponent<'Audio'>;

const useStyles = makeStyles({
  spacing: {
    letterSpacing: '0.3px',
  },
});

export function AudioComponent({ node }: IAudioProps) {
  const { langAsString } = useLanguage();
  const { id, audio, textResourceBindings } = node.item;
  const classes = useStyles();
  const languageKey = useCurrentLanguage();
  const altText = textResourceBindings?.altTextAudio ? langAsString(textResourceBindings.altTextAudio) : undefined;

  let audioSrc = audio?.src?.[languageKey] || '';
  if (audioSrc.startsWith('wwwroot')) {
    audioSrc = audioSrc.replace('wwwroot', `/${window.org}/${window.app}`);
  }
  const renderedInCardMedia = useParentCard()?.renderedInMedia;
  const cardMediaHeight = useParentCard()?.minMediaHeight;
  if (renderedInCardMedia) {
    return (
      <InnerAudio
        id={id}
        languageKey={languageKey}
        audioSrc={audioSrc}
        height={cardMediaHeight}
        altText={altText}
        className={styles.container}
      />
    );
  }

  return (
    <Grid
      spacing={1}
      direction='row'
    >
      <Grid item={true}>
        <InnerAudio
          className={styles.container}
          id={id}
          languageKey={languageKey}
          audioSrc={audioSrc}
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

interface InnerAudioProps {
  id: string;
  audioSrc: string;
  altText: string | undefined;
  languageKey: string | undefined;
  height?: string;
  className: string;
}

function InnerAudio({ id, audioSrc, altText, languageKey, height, className }: InnerAudioProps) {
  return (
    <audio
      controls
      id={id}
      style={{ height }}
      className={className}
    >
      <source src={audioSrc} />
      <track
        kind='captions'
        src={audioSrc}
        srcLang={languageKey}
        label={altText}
      />
    </audio>
  );
}
