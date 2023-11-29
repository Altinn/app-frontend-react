import React, { Component } from 'react';

import { useCurrentLanguage, useHasLanguageProvider } from 'src/features/language/LanguageProvider';
import { getLanguageFromKey, useLanguage } from 'src/features/language/useLanguage';
import { getLanguageFromCode } from 'src/language/languages';
import type { ValidLangParam, ValidLanguageKey } from 'src/features/language/useLanguage';

export interface LangComponentProps {
  id: ValidLanguageKey | string | undefined;
  params?: ValidLangParam[];
}

function LangComponent({ id, params }: LangComponentProps) {
  const { lang } = useLanguage();
  return lang(id, params);
}

function LangFallback({ id, lang }: LangComponentProps & { lang: string }) {
  return id ? getLanguageFromKey(id, getLanguageFromCode(lang)) : undefined;
}

function LangWithLanguageFallback({ id, params }: LangComponentProps) {
  const currentLanguage = useCurrentLanguage();

  return (
    <LangFallback
      id={id}
      params={params}
      lang={currentLanguage}
    />
  );
}

function LangFallbackCheck({ id, params }: LangComponentProps) {
  const hasLanguage = useHasLanguageProvider();

  return hasLanguage ? (
    <LangWithLanguageFallback
      id={id}
      params={params}
    />
  ) : (
    <LangFallback
      id={id}
      params={params}
      lang='nb'
    />
  );
}

interface IErrorBoundary {
  error?: Error;
}

/**
 * The Lang component is a wrapper around the useLanguage hook, and is used to resolve a key to
 * a language string/element. In contrast to the useLanguage hook, this component will handle errors, such
 * as missing providers, and try to default to a fallback language.
 */
export class Lang extends Component<LangComponentProps, IErrorBoundary> {
  constructor(props: LangComponentProps) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <LangFallbackCheck id={this.props.id} />;
    }

    return (
      <LangComponent
        id={this.props.id}
        params={this.props.params}
      />
    );
  }
}
