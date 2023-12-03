import React from 'react';

import { screen } from '@testing-library/react';

import { Header } from 'src/components/presentation/Header';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import { PageNavigationRouter } from 'src/test/routerUtils';
import type { ProcessTaskType } from 'src/types';

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
});
