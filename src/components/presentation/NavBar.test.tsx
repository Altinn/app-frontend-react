import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import mockAxios from 'jest-mock-axios';

import { getFormLayoutStateMock } from 'src/__mocks__/getFormLayoutStateMock';
import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { NavBar } from 'src/components/presentation/NavBar';
import { mockWindow } from 'src/test/mockWindow';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import { ProcessTaskType } from 'src/types';
import type { IRawTextResource } from 'src/features/language/textResources';
import type { PresentationType } from 'src/types';
import type { IAppLanguage } from 'src/types/shared';

afterEach(() => mockAxios.reset());

interface RenderNavBarProps {
  currentPageId?: string;
  hideCloseButton: boolean;
  languageResponse?: IAppLanguage[];
  showLanguageSelector: boolean;
  textResources?: IRawTextResource[];
  type?: ProcessTaskType | PresentationType;
  initialPage?: string;
}

const render = async ({
  hideCloseButton,
  showLanguageSelector,
  languageResponse,
  type = ProcessTaskType.Data,
  initialPage,
  textResources = [],
}: RenderNavBarProps) => {
  await renderWithInstanceAndLayout({
    renderer: () => <NavBar type={type} />,
    reduxState: {
      ...getInitialStateMock(),
      formLayout: getFormLayoutStateMock({}),
    },
    initialPage,
    queries: {
      fetchAppLanguages: () =>
        languageResponse ? Promise.resolve(languageResponse) : Promise.reject(new Error('No languages mocked')),
      fetchTextResources: () => Promise.resolve({ language: 'nb', resources: textResources }),
      fetchLayoutSettings: () =>
        Promise.resolve({ pages: { hideCloseButton, showLanguageSelector, order: ['1', '2', '3'] } }),
    },
    reduxGateKeeper: (action) => 'type' in action && action.type === 'deprecated/setCurrentLanguage',
  });
};

describe('NavBar', () => {
  const { mockAssign } = mockWindow();
  it('should render nav', async () => {
    await render({
      hideCloseButton: true,
      showLanguageSelector: false,
    });
    screen.getByRole('navigation', { name: /Appnavigasjon/i });
  });

  it('should render close button', async () => {
    await render({
      hideCloseButton: false,
      showLanguageSelector: false,
    });
    const closeButton = screen.getByRole('button', { name: /Lukk Skjema/i });
    await userEvent.click(closeButton);
    expect(mockAssign).toHaveBeenCalled();
  });

  it('should hide close button and back button', async () => {
    await render({
      hideCloseButton: true,
      showLanguageSelector: false,
    });
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByTestId('form-back-button')).toBeNull();
  });

  it('should render back button', async () => {
    await render({
      hideCloseButton: true,
      showLanguageSelector: false,
      type: ProcessTaskType.Data,
      initialPage: '2',
    });
    expect(screen.getByTestId('form-back-button')).toBeInTheDocument();
  });
  it('should render and change app language', async () => {
    await render({
      hideCloseButton: false,
      showLanguageSelector: true,
      languageResponse: [{ language: 'en' }, { language: 'nb' }],
    });

    await userEvent.click(screen.getByRole('combobox', { name: /Språk/i }));
    const en = screen.getByText(/Engelsk/i, { selector: '[role=option]' });
    await userEvent.click(en);

    // Language now changed, so the value should be the language name in the selected language
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Language/i })).toHaveValue('English');
    });
  });
  it('should render app language with custom labels', async () => {
    await render({
      hideCloseButton: false,
      showLanguageSelector: true,
      textResources: [
        { id: 'language.selector.label', value: 'Velg språk test' },
        { id: 'language.full_name.nb', value: 'Norsk test' },
        { id: 'language.full_name.en', value: 'Engelsk test' },
      ],
      languageResponse: [{ language: 'en' }, { language: 'nb' }],
    });

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    screen.getByRole('combobox', { name: /Velg språk test/i });
    screen.getByText(/Norsk test/i, { selector: '[role=option]' });
    screen.getByText(/Engelsk test/i, { selector: '[role=option]' });
  });
});
