import React from 'react';

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import mockAxios from 'jest-mock-axios';

import { NavBar } from 'src/components/presentation/NavBar';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import type { PresentationType, ProcessTaskType } from 'src/types';

afterEach(() => mockAxios.reset());

interface RenderNavBarProps {
  currentPageId?: string;
  hideCloseButton: boolean;
  type?: ProcessTaskType | PresentationType;
  initialPage?: string;
}

const render = async ({ hideCloseButton, initialPage }: RenderNavBarProps) => {
  await renderWithInstanceAndLayout({
    renderer: () => <NavBar />,
    initialPage,
    queries: {
      fetchLayoutSettings: () => Promise.resolve({ pages: { hideCloseButton, order: ['1', '2', '3'] } }),
    },
  });
};

describe('NavBar', () => {
  it('should render nav', async () => {
    await render({
      hideCloseButton: true,
    });
    screen.getByRole('navigation', { name: /Appnavigasjon/i });
  });

  it('should render close button', async () => {
    const assignMock = jest.fn();
    jest.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign: assignMock });

    await render({
      hideCloseButton: false,
    });
    const closeButton = screen.getByRole('button', { name: /tilbake til innboks/i });
    await userEvent.click(closeButton);
    expect(assignMock).toHaveBeenCalled();
  });

  it('should hide close button', async () => {
    await render({
      hideCloseButton: true,
    });
    expect(screen.queryByRole('button', { name: /tilbake til innboks/i })).not.toBeInTheDocument();
  });
});
