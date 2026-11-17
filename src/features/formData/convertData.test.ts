import type { JSONSchema7 } from 'json-schema';

import { convertData } from 'src/features/formData/convertData';

describe('convertData', () => {
  describe.each(['date', 'date-time'])('string with format %s', (format) => {
    const schema: JSONSchema7 = { type: 'string', format };

    it.each(['2026-01-01', '2026-01-01T12:34:56.123+01:00'])('accepts %s', (value) => {
      expect(convertData(value, schema)).toEqual({ newValue: value, error: false });
    });

    it.each(['32.13.2026', '2026-13-32', '12.34.____'])('rejects %s', (value) => {
      expect(convertData(value, schema)).toEqual({ newValue: undefined, error: true });
    });
  });

  it('accepts any value for a string without a date format', () => {
    expect(convertData('32.13.2026', { type: 'string' })).toEqual({ newValue: '32.13.2026', error: false });
  });

  it('validates dates in an anyOf sub-schema', () => {
    const schema: JSONSchema7 = { anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] };
    expect(convertData('2026-01-01', schema)).toEqual({ newValue: '2026-01-01', error: false });
    expect(convertData('32.13.2026', schema)).toEqual({ newValue: undefined, error: true });
  });
});
