import * as React from 'react';
import type { IParty } from 'altinn-shared/types';

import AltinnParty from './altinnParty';
import { renderWithProviders } from '../../../testUtils';
import userEvent from '@testing-library/user-event';

describe('altinnParty', () => {
  let mockParty: IParty;
  let selectedParty: IParty;
  let onSelectPartyMock: (party: IParty) => void;

  beforeEach(() => {
    mockParty = {
      childParties: [],
      partyId: 'partyId',
      partyTypeName: 1,
      orgNumber: null,
      ssn: 'ssn',
      unitType: 'test',
      name: 'Testing Testing',
      isDeleted: false,
      onlyHierarchyElementWithNoAccess: false,
    };
    selectedParty = null;
    onSelectPartyMock = (party: IParty) => (selectedParty = party);
  });
  const render = () => {
    return renderWithProviders(
      <AltinnParty
        party={mockParty}
        onSelectParty={onSelectPartyMock}
        showSubUnits={true}
      />,
    );
  };
  it('should use callback to select party', async () => {
    const { container } = render();
    const element = container.querySelector(`#party-${mockParty.partyId}`);
    await userEvent.click(element);
    expect(selectedParty).toEqual(mockParty);
  });
  describe('should render with correct icon based on what kind of party it is', () => {
    it("should render with class 'fa fa-private' if party is a person", () => {
      const { container } = render();
      expect(container.querySelector('i.fa.fa-private')).toBeInTheDocument();
    });
    it("should render with class 'fa fa-corp' if party is a organisation", () => {
      mockParty.orgNumber = 1000000;
      const { container } = render();
      expect(container.querySelector('i.fa.fa-corp')).toBeInTheDocument();
    });
  });
});
