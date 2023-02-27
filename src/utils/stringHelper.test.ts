import { getParsedLanguageFromText } from 'src/language/sharedLanguage';
import { capitalizeName, getLabelFromChildren } from 'src/utils/stringHelper';

describe('stringHelper', () => {
  it('can capitalize a name', () => {
    expect(capitalizeName('åge ågesen')).toEqual('Åge Ågesen');
    expect(capitalizeName('alf Prøysen')).toEqual('Alf Prøysen');
    expect(capitalizeName('alf  Prøysen ')).toEqual('Alf Prøysen');
    expect(capitalizeName('alf    Prøysen ')).toEqual('Alf Prøysen');
    expect(capitalizeName('  alf    prøysen ')).toEqual('Alf Prøysen');
    expect(capitalizeName('conan o’brien')).toEqual('Conan O’brien');
    expect(capitalizeName('robert conner, jr.')).toEqual('Robert Conner, Jr.');
    expect(capitalizeName('léonardo di caprio')).toEqual('Léonardo Di Caprio');
    expect(capitalizeName('" \'')).toEqual('" \'');
  });

  it('can get the inner child of an element as a string', () => {
    expect(getLabelFromChildren(getParsedLanguageFromText('<h1>This is my message</h1>'))).toEqual(
      'This is my message',
    );
    expect(getLabelFromChildren(getParsedLanguageFromText('<span>This is my message</span>'))).toEqual(
      'This is my message',
    );
    expect(getLabelFromChildren(getParsedLanguageFromText('<div><span>This is my message</span></div>'))).toEqual(
      'This is my message',
    );

    const myReactNode: React.ReactNode = getParsedLanguageFromText('<div><span>This is my message</span></div>');
    expect(getLabelFromChildren(myReactNode)).toEqual('This is my message');
  });
});
