import React from 'react';

import classNames from 'classnames';

import css from 'src/features/form/components/MessageBanner.module.css';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import type { ILanguage } from 'src/types/shared';

interface IMessageBannerProps {
  language: ILanguage;
  error?: boolean;
  messageKey: string;
}

export const MessageBanner = ({ language, error, messageKey }: IMessageBannerProps) => (
  <div
    className={classNames(css.banner, error ? css.error : css.default)}
    data-testid='MessageBanner-container'
  >
    <span>{getLanguageFromKey(messageKey, language)}</span>
  </div>
);
