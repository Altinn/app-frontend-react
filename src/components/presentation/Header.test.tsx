import React from 'react';

import { screen } from '@testing-library/react';

import { Header } from 'src/components/presentation/Header';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import { PageNavigationRouter } from 'src/test/routerUtils';
import { ProcessTaskType } from 'src/types';

type RenderProps = {
  type?: ProcessTaskType;
  showProgress?: boolean;
  order?: string[];
  currentPageId?: string;
};

const render = async ({ order = [], showProgress = false, currentPageId = '1' }: RenderProps = {}) => {
  await renderWithInstanceAndLayout({
    renderer: () => <Header header='Test Header' />,
    router: PageNavigationRouter(currentPageId),
    queries: {
      fetchLayoutSettings: () => Promise.resolve({ showProgress, pages: { order } }),
    },
  });
};

describe('Header', () => {
  it('should render as expected with header title', async () => {
    await render();
    expect(screen.getByRole('banner')).toHaveTextContent('Test Header');
  });
  it('should render with custom text when process is archived', async () => {
    await render({ type: ProcessTaskType.Archived });
    const header = screen.getByRole('banner');
    expect(header).toHaveTextContent('Kvittering');
  });
  it('should not render progress', async () => {
    await render();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('should render progress', async () => {
    await render({ showProgress: true, order: ['1', '2', '3', '4', '5', '6'], currentPageId: '3' });
    screen.getByRole('progressbar', { name: /Side 3 av 6/i });
  });
  it('should not render progress when Archived', async () => {
    await render({
      type: ProcessTaskType.Archived,
      showProgress: true,
      order: ['1', '2', '3', '4', '5', '6'],
      currentPageId: '3',
    });
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
