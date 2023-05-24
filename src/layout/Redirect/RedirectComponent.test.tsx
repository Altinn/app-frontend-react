import React from 'react';

import { screen } from '@testing-library/react';

import { RedirectComponent } from 'src/layout/Redirect/RedirectComponent';
import { renderGenericComponentTest } from 'src/testUtils';
import type { RedirectStyle } from 'src/layout/Redirect/types';

describe('RedirectComponent', () => {
  it('should render link when style is link', () => {
    render({ title: 'Some title', target: 'https://www.digdir.no', style: 'link' });

    expect(screen.getByRole('link', { name: 'Some title' })).toBeInTheDocument();
  });

  it('should render button when style is primary', () => {
    render({ title: 'Some title', target: 'https://www.digdir.no', style: 'primary' });

    expect(screen.getByRole('button', { name: 'Some title' })).toBeInTheDocument();
  });

  it('should render button when style is secondary', () => {
    render({ title: 'Some title', target: 'https://www.digdir.no', style: 'secondary' });

    expect(screen.getByRole('button', { name: 'Some title' })).toBeInTheDocument();
  });

  it('should have correct link attributes when openInNewTab = true', () => {
    render({ title: 'Link to service', target: 'https://www.digdir.no/service', style: 'link', openInNewTab: true });

    expect(screen.getByRole('link', { name: 'Link to service' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Link to service' })).toHaveAttribute('rel', 'noreferrer');
    expect(screen.getByRole('link', { name: 'Link to service' })).toHaveAttribute(
      'href',
      'https://www.digdir.no/service',
    );
  });

  it('should have correct link attributes when openInNewTab = false', () => {
    render({ title: 'Link to service', target: 'https://www.digdir.no/service', style: 'link' });

    expect(screen.getByRole('link', { name: 'Link to service' })).not.toHaveAttribute('target');
    expect(screen.getByRole('link', { name: 'Link to service' })).not.toHaveAttribute('rel');
    expect(screen.getByRole('link', { name: 'Link to service' })).toHaveAttribute(
      'href',
      'https://www.digdir.no/service',
    );
  });

  it('should have correct button attributes when openInNewTab = true', () => {
    global.open = jest.fn();
    render({
      title: 'Button to service',
      target: 'https://www.digdir.no/service',
      style: 'primary',
      openInNewTab: true,
    });

    screen.getByRole('button', { name: 'Button to service' }).click();
    expect(global.open).toHaveBeenCalledWith('https://www.digdir.no/service', '_blank');
  });

  it('should have correct button attributes when openInNewTab = false', () => {
    global.open = jest.fn();
    render({
      title: 'Button to service',
      target: 'https://www.digdir.no/service',
      style: 'primary',
    });

    screen.getByRole('button', { name: 'Button to service' }).click();
    expect(global.open).toHaveBeenCalledWith('https://www.digdir.no/service', '_self');
  });
});

const render = ({ title, target, openInNewTab = false, style = 'primary' }) => {
  renderGenericComponentTest({
    type: 'Redirect',
    renderer: (props) => <RedirectComponent {...props} />,
    component: {
      id: 'some-id',
      textResourceBindings: {
        title,
        target,
      },
      openInNewTab,
      style: style as RedirectStyle,
    },
    genericProps: {
      getTextResourceAsString: (text) => text,
    },
  });
};
