import { checkValidOrgnNr } from 'src/layout/OrganisationLookup/validation';

describe('CheckValidOrgNr', () => {
  it('should return true when the orgNr is valid', () => {
    expect(checkValidOrgnNr('043871668')).toBe(true);
  });
  it('should return false when the orgNr is invalid', () => {
    expect(checkValidOrgnNr('143871668')).toBe(false);
  });
});
