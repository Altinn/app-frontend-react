import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { flattenParties, GetValidParties } from 'src/features/party/partyProviderUtils';
import { PartyType } from 'src/types/shared';
import type { IParty } from 'src/types/shared';

const setupParties = (): IParty[] => [
  {
    partyTypeName: PartyType.Organisation,
    name: 'Party1',
    partyId: 1,
    ssn: null,
    isDeleted: false,
    onlyHierarchyElementWithNoAccess: false,
    childParties: [
      {
        partyTypeName: PartyType.SubUnit,
        name: 'ChildParty1',
        partyId: 2,
        ssn: null,
        isDeleted: false,
        onlyHierarchyElementWithNoAccess: false,
      },
    ],
  },
  {
    partyTypeName: PartyType.Person,
    name: 'Party2',
    partyId: 3,
    ssn: null,
    isDeleted: false,
    onlyHierarchyElementWithNoAccess: false,
  },
];

describe('flattenParties', () => {
  it('should flatten nested parties correctly', () => {
    const parties = setupParties();

    const expectedOutput: IParty[] = [
      {
        isDeleted: false,
        name: 'Party2',
        onlyHierarchyElementWithNoAccess: false,
        partyId: 3,
        partyTypeName: 1,
        ssn: null,
      },
      {
        childParties: [
          {
            isDeleted: false,
            name: 'ChildParty1',
            onlyHierarchyElementWithNoAccess: false,
            partyId: 2,
            partyTypeName: 4,
            ssn: null,
          },
        ],
        isDeleted: false,
        name: 'Party1',
        onlyHierarchyElementWithNoAccess: false,
        partyId: 1,
        partyTypeName: 2,
        ssn: null,
      },
      {
        isDeleted: false,
        name: 'ChildParty1',
        onlyHierarchyElementWithNoAccess: false,
        partyId: 2,
        partyTypeName: 4,
        ssn: null,
      },
    ];

    const result = flattenParties(parties);
    expect(result.length).toBe(3);
    expect(result).toEqual(expect.arrayContaining(expectedOutput));
  });
});

describe('getValidParties', () => {
  it('should return all parties if non are allowed', () => {
    const parties = setupParties();
    const appMetadata = getApplicationMetadataMock();
    appMetadata.partyTypesAllowed = {
      organisation: false,
      subUnit: false,
      person: false,
      bankruptcyEstate: false,
    };

    const result = GetValidParties(parties, appMetadata);
    expect(result.length).toBe(3);
    expect(result).toEqual(expect.arrayContaining(parties));
  });

  it('should return all parties if all party types are allowed', () => {
    const parties = setupParties();
    const appMetadata = getApplicationMetadataMock();
    appMetadata.partyTypesAllowed = {
      organisation: true,
      subUnit: true,
      person: true,
      bankruptcyEstate: true,
    };

    const result = GetValidParties(parties, appMetadata);
    expect(result.length).toBe(3);
    expect(result).toEqual(expect.arrayContaining(parties));
  });

  it('should return only parties that are allowed by app metadata', () => {
    const parties = setupParties();
    const appMetadata = getApplicationMetadataMock();
    appMetadata.partyTypesAllowed = {
      organisation: true,
      subUnit: false,
      person: false,
      bankruptcyEstate: false,
    };

    const result = GetValidParties(parties, appMetadata);
    expect(result.length).toBe(1);
    expect(result).toEqual(expect.arrayContaining([parties[0]]));
  });

  it('should return only parties that are allowed by app metadata', () => {
    const parties = setupParties();
    const appMetadata = getApplicationMetadataMock();
    appMetadata.partyTypesAllowed = {
      organisation: false,
      subUnit: true,
      person: false,
      bankruptcyEstate: false,
    };

    const result = GetValidParties(parties, appMetadata);
    expect(result.length).toBe(1);
    expect(result).toEqual(expect.arrayContaining([parties[0].childParties![0]]));
  });
});
