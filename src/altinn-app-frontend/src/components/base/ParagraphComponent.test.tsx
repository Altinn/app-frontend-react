import * as React from 'react';
import { render, screen } from '@testing-library/react';
import type { ITextResourceBindings } from 'src/features/form/layout';
import type { IComponentProps } from 'src/components';

import { ParagraphComponent } from './ParagraphComponent';

describe('ParagraphComponent', () => {
  const mockId = 'mock-id';
  const mockText = 'Here goes a paragraph';
  const mockGetTextResource = (key: string) => key;
  const mockLanguage: any = {};
  const mockTextResourceBindings: ITextResourceBindings = {
    tile: mockText,
  };

  it('should match snapshot', () => {
    const { container } = render(
      <ParagraphComponent
        id={mockId}
        text={mockText}
        language={mockLanguage}
        getTextResource={mockGetTextResource}
        textResourceBindings={mockTextResourceBindings}
        {...({} as IComponentProps)}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should have correct text', () => {
    render(
      <ParagraphComponent
        id={mockId}
        text={'some other text'}
        language={mockLanguage}
        getTextResource={mockGetTextResource}
        textResourceBindings={mockTextResourceBindings}
        {...({} as IComponentProps)}
      />,
    );
    expect(screen.getByText('some other text')).toBeInTheDocument();
  });

  it('should render help text if help text is supplied', () => {
    render(
      <ParagraphComponent
        id={mockId}
        text={mockText}
        language={mockLanguage}
        getTextResource={mockGetTextResource}
        textResourceBindings={{ help: 'this is the help text' }}
        {...({} as IComponentProps)}
      />,
    );
    expect(
      screen.getByRole('button', {
        name: /popover\.popover_button_helptext/i,
      }),
    ).toBeInTheDocument();
  });
});
