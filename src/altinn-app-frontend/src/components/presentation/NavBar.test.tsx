import React from 'react';
import NavBar, { INavBarProps } from './NavBar';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, setupServer } from '../../../testUtils';
import { rest } from 'msw';


const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderNavBar = (props?: Partial<INavBarProps>) => {
  const mockClose = jest.fn();
  const mockBack = jest.fn();
  const mockAppLanguageChange = jest.fn();
  server.use(rest.get(
    'applicationlanguages',
    (req, res, ctx) => {
      const mockApiResponse = [
        {
          language: 'nb',
        },
        {
          language: 'en',
        },
      ];
      return res(ctx.json(mockApiResponse));
    },
  ));
  renderWithProviders(
    <NavBar
      handleClose={mockClose}
      handleBack={mockBack}
      {...props}
    />, { preloadedState: { language: { selectedAppLanguage: 'nb', language: {}, error: null } } },
  );

  return { mockClose, mockBack, mockAppLanguageChange };
};

describe('components/presentation/NavBar.tsx', () => {
  it('should render close button', async () => {
    const { mockClose } = renderNavBar();
    const closeButton = screen.getByRole('button', { name: /Lukk Skjema/i });
    // Should not render back button
    expect(screen.queryAllByRole('button')).toHaveLength(1);
    await userEvent.click(closeButton);
    expect(mockClose).toHaveBeenCalled();
  });

  it('should hide close button', () => {
    renderNavBar();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should hide back button', () => {
    renderNavBar();
    expect(screen.queryByTestId('altinn-back-button')).toBeNull();
  });

  it('should render back button', async () => {
    const { mockBack } = renderNavBar({ showBackArrow: true });
    const backButton = screen.getByTestId('altinn-back-button');
    await userEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();
  });
  it('should render app language', async () => {
    const { mockAppLanguageChange } = renderNavBar();
    const dropdown = screen.getByRole('combobox', { name: /Språk/i });
    await userEvent.selectOptions(dropdown, 'en');
    expect(mockAppLanguageChange).toHaveBeenCalledWith('en');
  });
  it('should not render app language combobox', async () => {
    renderNavBar();
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });
});
