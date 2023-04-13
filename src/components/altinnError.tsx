import React from 'react';

import classes from 'src/components/altinnError.module.css';
import { altinnAppsIllustrationHelpCircleSvgUrl } from 'src/utils/urls/urlHelper';

export interface IAltinnErrorProps {
  statusCode: string;
  title: string | React.ReactNode;
  content: string | React.ReactNode;
  url?: string;
  urlText?: string;
  urlTextSuffix?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export const AltinnError = ({
  statusCode,
  title,
  content,
  url,
  urlText,
  urlTextSuffix,
  imageAlt,
  imageUrl,
}: IAltinnErrorProps) => (
  <div
    data-testid='AltinnError'
    className={classes.flexContainer}
  >
    <div className={classes.contentContainer}>
      <div className={classes.contentMargin}>
        <span className={classes.statusCode}>{statusCode}</span>
      </div>
      <div className={classes.contentMargin}>
        <h1 className={classes.title}>{title}</h1>
      </div>
      <div className={classes.contentMargin}>
        <p className={classes.articleText}>{content}</p>
      </div>
      <div>
        <span>
          <a href={url}>{urlText}</a>
        </span>
      </div>
      <div>
        <span>{urlTextSuffix}</span>
      </div>
    </div>
    <div className={classes.imageContainer}>
      <img
        alt={imageAlt ? imageAlt : 'Altinn Help Illustration'}
        src={imageUrl ? imageUrl : altinnAppsIllustrationHelpCircleSvgUrl}
      />
    </div>
  </div>
);
