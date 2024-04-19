import React from 'react';

import { Grid, makeStyles } from '@material-ui/core';

import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useParentCard } from 'src/layout/Cards/CardContext';
import type { PropsFromGenericComponent } from 'src/layout';

export type IImageProps = PropsFromGenericComponent<'Image'>;

const useStyles = makeStyles({
  spacing: {
    letterSpacing: '0.3px',
  },
});

export function ImageComponent({ node }: IImageProps) {
  const { langAsString } = useLanguage();
  const { id, image, textResourceBindings } = node.item;
  const classes = useStyles();
  const languageKey = useCurrentLanguage();
  const width = image?.width || '100%';
  const align = image?.align || 'center';
  const altText = textResourceBindings?.altTextImg ? langAsString(textResourceBindings.altTextImg) : undefined;

  let imgSrc = image?.src[languageKey] || image?.src.nb || '';
  if (imgSrc.startsWith('wwwroot')) {
    imgSrc = imgSrc.replace('wwwroot', `/${window.org}/${window.app}`);
  }

  const imgType = imgSrc.slice(-3);
  const renderSvg = imgType.toLowerCase() === 'svg';

  const renderedInCardMedia = useParentCard()?.renderedInMedia;
  if (renderedInCardMedia) {
    return (
      <InnerImage
        id={id}
        renderSvg={renderSvg}
        altText={altText}
        imgSrc={imgSrc}
        width={width}
      />
    );
  }

  return (
    <Grid
      container
      direction='row'
      justifyContent={align}
      spacing={1}
    >
      <Grid item={true}>
        <InnerImage
          id={id}
          renderSvg={renderSvg}
          altText={altText}
          imgSrc={imgSrc}
          width={width}
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

interface InnerImageProps {
  renderSvg: boolean;
  id: string;
  imgSrc: string;
  altText: string | undefined;
  width: string;
}

function InnerImage({ renderSvg, id, imgSrc, altText, width }: InnerImageProps) {
  if (renderSvg) {
    return (
      <object
        type='image/svg+xml'
        id={id}
        data={imgSrc}
        role={'presentation'}
      >
        <img
          src={imgSrc}
          alt={altText}
          style={{
            width,
          }}
        />
      </object>
    );
  }

  return (
    <img
      id={id}
      src={imgSrc}
      alt={altText}
      style={{
        width,
      }}
    />
  );
}
