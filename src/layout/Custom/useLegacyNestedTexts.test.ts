import { convertToLegacyNestedTexts } from 'src/layout/Custom/useLegacyNestedTexts';
import type { FixedLanguageList } from 'src/language/languages';

describe('useLegacyNestedTexts', () => {
  const exampleInput = {
    'example.key': 'example-value',
    'example.key2': 'example-value2',
    'other.nested.key': 'other-nested-value',
    'other.nested.key2': 'other-nested-value2',
  };

  const expected = {
    example: {
      key: 'example-value',
      key2: 'example-value2',
    },
    other: {
      nested: {
        key: 'other-nested-value',
        key2: 'other-nested-value2',
      },
    },
  };

  it('should return nested texts', () => {
    expect(convertToLegacyNestedTexts(exampleInput as unknown as FixedLanguageList)).toEqual(expected);
  });
});
