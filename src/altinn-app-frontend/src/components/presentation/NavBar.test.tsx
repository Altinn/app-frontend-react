import React from 'react';
import NavBar, { INavBarProps } from './NavBar';
import { screen } from '@testing-library/react';
import { getLanguageFromCode } from 'altinn-shared/language';
import userEvent from '@testing-library/user-event';
import { IAppLanguage } from 'altinn-shared/types';
import { renderWithProviders } from '../../../testUtils';

const renderNavBar = (props?: Partial<INavBarProps>) => {
  const mockClose = jest.fn();
  const mockBack = jest.fn();
  const mockAppLanguageChange = jest.fn();
  const mockAppLanguages: IAppLanguage[] = [
    {
      language: 'nb',
    },
    {
      language: 'en',
    },
  ];
  renderWithProviders(
    <NavBar
      language={getLanguageFromCode('nb')}
      handleClose={mockClose}
      handleBack={mockBack}
      appLanguages={mockAppLanguages}
      onAppLanguageChange={mockAppLanguageChange}
      selectedAppLanguage={'nb'}
      {...props}
    />,
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
    renderNavBar({ hideCloseButton: true });
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should render back button', async () => {
    const { mockBack } = renderNavBar({ showBackArrow: true });
    const backButton = screen.getByRole('button', { name: /Tilbake/i });
    await userEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();
  });
  it('should render app language', async () => {
    const { mockAppLanguageChange } = renderNavBar({
      showLanguageSelector: true,
    });
    const dropdown = screen.getByRole('combobox', { name: /Språk/i });
    await userEvent.selectOptions(dropdown, 'en');
    expect(mockAppLanguageChange).toHaveBeenCalledWith('en');
  });
  it('should not render app language combobox', async () => {
    renderNavBar();
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
  });
});
