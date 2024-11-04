import React from 'react';

import { render, screen } from '@testing-library/react';

import { Panel } from 'src/app-components/panel/Panel';
import type { PanelVariant } from 'src/app-components/panel/Panel';

const MockLang = ({ text }: { text: string }) => <>{text}</>;

describe('Panel', () => {
  it('should show title and content', () => {
    render(
      <Panel
        variant='info'
        title={<MockLang text='Panel Title' />}
      >
        Panel Content
      </Panel>,
    );
    expect(screen.getByText('Panel Title')).toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('should not show icon when showIcon is not set', () => {
    render(
      <Panel
        variant='info'
        title={<MockLang text='Panel Title' />}
      >
        Panel Content
      </Panel>,
    );
    expect(screen.queryByRole('img', { name: 'info' })).not.toBeInTheDocument();
  });

  it('should not show icon when showIcon is false', () => {
    render(
      <Panel
        variant='info'
        title={<MockLang text='Panel Title' />}
        showIcon={false}
      >
        Panel Content
      </Panel>,
    );
    expect(screen.queryByRole('img', { name: 'info' })).not.toBeInTheDocument();
  });

  it.each<PanelVariant>(['info', 'warning', 'error', 'success'])(
    'should apply relevant icon based on variant when showIcon is true',
    (variant) => {
      render(
        <Panel
          variant={variant}
          title={<MockLang text='Panel Title' />}
          showIcon
        >
          Panel Content
        </Panel>,
      );
      expect(screen.queryByRole('img', { name: variant })).toBeInTheDocument;
    },
  );
});
