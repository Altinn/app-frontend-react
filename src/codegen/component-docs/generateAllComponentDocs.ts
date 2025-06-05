import fs from 'fs/promises';

import { markdownCode, markdownTable, markdownTitle } from 'src/codegen/component-docs/markdown';
import { saveFile } from 'src/codegen/tools';
import type { ComponentProperty, PropList, PropObjectProperties, PropSimpleUnion, PropTexts } from 'src/codegen/types';

const langKeys = {
  nb: {
    property: 'Egenskap',
    type: 'Type',
    description: 'Beskrivelse',
    and: 'og',
    or: 'eller',
  },
  en: {
    property: 'Property',
    type: 'Type',
    description: 'Description',
    and: 'and',
    or: 'or',
  },
};

type Language = keyof typeof langKeys;
const languages = Object.keys(langKeys) as Language[];

// This type will break if one of the languages are missing keys. If you get 'never' here, check the definitions above.
type LangKeys = (typeof langKeys)['nb'] extends (typeof langKeys)['en']
  ? (typeof langKeys)['en'] extends (typeof langKeys)['nb']
    ? keyof (typeof langKeys)['nb']
    : never
  : never;

export function generateAllComponentDocs(propList: PropList, folder: string): Promise<unknown>[] {
  const promises: Promise<unknown>[] = [];

  for (const language of languages) {
    for (const compType of Object.keys(propList)) {
      const properties = propList[compType] as PropObjectProperties;
      const fullPath = `${folder}/${compType}.${language}.md`;
      promises.push(generateComponentDocs(compType, properties, language, fullPath));
    }
  }

  return promises;
}

function implode(array: string[], andOr: 'and' | 'or', lang: Language): string {
  if (array.length === 0) {
    return '';
  }
  if (array.length === 1) {
    return array[0];
  }
  return `${array.slice(0, -1).join(', ')} ${l(andOr, lang)} ${array[array.length - 1]}`;
}

function combineSimpleUnion(property: PropSimpleUnion, lang: Language): string {
  const parts: string[] = [];
  for (const t of property.types ?? []) {
    parts.push(markdownCode(t));
  }
  for (const e of property.enums ?? []) {
    parts.push(markdownCode(e === null ? 'null' : e === undefined ? 'undefined' : e.toString()));
  }
  for (const r of property.ranges ?? []) {
    parts.push(markdownCode(`${r.min}-${r.max}`));
  }
  return implode(parts, 'or', lang);
}

function generateTable(
  title: string,
  properties: PropObjectProperties,
  lang: Language,
  _otherTables: Record<string, string>,
): string {
  const tableRows: Record<string, string>[] = [];
  for (const propName of Object.keys(properties)) {
    const property = properties[propName] as ComponentProperty;
    // TODO: Generate more tables for complex unions and objects, add them to _otherTables

    if (property.type === 'simpleUnion') {
      tableRows.push({
        [l('property', lang)]: markdownCode(propName),
        [l('type', lang)]: combineSimpleUnion(property, lang),
        [l('description', lang)]: combineTitleDescription(property[lang]),
      });
    } else {
      tableRows.push({
        [l('property', lang)]: markdownCode(propName),
        [l('type', lang)]: markdownCode(property.type),
        [l('description', lang)]: combineTitleDescription(property[lang]),
      });
    }
  }

  return `${markdownTitle(title)}\n\n${markdownTable(tableRows)}`;
}

async function generateComponentDocs(
  title: string,
  properties: PropObjectProperties,
  lang: Language,
  fullPath: string,
): Promise<unknown> {
  const otherTables: Record<string, string> = {};
  const fileExisted = await fs
    .access(fullPath)
    .then(() => true)
    .catch(() => false);

  return saveFile(fullPath, generateTable(title, properties, lang, otherTables), undefined, fileExisted);
}

function combineTitleDescription(texts: PropTexts | undefined): string {
  if (texts?.title && texts?.description) {
    return `**${texts.title}**<br>${texts.description}`;
  }
  if (texts?.title) {
    return texts?.title;
  }
  if (texts?.description) {
    return texts.description;
  }
  return '';
}

function l(key: LangKeys, lang: Language): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (langKeys as any)[lang][key];
}
