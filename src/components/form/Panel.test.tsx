import React from 'react';

import { screen } from '@testing-library/react';

import { getVariant, Panel, PanelVariant } from 'src/components/form/Panel';
import { FormComponentContextProvider } from 'src/layout/FormComponentContext';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import type { IPanelProps } from 'src/components/form/Panel';
import type { IFormComponentContext } from 'src/layout/FormComponentContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

describe('Panel', () => {
  it('should show icon when showIcon is true', async () => {
    await render({ showIcon: true });
    expect(screen.getByTestId('panel-icon-info')).toBeInTheDocument();
  });

  it('should not show icon when showIcon is false', async () => {
    await render({ showIcon: false });
    expect(screen.queryByTestId('panel-icon-info')).not.toBeInTheDocument();
  });

  describe('getVariant', () => {
    it('should return correctly mapped variant', () => {
      expect(getVariant({ variant: 'info' })).toBe(PanelVariant.Info);
      expect(getVariant({ variant: 'success' })).toBe(PanelVariant.Success);
      expect(getVariant({ variant: 'warning' })).toBe(PanelVariant.Warning);
    });

    it('should return PanelVariant.Info when no variant is passed', () => {
      expect(getVariant()).toBe(PanelVariant.Info);
    });

    it('should return PanelVariant.Info when the wrong variant is passed', () => {
      expect(getVariant({ variant: 'invalid' as 'warning' })).toBe(PanelVariant.Info);
    });
  });

  describe('FullWidthWrapper', () => {
    it('should render FullWidthWrapper if no grid or baseComponentId is supplied', async () => {
      await render({ variant: 'info' }, { grid: undefined });
      const fullWidthWrapper = screen.queryByTestId('fullWidthWrapper');
      expect(fullWidthWrapper).toBeInTheDocument();
    });

    it('should not render FullWidthWrapper if grid is supplied in context', async () => {
      await render({ variant: 'info' }, { grid: { md: 5 } });
      const fullWidthWrapper = screen.queryByTestId('fullWidthWrapper');
      expect(fullWidthWrapper).not.toBeInTheDocument();
    });

    it('should not render FullWidthWrapper if baseComponentId is supplied in context', async () => {
      await render({ variant: 'info' }, { baseComponentId: 'some-id' });
      const fullWidthWrapper = screen.queryByTestId('fullWidthWrapper');
      expect(fullWidthWrapper).not.toBeInTheDocument();
    });
  });
});

const render = async (props: Partial<IPanelProps> = {}, suppliedContext: Partial<IFormComponentContext> = {}) => {
  const allProps = {
    title: 'Panel Title',
    children: 'Panel Content',
    variant: 'info' as const,
    showIcon: false,
    showPointer: false,
    ...props,
  };

  await renderWithInstanceAndLayout({
    renderer: () => (
      <FormComponentContextProvider
        value={{
          baseComponentId: undefined,
          node: undefined as unknown as LayoutNode,
          id: 'some-id',
          ...suppliedContext,
        }}
      >
        <Panel {...allProps} />
      </FormComponentContextProvider>
    ),
  });
};
