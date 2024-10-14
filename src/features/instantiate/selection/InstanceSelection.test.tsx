import React from 'react';

import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { InstanceSelectionWrapper } from 'src/features/instantiate/selection/InstanceSelection';
import { mockMediaQuery } from 'src/test/mockMediaQuery';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import type { ISimpleInstance } from 'src/types';

jest.mock('react-helmet-async');

const mockActiveInstances: ISimpleInstance[] = [
  {
    id: 'some-id',
    lastChanged: '2021-10-05T07:51:57.8795258Z',
    lastChangedBy: 'Navn Navnesen',
  },
  {
    id: 'some-other-id',
    lastChanged: '2021-05-13T07:51:57.8795258Z',
    lastChangedBy: 'Kåre Nordmannsen',
  },
];

const render = async (instances = mockActiveInstances) =>
  await renderWithInstanceAndLayout({
    renderer: () => <InstanceSelectionWrapper />,
    queries: {
      fetchActiveInstances: () => Promise.resolve(instances || []),
    },
  });

const { setScreenWidth } = mockMediaQuery(992);

describe('InstanceSelection', () => {
  beforeEach(() => {
    // Set screen size to desktop
    setScreenWidth(1200);
  });

  it('should show full size table for larger devices', async () => {
    const { container } = await render();

    const altinnTable = container.querySelector('#instance-selection-table');
    expect(altinnTable).not.toBeNull();
  });

  it('should display mobile table for smaller devices', async () => {
    // Set screen size to mobile
    setScreenWidth(600);
    const { container } = await render();

    const altinnMobileTable = container.querySelector('#instance-selection-mobile-table');
    expect(altinnMobileTable).not.toBeNull();
  });

  it('should display active instances', async () => {
    await render();

    const firstInstanceChangedBy = await screen.findByText(mockActiveInstances[0].lastChangedBy);
    const secondInstanceChangedBy = await screen.findByText(mockActiveInstances[1].lastChangedBy);

    const firstInstanceLastChanged = await screen.findByText('10/05/2021');
    const secondInstanceLastChanged = await screen.findByText('05/13/2021');

    expect(firstInstanceChangedBy).not.toBeNull();
    expect(secondInstanceChangedBy).not.toBeNull();

    expect(firstInstanceLastChanged).not.toBeNull();
    expect(secondInstanceLastChanged).not.toBeNull();
  });

  it('pressing "Start på nytt" should trigger callback', async () => {
    const { mutations } = await render();
    await userEvent.click(screen.getByText(/start på nytt/i));
    expect(mutations.doInstantiate.mock).toBeCalledTimes(1);
  });

  it('should trigger openInstance on editButton click', async () => {
    const { mutations } = await render();
    const row = screen.getByRole('row', {
      name: /10\/05\/2021 navn navnesen fortsett her/i,
    });
    expect(window.location.href).toBe('https://local.altinn.cloud/ttd/test');

    const button = within(row).getByRole('button', {
      name: /fortsett her/i,
    });

    await userEvent.click(button);
    expect(window.location.href).toBe('https://local.altinn.cloud/ttd/test#/instance/some-id');
    expect(mutations.doInstantiate.mock).toBeCalledTimes(0);
  });

  it('should trigger openInstance on editButton click during mobile view', async () => {
    // Set screen size to mobile
    setScreenWidth(600);
    const { mutations } = await render();

    const row = screen.getByRole('row', {
      name: /Sist endret: 05\/13\/2021 Endret av: Kåre Nordmannsen/i,
    });
    expect(window.location.href).toBe('https://local.altinn.cloud/ttd/test#/instance/some-id');

    const button = within(row).getByRole('button', {
      name: /fortsett her/i,
    });

    await userEvent.click(button);
    expect(window.location.href).toBe('https://local.altinn.cloud/ttd/test#/instance/some-other-id');
    expect(mutations.doInstantiate.mock).toBeCalledTimes(0);
  });
});
