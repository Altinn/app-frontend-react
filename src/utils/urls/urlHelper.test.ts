import {
  customEncodeURI,
  getDialogIdFromDataValues,
  logoutUrlAltinn,
  makeUrlRelativeIfSameDomain,
  returnBaseUrlToAltinn,
  returnUrlToAllSchemas,
  returnUrlToArchive,
  returnUrlToMessagebox,
  returnUrlToProfile,
} from 'src/utils/urls/urlHelper';

const originTT = 'https://ttd.apps.tt02.altinn.no/tdd/tjeneste-20190826-1130';
const originAT = 'https://ttd.apps.at21.altinn.cloud/tdd/tjeneste-20190826-1130';
const originYT = 'https://ttd.apps.yt01.altinn.cloud/tdd/tjeneste-20190826-1130';
const originProd = 'https://ttd.apps.altinn.no/tdd/tjeneste-20190826-1130';
const originLocalCloud = 'http://local.altinn.cloud/ttd/myapp';
const originLocalCloudWithPort = 'http://local.altinn.cloud:8000/ttd/myapp';
const originLocal = 'http://altinn3local.no/ttd/myapp';
const originUnknown = 'https://www.vg.no';

describe('Shared urlHelper.ts', () => {
  test('returnUrlToMessagebox() returning production arbeidsflate', () => {
    const origin = 'https://tdd.apps.altinn.no/tdd/myappname';
    expect(returnUrlToMessagebox(origin)).toBe('https://af.altinn.no/');
  });

  test('returnUrlToMessagebox() returning at21 arbeidsflate', () => {
    const origin = 'https://tdd.apps.at21.altinn.cloud/tdd/myappname';
    expect(returnUrlToMessagebox(origin)).toBe('https://af.at21.altinn.cloud/');
  });

  test('returnUrlToMessagebox() returning tt02 arbeidsflate', () => {
    const origin = 'https://tdd.apps.tt02.altinn.no/tdd/myappname';
    expect(returnUrlToMessagebox(origin)).toBe('https://af.tt02.altinn.no/');
  });

  test('returnUrlToMessagebox() returning null when unknown origin', () => {
    const origin = 'https://www.vg.no';
    expect(returnUrlToMessagebox(origin)).toBe(null);
  });

  test('returnUrlToMessagebox() returning / for local.altinn.cloud', () => {
    expect(returnUrlToMessagebox(originLocalCloud)).toBe('/');
    expect(returnUrlToMessagebox(originLocalCloudWithPort)).toBe('/');
  });

  test('returnUrlToMessagebox() returning / for altinn3local.no', () => {
    expect(returnUrlToMessagebox(originLocal)).toBe('/');
  });

  test('returnBaseUrlToAltinn() returning correct environments', () => {
    expect(returnBaseUrlToAltinn(originTT)).toContain('tt02.altinn.no');
    expect(returnBaseUrlToAltinn(originAT)).toContain('at21.altinn.cloud');
    expect(returnBaseUrlToAltinn(originYT)).toContain('yt01.altinn.cloud');
    expect(returnBaseUrlToAltinn(originProd)).toContain('altinn.no');
    expect(returnBaseUrlToAltinn(originUnknown)).toBe(null);
  });

  test('returnBaseUrlToAltinn() returning / for local environments', () => {
    expect(returnBaseUrlToAltinn(originLocalCloud)).toBe('/');
    expect(returnBaseUrlToAltinn(originLocalCloudWithPort)).toBe('/');
    expect(returnBaseUrlToAltinn(originLocal)).toBe('/');
  });

  test('returnUrlToProfile() returning correct environments', () => {
    expect(returnUrlToProfile(originTT)).toBe('https://af.tt02.altinn.no/profile');
    expect(returnUrlToProfile(originAT)).toBe('https://af.at21.altinn.cloud/profile');
    expect(returnUrlToProfile(originYT)).toBe('https://af.yt01.altinn.cloud/profile');
    expect(returnUrlToProfile(originProd)).toBe('https://af.altinn.no/profile');
    expect(returnUrlToProfile(originUnknown)).toBe(null);
  });

  test('returnUrlToProfile() returning /profile for local environments', () => {
    expect(returnUrlToProfile(originLocalCloud)).toBe('/profile');
    expect(returnUrlToProfile(originLocalCloudWithPort)).toBe('/profile');
    expect(returnUrlToProfile(originLocal)).toBe('/profile');
  });

  test('returnUrlAllSchemas() returning correct environments', () => {
    expect(returnUrlToAllSchemas(originTT)).toContain('tt02.altinn.no/skjemaoversikt');
    expect(returnUrlToAllSchemas(originAT)).toContain('at21.altinn.cloud/skjemaoversikt');
    expect(returnUrlToAllSchemas(originYT)).toContain('yt01.altinn.cloud/skjemaoversikt');
    expect(returnUrlToAllSchemas(originProd)).toContain('altinn.no/skjemaoversikt');
    expect(returnUrlToAllSchemas(originUnknown)).toBe(null);
  });

  test('returnUrlToArchive() returning / for local environments', () => {
    const partyId = 12345;
    expect(returnUrlToArchive(originLocalCloud, partyId)).toBe('/');
    expect(returnUrlToArchive(originLocalCloudWithPort, partyId)).toBe('/');
    expect(returnUrlToArchive(originLocal, partyId)).toBe('/');
  });

  test('returnUrlToArchive() returning / for local environments with dialogId', () => {
    const partyId = 12345;
    const dialogId = '123e4567-e89b-12d3-a456-426614174000';
    expect(returnUrlToArchive(originLocalCloud, partyId, dialogId)).toBe('/');
    expect(returnUrlToArchive(originLocalCloudWithPort, partyId, dialogId)).toBe('/');
    expect(returnUrlToArchive(originLocal, partyId, dialogId)).toBe('/');
  });

  test('returnUrlToArchive() returning correct environments without partyId', () => {
    expect(returnUrlToArchive(originTT, undefined)).toBe('https://af.tt02.altinn.no/');
    expect(returnUrlToArchive(originAT, undefined)).toBe('https://af.at21.altinn.cloud/');
    expect(returnUrlToArchive(originYT, undefined)).toBe('https://af.yt01.altinn.cloud/');
    expect(returnUrlToArchive(originProd, undefined)).toBe('https://af.altinn.no/');
    expect(returnUrlToArchive(originUnknown, undefined)).toBe(null);
  });

  test('getDialogIdFromDataValues() extracts dialog.id correctly', () => {
    expect(getDialogIdFromDataValues({ 'dialog.id': 'abc-123' })).toBe('abc-123');
    expect(getDialogIdFromDataValues({ 'dialog.id': '019aa5f7-ac49-7a56-a824-0381f3603e38' })).toBe(
      '019aa5f7-ac49-7a56-a824-0381f3603e38',
    );
    expect(getDialogIdFromDataValues({ 'dialog.id': 123456 })).toBe('123456');
  });

  test('getDialogIdFromDataValues() returns undefined for invalid data', () => {
    expect(getDialogIdFromDataValues(null)).toBe(undefined);
    expect(getDialogIdFromDataValues(undefined)).toBe(undefined);
    expect(getDialogIdFromDataValues({})).toBe(undefined);
    expect(getDialogIdFromDataValues('string')).toBe(undefined);
    expect(getDialogIdFromDataValues({ 'dialog.id': true })).toBe(undefined);
    expect(getDialogIdFromDataValues({ 'dialog.id': null })).toBe(undefined);
    expect(getDialogIdFromDataValues({ dialog: { id: 'nested' } })).toBe(undefined);
  });

  test('customEncodeURI() returning correct encoding', () => {
    const uri1 = 'https://ttd.apps.tt02.altinn.no/tdd/tjeneste-20190826-1130';
    const uri2 = 'attachment [example].png';
    const uri3 = 'attachment (example).gif';
    const uri4 = 'attachment (example) (1) (2).gif';
    expect(customEncodeURI(uri1)).toBe('https%3A%2F%2Fttd.apps.tt02.altinn.no%2Ftdd%2Ftjeneste-20190826-1130');
    expect(customEncodeURI(uri2)).toBe('attachment%20%5Bexample%5D.png');
    expect(customEncodeURI(uri3)).toBe('attachment%20%28example%29.gif');
    expect(customEncodeURI(uri4)).toBe('attachment%20%28example%29%20%281%29%20%282%29.gif');
  });

  test('logoutUrlAltinn() should return correct url for each env.', () => {
    const originTT = 'https://ttd.apps.tt02.altinn.no/tdd/tjeneste-20190826-1130';
    const originAT = 'https://ttd.apps.at21.altinn.cloud/tdd/tjeneste-20190826-1130';
    const originYT = 'https://ttd.apps.yt01.altinn.cloud/tdd/tjeneste-20190826-1130';
    const originProd = 'https://ttd.apps.altinn.no/tdd/tjeneste-20190826-1130';
    expect(logoutUrlAltinn(originTT)).toContain('tt02.altinn.no/ui/authentication/LogOut');
    expect(logoutUrlAltinn(originAT)).toContain('at21.altinn.cloud/ui/authentication/LogOut');
    expect(logoutUrlAltinn(originYT)).toContain('yt01.altinn.cloud/ui/authentication/LogOut');
    expect(logoutUrlAltinn(originProd)).toContain('altinn.no/ui/authentication/LogOut');
  });

  test('makeUrlRelativeIfSameDomain()', () => {
    // Simple testcase make relative
    expect(
      makeUrlRelativeIfSameDomain('https://altinn3local.no/asdf', {
        hostname: 'altinn3local.no',
      } as Location),
    ).toBe('/asdf');
    // Simple testcase domains don't match
    expect(
      makeUrlRelativeIfSameDomain('https://altinn3local.no/asdf', {
        hostname: 'altinn3localno',
      } as Location),
    ).toBe('https://altinn3local.no/asdf');
    // Test with dummyurl
    expect(
      makeUrlRelativeIfSameDomain('dummyurl', {
        hostname: 'altinn3local.no',
      } as Location),
    ).toBe('dummyurl');

    // Test with non-standard port
    expect(
      makeUrlRelativeIfSameDomain('https://altinn3local.no:8080/', {
        hostname: 'altinn3local.no',
      } as Location),
    ).toBe('/');
    expect(
      makeUrlRelativeIfSameDomain('https://altinn3local.no:8080/', {
        hostname: 'altinn3local.no',
      } as Location),
    ).toBe('/');
  });
});
