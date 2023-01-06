import React from 'react';
import { Provider } from 'react-redux';

import { renderHook } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { useDisplayData } from 'src/components/hooks/useDisplayData';

const createStore = configureStore();
const mockLanguage = {
  general: {
    empty_summary: 'You have not entered any information here',
  },
};
const mockStore = createStore({ language: { language: mockLanguage } });
const wrapper = ({ children }) => <Provider store={mockStore}>{children}</Provider>;

describe('useDisplayData', () => {
  test('should show "You have not entered any information here" if formData is undefined', async () => {
    expect(renderHook(() => useDisplayData({ formData: undefined }), { wrapper }).result.current).toBe(
      'You have not entered any information here',
    );
  });

  test('should handle formData as object', async () => {
    const { result } = renderHook(
      () =>
        useDisplayData({
          formData: {
            value: 'some value in an object',
            value2: 'other value',
          },
        }),
      { wrapper },
    );
    expect(result.current).toBe('some value in an object other value');
  });
  test('should handle formData as array', async () => {
    const { result } = renderHook(() => useDisplayData({ formData: ['values', 'in', 'an', 'array'] }), { wrapper });
    expect(result.current).toBe('values in an array');
  });

  test('should handle formData as single value', async () => {
    const { result } = renderHook(() => useDisplayData({ formData: 'single value' }), { wrapper });
    expect(result.current).toBe('single value');
  });
});
