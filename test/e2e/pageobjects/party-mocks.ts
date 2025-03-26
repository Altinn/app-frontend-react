import { PartyType } from 'src/types/shared';
import type { IncomingApplicationMetadata } from 'src/features/applicationMetadata/types';
import type { IParty } from 'src/types/shared';

const ExampleOrgWithSubUnit: IParty = {
  partyId: 500000,
  partyTypeName: PartyType.Organisation,
  orgNumber: '897069650',
  ssn: null,
  unitType: 'AS',
  name: 'DDG Fitness AS',
  isDeleted: false,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: [
    {
      partyId: 500001,
      partyTypeName: PartyType.Organisation,
      orgNumber: '897069651',
      ssn: null,
      unitType: 'BEDR',
      name: 'DDG Fitness Bergen',
      isDeleted: false,
      onlyHierarchyElementWithNoAccess: false,
      person: null,
      organization: null,
      childParties: null,
    },
  ],
};

const ExampleDeletedOrg: IParty = {
  partyId: 500600,
  partyTypeName: PartyType.Organisation,
  orgNumber: '897069631',
  ssn: null,
  unitType: 'AS',
  name: 'EAS Health Consulting',
  isDeleted: true,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: [],
};

const ExamplePerson1: IParty = {
  partyId: 12345678,
  partyTypeName: PartyType.Person,
  ssn: '12312312345',
  unitType: null,
  name: 'Fake Party',
  isDeleted: false,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: null,
};

const ExamplePerson2: IParty = {
  partyId: 12345679,
  partyTypeName: PartyType.Person,
  ssn: '12312312344',
  unitType: null,
  name: 'Fake Person2',
  isDeleted: false,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: null,
};

const InvalidParty: IParty = {
  partyId: 50085642,
  partyUuid: 'bb1aeb78-237e-47fb-b600-727803500985',
  partyTypeName: 1,
  orgNumber: '',
  ssn: '23033600534',
  unitType: null,
  name: 'RISHAUG JULIUS',
  isDeleted: false,
  onlyHierarchyElementWithNoAccess: false,
  person: null,
  organization: null,
  childParties: [],
};

export const CyPartyMocks = {
  ExampleOrgWithSubUnit,
  ExampleDeletedOrg,
  ExamplePerson1,
  ExamplePerson2,
  InvalidParty,
};

interface Mockable {
  parties?: IParty[] | ((parties: IParty[]) => IParty[]);
  allowedToInstantiate?: IParty[] | ((parties: IParty[]) => IParty[]);
  doNotPromptForParty?: boolean;
  appPromptForPartyOverride?: IncomingApplicationMetadata['promptForParty'];
  noActiveInstances?: boolean; // Defaults to true
  userParty?: IParty;
}

export function cyMockResponses(whatToMock: Mockable) {
  if (whatToMock.allowedToInstantiate) {
    cy.intercept('GET', '**/api/v1/parties?allowedtoinstantiatefilter=true', (req) => {
      req.continue((res) => {
        const body =
          whatToMock.allowedToInstantiate instanceof Function
            ? whatToMock.allowedToInstantiate(res.body)
            : whatToMock.allowedToInstantiate;
        res.send(200, body);
      });
    }).as('getAllowedToInstantiateParties'); // Unique alias for allowed parties
  }

  if (whatToMock.parties) {
    cy.intercept('GET', '**/api/v1/parties', (req) => {
      req.continue((res) => {
        const body = whatToMock.parties instanceof Function ? whatToMock.parties(res.body) : whatToMock.parties;
        res.send(200, body);
      });
    }).as('getAllParties'); // Unique alias for all parties
  }

  if (whatToMock.doNotPromptForParty !== undefined) {
    cy.intercept('GET', '**/api/v1/profile/user', (req) => {
      req.continue((res) =>
        res.send({
          ...res.body,
          profileSettingPreference: {
            doNotPromptForParty: whatToMock.doNotPromptForParty,
          },
        }),
      );
    }).as('getUserProfile'); // Unique alias for user profile
  }

  if (whatToMock.appPromptForPartyOverride !== undefined) {
    cy.intercept('GET', '**/api/v1/applicationmetadata', (req) => {
      req.on('response', (res) => {
        if (whatToMock.appPromptForPartyOverride !== undefined) {
          res.body.promptForParty = whatToMock.appPromptForPartyOverride;
        }
      });
    }).as('getApplicationMetadata'); // Unique alias for application metadata
  }

  if (whatToMock.noActiveInstances !== false) {
    cy.intercept('**/active', []).as('noActiveInstances'); // Unique alias for active instances
  }

  if (whatToMock.userParty) {
    cy.intercept('GET', '**/api/v1/profile/user', (req) => {
      req.continue((res) =>
        res.send({
          ...res.body,
          party: whatToMock.userParty,
        }),
      );
    }).as('getUserParty'); // Unique alias for user party
  }
}

export function removeAllButOneOrg(parties: IParty[]): IParty[] {
  // Some users in tt02 have so many valid parties that we get pagination. Remove all
  // except the first organisation, but keep all the persons.
  const toKeep: IParty[] = [];
  let foundOrganisation = false;
  for (const party of parties) {
    if (party.partyTypeName === PartyType.Organisation && !foundOrganisation) {
      toKeep.push(party);
      foundOrganisation = true;
    }
    if (party.partyTypeName === PartyType.Person) {
      toKeep.push(party);
    }
  }
  return toKeep;
}
