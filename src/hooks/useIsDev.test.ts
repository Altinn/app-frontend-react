import { useIsDev } from 'src/hooks/useIsDev';

const location = window.location;

function mockHostName(host: string) {
  jest.spyOn(window, 'location', 'get').mockReturnValue({ ...location, host });
}

describe('useIsDev', () => {
  beforeEach(() => {
    jest.spyOn(window, 'location', 'get').mockRestore();
  });

  it('should return true if host is local.altinn.cloud', () => {
    mockHostName('local.altinn.cloud');
    expect(window.location.host).toBe('local.altinn.cloud');
    expect(useIsDev()).toBe(true);
  });

  it('should return true if host is dev.altinn.studio', () => {
    mockHostName('dev.altinn.studio');
    expect(window.location.host).toBe('dev.altinn.studio');
    expect(useIsDev()).toBe(true);
  });

  it('should return true if host is altinn.studio', () => {
    mockHostName('altinn.studio');
    expect(window.location.host).toBe('altinn.studio');
    expect(useIsDev()).toBe(true);
  });

  it('should return true if host is studio.localhost', () => {
    mockHostName('studio.localhost');
    expect(window.location.host).toBe('studio.localhost');
    expect(useIsDev()).toBe(true);
  });

  it('should return false if host is altinn3local.no', () => {
    mockHostName('altinn3local.no');
    expect(window.location.host).toBe('altinn3local.no');
    expect(useIsDev()).toBe(false);
    expect(useIsDev({ includeTT02: true })).toBe(false);
  });

  it('should return true/false if host is ttd.apps.tt02.altinn.no depending on includeTT02', () => {
    mockHostName('ttd.apps.tt02.altinn.no');
    expect(window.location.host).toBe('ttd.apps.tt02.altinn.no');
    expect(useIsDev({ includeTT02: true })).toBe(true);
    expect(useIsDev({ includeTT02: false })).toBe(false);
  });

  it('should never return true if the host is ttd.apps.altinn.no', () => {
    mockHostName('ttd.apps.altinn.no');
    expect(window.location.host).toBe('ttd.apps.altinn.no');
    expect(useIsDev({ includeTT02: true })).toBe(false);
    expect(useIsDev({ includeTT02: false })).toBe(false);
  });
});
