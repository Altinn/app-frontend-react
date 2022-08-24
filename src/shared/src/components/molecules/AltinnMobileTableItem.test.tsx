import React from 'react';
import { render as renderRtl, screen } from '@testing-library/react';
import type {
  IAltinnMobileTableItemProps,
  IMobileTableItem,
} from './AltinnMobileTableItem';
import AltinnMobileTableItem from './AltinnMobileTableItem';

describe('AltinnMobileTableItem', () => {
  it('renders delete icon-button when deleteIconNode is given as property', () => {
    render({ deleteIconNode: 'Delete' });

    expect(
      screen.getByRole('button', {
        name: /delete/i,
      }),
    ).toBeInTheDocument();
  });

  it('does not render delete icon-button when deleteIconNode is not given as property', () => {
    render();

    expect(
      screen.queryByRole('button', {
        name: /delete/i,
      }),
    ).not.toBeInTheDocument();
  });
});

const render = (props: Partial<IAltinnMobileTableItemProps> = {}) => {
  const items = [
    { key: 'test1', label: 'label1', value: 'value1' },
    { key: 'test2', label: 'label2', value: 'value2' },
  ] as IMobileTableItem[];

  const allProps = {
    items: items,
    onEditClick: jest.fn(),
    onDeleteClick: jest.fn(),
    editIconNode: 'Edit',
    ...props,
  } as IAltinnMobileTableItemProps;

  return renderRtl(<AltinnMobileTableItem {...allProps} />);
};
