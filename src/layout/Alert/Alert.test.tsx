import React from 'react';

import { screen } from '@testing-library/react';

import { Alert } from 'src/layout/Alert/Alert';
import { renderGenericComponentTest } from 'src/testUtils';
import type { ILayoutCompAlertBase } from 'src/layout/Alert/types';

describe('Alert', () => {
  it('should display title', () => {
    render({ title: 'Title for alert' });
    expect(screen.getByText(/title for alert/i)).toBeInTheDocument();
  });

  it('should display description', () => {
    render({ description: 'Description for alert' });
    expect(screen.getByText(/description for alert/i)).toBeInTheDocument();
  });

  it('should display as role="alert" when useAsAlert is true', () => {
    render({ title: 'title for alert', useAsAlert: true });
    expect(screen.getByRole('alert', { name: /title for alert/i })).toBeInTheDocument();
  });

  it('should not display as role="alert" when useAsAlert is false', () => {
    render({ title: 'title for alert', useAsAlert: false });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

const render = ({
  severity,
  useAsAlert,
  title,
  description,
}: Partial<ILayoutCompAlertBase> & { title?: string; description?: string } = {}) =>
  renderGenericComponentTest({
    type: 'Alert',
    renderer: (props) => <Alert {...props} />,
    component: {
      id: 'alert-box',
      textResourceBindings: {
        title,
        description,
      },
      severity,
      useAsAlert,
    },
  });
