import { isInstantiationClosed } from 'src/features/instantiate/instantiationClosed';

describe('isInstantiationClosed', () => {
  const now = new Date('2026-10-21T12:00:00Z');
  const tt02Host = 'ttd.apps.tt02.altinn.no';
  const prodHost = 'ttd.apps.altinn.no';

  it.each([
    [undefined, false],
    [null, false],
    ['2026-10-21T11:59:59Z', true],
    ['2026-10-21T12:00:01Z', false],
    ['2026-10-21T11:59:59.1504337Z', true],
    ['2026-10-21T13:59:59+02:00', true],
    ['2026-10-21T14:00:01+02:00', false],
    ['2026-10-21T11:59:59', true],
    ['2026-10-21T12:00:01', false],
    ['2026-10-21', true],
    ['2026-10-22', false],
    ['not a date', false],
  ])('validTo %s gives %s', (validTo, expected) => {
    expect(isInstantiationClosed({ validTo }, now, tt02Host)).toBe(expected);
  });

  it.each([
    [prodHost, true, true],
    [prodHost, false, false],
    [tt02Host, true, false],
    ['local.altinn.cloud:8000', true, false],
  ])('on %s with disallowUserInstantiation %s gives %s', (host, disallowUserInstantiation, expected) => {
    expect(isInstantiationClosed({ disallowUserInstantiation }, now, host)).toBe(expected);
  });
});
