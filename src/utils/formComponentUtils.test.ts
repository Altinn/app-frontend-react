import { staticUseLanguageForTests } from 'src/features/language/useLanguage';
import { getColumnStyles, getFieldName, gridBreakpoints, smartLowerCaseFirst } from 'src/utils/formComponentUtils';
import type { IGridStyling, ITableColumnProperties } from 'src/layout/common.generated';

describe('formComponentUtils', () => {
  describe('getFieldName', () => {
    const textResources = {
      title: { value: 'Component name' },
      short: { value: 'name' },
    };
    const mockLanguage = {
      form_filler: {
        error_required: 'Du må fylle ut {0}',
        address: 'Gateadresse',
        postPlace: 'Poststed',
        zipCode: 'Postnummer',
      },
      validation: {
        generic_field: 'dette feltet',
      },
    };
    const mockLangTools = staticUseLanguageForTests({ textResources, language: mockLanguage });

    it('should return field text from languages when fieldKey is present', () => {
      const result = getFieldName({ title: 'title' }, mockLangTools, 'address');
      expect(result).toEqual('gateadresse');
    });

    it('should return component shortName (textResourceBindings) when no fieldKey is present', () => {
      const result = getFieldName({ title: 'title', shortName: 'short' }, mockLangTools);
      expect(result).toEqual('name');
    });

    it('should return component title (textResourceBindings) when no shortName (textResourceBindings) and no fieldKey is present', () => {
      const result = getFieldName({ title: 'title' }, mockLangTools);
      expect(result).toEqual('component name');
    });

    it('should return generic field name when fieldKey, shortName and title are all not available', () => {
      const result = getFieldName({}, mockLangTools);
      expect(result).toEqual('dette feltet');
    });
  });

  describe('smartLowerCaseFirst', () => {
    it.each([
      { input: 'Fornavn', expected: 'fornavn' },
      { input: 'fornavn', expected: 'fornavn' },
      { input: 'Postnummer', expected: 'postnummer' },
      { input: 'AlfabeteT', expected: 'alfabeteT' },
      {
        input: 'Den dominikanske Republikk',
        expected: 'den dominikanske Republikk',
      },
      {
        input: 'Den Dominikanske Republikk',
        expected: 'Den Dominikanske Republikk',
      },
      { input: 'Sas', expected: 'sas' },
      { input: 'SAS', expected: 'SAS' },
      { input: 'SERIOUSLY', expected: 'SERIOUSLY' },
      { input: 'ÆØÅ', expected: 'ÆØÅ' },
      { input: 'Grünerløkka', expected: 'grünerløkka' },
      { input: 'D.o.B.', expected: 'D.o.B.' },
      { input: 'SaaB', expected: 'SaaB' },
      { input: 'S.a.a.B', expected: 'S.a.a.B' },
      { input: '¿Cómo te llamas?', expected: '¿cómo te llamas?' },
      { input: undefined, expected: undefined },
      { input: '', expected: '' },
    ])('Should convert $input to $expected', ({ input, expected }) => {
      expect(smartLowerCaseFirst(input)).toEqual(expected);
    });
  });

  describe('gridBreakpoints', () => {
    const defaultGrid: IGridStyling = {
      xs: 12,
    };
    it('should return default values when no params are passed', () => {
      const expected = { ...defaultGrid };
      const result = gridBreakpoints();
      expect(result).toEqual(expected);
    });

    it('should return xs value even if it is not passed', () => {
      const passValues: IGridStyling = { sm: 4, lg: 8 };
      const expected: IGridStyling = {
        ...defaultGrid,
        ...passValues,
      };
      const result = gridBreakpoints(passValues);
      expect(result).toEqual(expected);
    });

    it('should return all the sizes that are passed', () => {
      const passValues: IGridStyling = {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
      };
      const result = gridBreakpoints(passValues);
      expect(result).toEqual(passValues);
    });

    it('should not return sizes that not are passed, except xs', () => {
      const passValues: IGridStyling = {
        sm: 2,
        xl: 5,
      };
      const result = gridBreakpoints(passValues);
      expect(result.xs).toBe(12);
      expect(result.md).toBeUndefined();
      expect(result.lg).toBeUndefined();
    });
  });

  describe('getColumnStyles', () => {
    it('should return CSS properties object with correct values based on columnSettings', () => {
      const columnSettings: ITableColumnProperties = {
        width: '100px',
        textOverflow: { lineWrap: true, maxHeight: 3 },
        alignText: 'center',
      };
      const columnStyles = getColumnStyles(columnSettings);
      expect(columnStyles).toEqual({
        '--cell-max-number-of-lines': 3,
        '--cell-text-alignment': 'center',
        '--cell-width': '100px',
      });
    });

    it('should return CSS properties object with default value for "--cell-max-number-of-lines" if lineWrap is false', () => {
      const columnSettings: ITableColumnProperties = {
        width: '100px',
        textOverflow: { lineWrap: false, maxHeight: 3 },
        alignText: 'center',
      };
      const columnStyles = getColumnStyles(columnSettings);
      expect(columnStyles['--cell-max-number-of-lines']).toEqual(0);
    });
  });
});
