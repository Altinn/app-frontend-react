import React from 'react';

import { screen } from '@testing-library/react';

import { getInitialStateMock } from 'src/__mocks__/initialStateMock';
import { Lang } from 'src/features/language/Lang';
import { LanguageProvider } from 'src/features/language/LanguageProvider';
import * as useLanguage from 'src/features/language/useLanguage';
import { renderWithMinimalProviders } from 'src/test/renderWithProviders';

function TestSubject() {
  return (
    <div data-testid='test-subject'>
      <Lang id={'general.create_new'} />
    </div>
  );
}

describe('Lang', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should work properly', async () => {
    await renderWithMinimalProviders({
      renderer: () => (
        <LanguageProvider>
          <TestSubject />
        </LanguageProvider>
      ),
    });

    expect(console.error).not.toHaveBeenCalled();
    expect(screen.getByTestId('test-subject')).toHaveTextContent('Opprett ny');
  });

  it('should fallback if Language is not provided', async () => {
    await renderWithMinimalProviders({
      renderer: () => <TestSubject />,
    });

    expect(console.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Error: Language is missing') }),
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('The above error occurred in the <LangComponent> component'),
    );

    expect(screen.getByTestId('test-subject')).toHaveTextContent('Opprett ny');
  });

  it('should use the current language if it is provided when falling back after a failure', async () => {
    jest.spyOn(useLanguage, 'useLanguage').mockImplementation(() => {
      throw new Error('Lets pretend something went wrong');
    });

    await renderWithMinimalProviders({
      renderer: () => (
        <LanguageProvider>
          <TestSubject />
        </LanguageProvider>
      ),
      reduxState: getInitialStateMock((state) => {
        state.deprecated.currentLanguage = 'en';
      }),
    });

    expect(console.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Error: Lets pretend something went wrong') }),
    );
    expect(screen.getByTestId('test-subject')).toHaveTextContent('Create new');
  });
});
