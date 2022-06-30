import * as React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import type { IComponentProps } from 'src/components';

import { ParagraphComponent } from './ParagraphComponent';

describe('ParagraphComponent', () => {
  it('should render with supplied text', () => {
    const textContent = 'paragraph text content';
    render({ text: textContent });

    expect(screen.getByText(textContent)).toBeInTheDocument();
  });

  it('should render help text if help text is supplied', () => {
    render({
      textResourceBindings: { help: 'this is the help text' },
    });

    expect(
      screen.getByRole('button', {
        name: /popover\.popover_button_helptext/i,
      }),
    ).toBeInTheDocument();
  });

  it('should not render help text if no help text is supplied', () => {
    render();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

const render = (props: Partial<IComponentProps> = {}) => {
  const allProps = {
    text: 'paragraph text content',
    getTextResource: (key: string) => key,
    ...props,
  } as IComponentProps;

  rtlRender(<ParagraphComponent {...allProps} />);
};
