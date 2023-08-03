import type { JSONSchema7 } from 'json-schema';

import { CodeGenerator } from 'src/codegen/CodeGenerator';

type RawTypeScript = {
  typeScript: string;
};

type RawJsonSchema = {
  jsonSchema: JSONSchema7;
};

type RawDef = RawTypeScript | RawJsonSchema | (RawTypeScript & RawJsonSchema);

export class GenerateRaw extends CodeGenerator<any> {
  constructor(private readonly raw: RawDef) {
    super();
  }

  containsVariationDifferences(): boolean {
    return this.internal.source?.containsVariationDifferences() || false;
  }

  toJsonSchema(): JSONSchema7 {
    if (!('jsonSchema' in this.raw)) {
      throw new Error('Raw type does not have a jsonSchema');
    }

    return this.raw.jsonSchema;
  }

  toTypeScript(): string {
    if (!('typeScript' in this.raw)) {
      throw new Error('Raw type does not have a typeScript');
    }

    return this.raw.typeScript;
  }
}
